import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const registerSchema = z.object({
  name: z.string().min(1).max(40),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = await safeReadJson(request);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("注册信息不完整，请检查昵称、邮箱和密码。", 400);
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return jsonError("邮箱已注册，请直接登录。", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[register]", error);
    return jsonError(toRegisterError(error), 500);
  }
}

async function safeReadJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function toRegisterError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Can't reach database server")) {
    return "无法连接线上 PostgreSQL。请检查 Netlify 的 DATABASE_URL 是否正确、数据库是否允许公网访问。";
  }

  if (message.includes("Environment variable not found: DATABASE_URL")) {
    return "Netlify 没有配置 DATABASE_URL 环境变量。请在 Environment variables 中添加后重新部署。";
  }

  if (
    message.includes("The table") ||
    message.includes("does not exist") ||
    message.includes("relation") ||
    message.includes("P2021")
  ) {
    return "线上数据库还没有初始化表结构。请先对线上 DATABASE_URL 执行 npx prisma db push。";
  }

  if (message.includes("P2002")) {
    return "邮箱已注册，请直接登录。";
  }

  return `注册失败：${message.slice(0, 500)}`;
}
