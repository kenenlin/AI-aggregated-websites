import type { Provider } from "@prisma/client";
import { anthropicAdapter } from "@/features/providers/anthropic";
import { geminiAdapter } from "@/features/providers/gemini";
import { createOpenAICompatibleAdapter } from "@/features/providers/openai-compatible";
import type { ProviderAdapter } from "@/features/providers/types";

export const providerAdapters: Record<Provider, ProviderAdapter> = {
  openai: createOpenAICompatibleAdapter({
    provider: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"]
  }),
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  deepseek: createOpenAICompatibleAdapter({
    provider: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner"]
  }),
  qwen: createOpenAICompatibleAdapter({
    provider: "qwen",
    label: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: ["qwen-plus", "qwen-max", "qwen-turbo"]
  }),
  glm: createOpenAICompatibleAdapter({
    provider: "glm",
    label: "智谱 GLM",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-4-plus", "glm-4-flash"]
  }),
  kimi: createOpenAICompatibleAdapter({
    provider: "kimi",
    label: "Moonshot / Kimi",
    baseUrl: "https://api.moonshot.cn/v1",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"]
  }),
  siliconflow: createOpenAICompatibleAdapter({
    provider: "siliconflow",
    label: "硅基流动",
    baseUrl: "https://api.siliconflow.cn/v1",
    models: ["Qwen/Qwen2.5-72B-Instruct", "deepseek-ai/DeepSeek-V3"]
  })
};

export const providerOptions = Object.values(providerAdapters).map((adapter) => ({
  value: adapter.provider,
  label: adapter.label,
  models: adapter.models
}));
