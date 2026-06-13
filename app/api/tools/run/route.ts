import type { Provider } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { providerAdapters } from "@/features/providers";
import { getToolTemplate, renderPrompt } from "@/features/tools/templates";
import { auth } from "@/lib/auth/config";
import { decryptApiKey } from "@/lib/crypto/api-key";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit/memory";

const runToolSchema = z.object({
  toolId: z.string(),
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
  model: z.string().min(1),
  inputs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(128).max(8000).optional(),
  stream: z.boolean().optional()
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("请先登录后再运行工具。", 401);
    }

    const limit = checkRateLimit(`tool:${session.user.id}`, 20, 60_000);
    if (!limit.ok) {
      return jsonError("请求过于频繁，请稍后再试。", 429);
    }

    const body = await safeReadJson(request);
    const parsed = runToolSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("工具参数不完整，请检查输入内容、厂商和模型。", 400);
    }

    const template = getToolTemplate(parsed.data.toolId);
    if (!template) {
      return jsonError("工具不存在，请刷新页面后重试。", 404);
    }

    const missingField = template.fields.find(
      (field) => field.required && !parsed.data.inputs[field.name]
    );
    if (missingField) {
      return jsonError(`请填写：${missingField.label}`, 400);
    }

    const provider = parsed.data.provider as Provider;
    const adapter = providerAdapters[provider];
    const keyRecord = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider
        }
      }
    });

    if (!keyRecord) {
      return jsonError("请先在 API Key 管理中配置该厂商密钥。", 400);
    }

    const apiKey = decryptApiKey(keyRecord);
    const prompt = renderPrompt(template.promptTemplate, parsed.data.inputs);
    const startedAt = Date.now();
    const result = await adapter.createCompletion(
      {
        provider,
        model: parsed.data.model,
        messages: [
          {
            role: "system",
            content:
              "你是聚合AI工坊中的专业 AI 工具。请用中文输出，结构清晰，可直接复制使用。"
          },
          { role: "user", content: prompt }
        ],
        temperature: parsed.data.temperature,
        maxTokens: parsed.data.maxTokens
      },
      apiKey
    );

    if (!result.text.trim()) {
      return jsonError(
        "模型调用成功但没有返回文本。请换一个模型，或检查该厂商是否支持当前请求格式。",
        502
      );
    }

    const history = await prisma.toolHistory.create({
      data: {
        userId: session.user.id,
        toolId: template.id,
        toolName: template.name,
        provider,
        model: parsed.data.model,
        input: parsed.data.inputs,
        output: result.text,
        latencyMs: Date.now() - startedAt,
        tokenUsage: result.tokenUsage ?? undefined
      }
    });

    return NextResponse.json({
      id: history.id,
      output: result.text,
      tokenUsage: result.tokenUsage,
      latencyMs: history.latencyMs
    });
  } catch (error) {
    console.error("[tools/run]", error);
    return jsonError(toUserFacingError(error), 500);
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

function toUserFacingError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.slice(0, 600);

    if (message.includes("fetch failed")) {
      return "无法连接到模型厂商接口，请检查网络、代理或厂商服务状态。";
    }

    if (message.includes("401") || message.includes("Unauthorized")) {
      return "模型厂商拒绝了请求，请检查 API Key 是否正确、是否有权限访问该模型。";
    }

    if (message.includes("403") || message.includes("Forbidden")) {
      return "当前 API Key 没有访问该模型的权限，请更换模型或检查厂商控制台权限。";
    }

    if (
      message.includes("402") ||
      message.includes("Insufficient Balance") ||
      message.includes("insufficient_quota") ||
      message.includes("余额不足")
    ) {
      return "模型厂商账号余额不足或额度已用完。请到对应厂商控制台充值、检查套餐额度，或更换一个有余额的 API Key。";
    }

    if (message.includes("429")) {
      return "模型厂商返回限流，请稍后再试或降低请求频率。";
    }

    return `模型调用失败：${message}`;
  }

  return "模型调用失败，请稍后重试。";
}
