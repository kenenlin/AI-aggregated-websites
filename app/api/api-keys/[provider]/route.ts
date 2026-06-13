import type { Provider } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

const paramsSchema = z.object({
  provider: z.enum([
    "openai",
    "anthropic",
    "gemini",
    "deepseek",
    "qwen",
    "glm",
    "kimi",
    "siliconflow"
  ])
});

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) {
    return NextResponse.json({ error: "未知厂商" }, { status: 400 });
  }

  await prisma.apiKey.deleteMany({
    where: {
      userId: session.user.id,
      provider: parsed.data.provider as Provider
    }
  });

  return NextResponse.json({ ok: true });
}
