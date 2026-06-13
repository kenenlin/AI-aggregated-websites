import type {
  ProviderAdapter,
  UnifiedModelRequest,
  UnifiedModelResponse
} from "@/features/providers/types";
import { configureServerProxy } from "@/lib/network/proxy";

export const geminiAdapter: ProviderAdapter = {
  provider: "gemini",
  label: "Google Gemini",
  models: ["gemini-1.5-pro", "gemini-1.5-flash"],
  async createCompletion(request, apiKey) {
    configureServerProxy();
    const contents = toGeminiContents(request);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 1200
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    return normalizeGeminiResponse(data);
  }
};

function toGeminiContents(request: UnifiedModelRequest) {
  const system = request.messages.find((message) => message.role === "system");
  const content = request.messages
    .filter((message) => message.role !== "system")
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n\n");

  return [
    {
      role: "user",
      parts: [{ text: [system?.content, content].filter(Boolean).join("\n\n") }]
    }
  ];
}

function normalizeGeminiResponse(data: any): UnifiedModelResponse {
  return {
    text:
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? "")
        .join("") ?? "",
    tokenUsage: {
      input: data.usageMetadata?.promptTokenCount,
      output: data.usageMetadata?.candidatesTokenCount,
      total: data.usageMetadata?.totalTokenCount
    }
  };
}
