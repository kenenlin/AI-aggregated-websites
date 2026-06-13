import { describe, expect, it } from "vitest";
import { renderPrompt, toolTemplates } from "@/features/tools/templates";

describe("tool templates", () => {
  it("renders prompt variables", () => {
    const result = renderPrompt("翻译成{{lang}}：{{content}}", {
      lang: "英文",
      content: "你好"
    });

    expect(result).toBe("翻译成英文：你好");
  });

  it("ships with the expected MVP text tools", () => {
    expect(toolTemplates.map((tool) => tool.id)).toEqual([
      "writing-polish",
      "translation",
      "summary",
      "code-review",
      "vision-prompt"
    ]);
  });
});
