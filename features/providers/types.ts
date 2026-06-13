import type { Provider } from "@prisma/client";

export type AiRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiRole;
  content: string;
};

export type UnifiedModelRequest = {
  provider: Provider;
  model: string;
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  options?: Record<string, unknown>;
};

export type UnifiedModelResponse = {
  text: string;
  tokenUsage?: {
    input?: number;
    output?: number;
    total?: number;
  };
};

export type ProviderAdapter = {
  provider: Provider;
  label: string;
  models: string[];
  createCompletion(
    request: UnifiedModelRequest,
    apiKey: string
  ): Promise<UnifiedModelResponse>;
  streamCompletion?(
    request: UnifiedModelRequest,
    apiKey: string
  ): Promise<ReadableStream<Uint8Array>>;
};
