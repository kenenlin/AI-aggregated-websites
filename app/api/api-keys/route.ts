import type { Provider } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { encryptApiKey } from "@/lib/crypto/api-key";
import { prisma } from "@/lib/db/prisma";

const upsertSchema = z.object({
  provider: z.enum([
    "openai",
    "anthropic",
    "gemini",
    "deepseek",
    "qwen",
    "glm",
    "kimi",
    "siliconflow"
  ]),
  apiKey: z.string().min(8),
  label: z.string().max(40).optional()
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      provider: true,
      label: true,
      keyHint: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json(keys);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const parsed = upsertSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "密钥信息不完整" }, { status: 400 });
  }

  const encrypted = encryptApiKey(parsed.data.apiKey);
  const provider = parsed.data.provider as Provider;
  const key = await prisma.apiKey.upsert({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider
      }
    },
    update: {
      ...encrypted,
      label: parsed.data.label
    },
    create: {
      userId: session.user.id,
      provider,
      label: parsed.data.label,
      ...encrypted
    },
    select: {
      id: true,
      provider: true,
      label: true,
      keyHint: true,
      updatedAt: true
    }
  });

  return NextResponse.json(key);
}
