import type {
  ProviderAdapter,
  UnifiedModelResponse
} from "@/features/providers/types";
import { configureServerProxy } from "@/lib/network/proxy";

type OpenAICompatibleOptions = {
  provider: ProviderAdapter["provider"];
  label: string;
  baseUrl: string;
  models: string[];
};

export function createOpenAICompatibleAdapter({
  provider,
  label,
  baseUrl,
  models
}: OpenAICompatibleOptions): ProviderAdapter {
  return {
    provider,
    label,
    models,
    async createCompletion(request, apiKey) {
      configureServerProxy();
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1200,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(await getProviderError(response));
      }

      const data = await response.json();
      return normalizeOpenAIResponse(data);
    },
    async streamCompletion(request, apiKey) {
      configureServerProxy();
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1200,
          stream: true
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(await getProviderError(response));
      }

      return response.body;
    }
  };
}

function normalizeOpenAIResponse(data: any): UnifiedModelResponse {
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    tokenUsage: {
      input: data.usage?.prompt_tokens,
      output: data.usage?.completion_tokens,
      total: data.usage?.total_tokens
    }
  };
}

async function getProviderError(response: Response) {
  const text = await response.text();
  return `Provider request failed: ${response.status} ${text.slice(0, 500)}`;
}
