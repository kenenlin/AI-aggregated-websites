import type {
  ProviderAdapter,
  UnifiedModelResponse
} from "@/features/providers/types";
import { configureServerProxy } from "@/lib/network/proxy";

export const anthropicAdapter: ProviderAdapter = {
  provider: "anthropic",
  label: "Anthropic",
  models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"],
  async createCompletion(request, apiKey) {
    configureServerProxy();
    const system = request.messages.find((message) => message.role === "system");
    const messages = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: request.model,
        system: system?.content,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1200
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    return normalizeAnthropicResponse(data);
  }
};

function normalizeAnthropicResponse(data: any): UnifiedModelResponse {
  return {
    text:
      data.content
        ?.map((block: { type: string; text?: string }) =>
          block.type === "text" ? block.text : ""
        )
        .join("") ?? "",
    tokenUsage: {
      input: data.usage?.input_tokens,
      output: data.usage?.output_tokens,
      total:
        data.usage?.input_tokens && data.usage?.output_tokens
          ? data.usage.input_tokens + data.usage.output_tokens
          : undefined
    }
  };
}
