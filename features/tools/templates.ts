import type { Provider } from "@prisma/client";

export type ToolField = {
  name: string;
  label: string;
  type: "textarea" | "text" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type ToolTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: ToolField[];
  promptTemplate: string;
  defaultProvider: Provider;
  defaultModel: string;
  supportsStreaming: boolean;
};

export const toolTemplates: ToolTemplate[] = [
  {
    id: "writing-polish",
    name: "文案润色",
    category: "写作",
    description: "把粗糙草稿改成清晰、有说服力、适合发布的中文内容。",
    defaultProvider: "deepseek",
    defaultModel: "deepseek-chat",
    supportsStreaming: true,
    fields: [
      {
        name: "tone",
        label: "语气",
        type: "select",
        required: true,
        options: ["专业克制", "轻松自然", "销售转化", "小红书风格"]
      },
      {
        name: "content",
        label: "原始内容",
        type: "textarea",
        placeholder: "粘贴需要润色的草稿",
        required: true
      }
    ],
    promptTemplate:
      "你是一位中文资深编辑。请用「{{tone}}」语气润色下面内容，保持事实不变，输出可直接发布的版本：\n\n{{content}}"
  },
  {
    id: "translation",
    name: "多语言翻译",
    category: "翻译",
    description: "中英日韩等多语言互译，保留格式并解释关键词。",
    defaultProvider: "qwen",
    defaultModel: "qwen-plus",
    supportsStreaming: true,
    fields: [
      {
        name: "targetLanguage",
        label: "目标语言",
        type: "select",
        required: true,
        options: ["英文", "中文", "日文", "韩文", "西班牙文"]
      },
      {
        name: "content",
        label: "待翻译文本",
        type: "textarea",
        placeholder: "输入要翻译的内容",
        required: true
      }
    ],
    promptTemplate:
      "请把下面内容翻译成{{targetLanguage}}。要求：保留原有段落结构，专有名词准确，必要时在末尾补充 3 条翻译说明。\n\n{{content}}"
  },
  {
    id: "summary",
    name: "长文总结",
    category: "总结",
    description: "把文章、会议记录或资料压缩成结论、要点和行动项。",
    defaultProvider: "kimi",
    defaultModel: "moonshot-v1-32k",
    supportsStreaming: true,
    fields: [
      {
        name: "format",
        label: "输出格式",
        type: "select",
        required: true,
        options: ["要点列表", "管理层摘要", "行动项清单"]
      },
      {
        name: "content",
        label: "长文本",
        type: "textarea",
        placeholder: "粘贴文章、会议记录或资料",
        required: true
      }
    ],
    promptTemplate:
      "请把下面内容整理成「{{format}}」。要求先给一句话结论，再给结构化要点，避免遗漏数字和决策信息。\n\n{{content}}"
  },
  {
    id: "code-review",
    name: "代码审查",
    category: "代码",
    description: "检查 Bug、边界条件、安全风险和可维护性问题。",
    defaultProvider: "openai",
    defaultModel: "gpt-4o-mini",
    supportsStreaming: true,
    fields: [
      {
        name: "language",
        label: "语言/框架",
        type: "text",
        placeholder: "例如 TypeScript / Next.js",
        required: true
      },
      {
        name: "content",
        label: "代码片段",
        type: "textarea",
        placeholder: "粘贴需要审查的代码",
        required: true
      }
    ],
    promptTemplate:
      "你是一位资深工程师。请审查以下 {{language}} 代码，优先指出真实 bug、安全风险、性能问题和缺失测试。按严重程度排序，并给出修改建议。\n\n```{{language}}\n{{content}}\n```"
  },
  {
    id: "vision-prompt",
    name: "图片理解提示词",
    category: "视觉",
    description: "MVP 先生成图片分析提示词，后续接入多模态上传。",
    defaultProvider: "gemini",
    defaultModel: "gemini-1.5-flash",
    supportsStreaming: false,
    fields: [
      {
        name: "scene",
        label: "图片场景",
        type: "text",
        placeholder: "例如 电商商品图 / 设计稿 / 截图",
        required: true
      },
      {
        name: "goal",
        label: "分析目标",
        type: "textarea",
        placeholder: "描述你希望模型从图片里提取什么",
        required: true
      }
    ],
    promptTemplate:
      "请生成一个用于分析「{{scene}}」图片的多模态提示词。分析目标：{{goal}}。提示词需要包含观察维度、输出结构和注意事项。"
  }
];

export function getToolTemplate(id: string) {
  return toolTemplates.find((tool) => tool.id === id);
}

export function renderPrompt(
  template: string,
  values: Record<string, string | number | boolean>
) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(values[key] ?? "")
  );
}
