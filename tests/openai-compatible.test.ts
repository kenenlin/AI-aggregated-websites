import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenAICompatibleAdapter } from "@/features/providers/openai-compatible";

describe("OpenAI compatible adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps unified requests to chat completions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "ok" } }],
        usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createOpenAICompatibleAdapter({
      provider: "deepseek",
      label: "DeepSeek",
      baseUrl: "https://api.example.com/v1",
      models: ["deepseek-chat"]
    });

    const result = await adapter.createCompletion(
      {
        provider: "deepseek",
        model: "deepseek-chat",
        messages: [{ role: "user", content: "hello" }],
        temperature: 0.2,
        maxTokens: 512
      },
      "secret"
    );

    expect(result.text).toBe("ok");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer secret" }),
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: "hello" }],
          temperature: 0.2,
          max_tokens: 512,
          stream: false
        })
      })
    );
  });
});
