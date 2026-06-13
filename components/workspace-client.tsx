"use client";

import type { Provider } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Code2,
  FileText,
  History,
  KeyRound,
  Languages,
  LogOut,
  PenLine,
  Settings2,
  Sparkles,
  Trash2,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ToolTemplate } from "@/features/tools/templates";
import { cn } from "@/lib/utils";

type ProviderOption = {
  value: Provider;
  label: string;
  models: string[];
};

type ApiKeyRecord = {
  id: string;
  provider: Provider;
  label?: string | null;
  keyHint: string;
  updatedAt: string;
};

type HistoryRecord = {
  id: string;
  toolName: string;
  provider: Provider;
  model: string;
  output: string;
  latencyMs: number;
  createdAt: string;
};

const toolIcons: Record<string, React.ElementType> = {
  "writing-polish": PenLine,
  translation: Languages,
  summary: FileText,
  "code-review": Code2,
  "vision-prompt": Sparkles
};

const iconGradients = [
  "from-cyan-300 to-teal-300",
  "from-fuchsia-300 to-pink-300",
  "from-amber-200 to-orange-300",
  "from-sky-300 to-indigo-300",
  "from-lime-200 to-cyan-300"
];

export function WorkspaceClient({
  userName,
  tools,
  providers
}: {
  userName: string;
  tools: ToolTemplate[];
  providers: ProviderOption[];
}) {
  const queryClient = useQueryClient();
  const [activeToolId, setActiveToolId] = useState(tools[0]?.id ?? "");
  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? tools[0];
  const [provider, setProvider] = useState<Provider>(activeTool.defaultProvider);
  const currentProvider =
    providers.find((item) => item.value === provider) ?? providers[0];
  const [model, setModel] = useState(activeTool.defaultModel);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1200);
  const [output, setOutput] = useState("");
  const [notice, setNotice] = useState("");

  const apiKeysQuery = useQuery<ApiKeyRecord[]>({
    queryKey: ["api-keys"],
    queryFn: () => fetchJson("/api/api-keys")
  });

  const historyQuery = useQuery<HistoryRecord[]>({
    queryKey: ["history"],
    queryFn: () => fetchJson("/api/history")
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      setOutput("");
      setNotice("");
      return fetchJson<{ output: string; latencyMs: number }>("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: activeTool.id,
          provider,
          model,
          inputs,
          temperature,
          maxTokens,
          stream: false
        })
      });
    },
    onSuccess(data) {
      setOutput(data.output);
      setNotice(`完成，用时 ${data.latencyMs}ms`);
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError(error) {
      setNotice(error instanceof Error ? error.message : "执行失败");
    }
  });

  const configuredProviders = useMemo(
    () => new Set(apiKeysQuery.data?.map((key) => key.provider)),
    [apiKeysQuery.data]
  );

  function selectTool(tool: ToolTemplate) {
    setActiveToolId(tool.id);
    setProvider(tool.defaultProvider);
    setModel(tool.defaultModel);
    setInputs({});
    setOutput("");
    setNotice("");
  }

  function selectProvider(nextProvider: Provider) {
    const next = providers.find((item) => item.value === nextProvider);
    setProvider(nextProvider);
    setModel(next?.models[0] ?? "");
  }

  return (
    <main className="aurora-page min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="relative border-r border-white/10 bg-[#060a1d]/75 px-5 py-6 shadow-2xl backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-5 top-5 h-28 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative mb-8 flex items-center gap-3">
            <div className="brand-mark flex size-12 items-center justify-center rounded-2xl text-slate-950">
              <Bot />
            </div>
            <div>
              <p className="text-lg font-black tracking-normal">聚合AI工坊</p>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/65">
                AI Toolbox Hub
              </p>
            </div>
          </div>

          <nav className="relative flex flex-col gap-2">
            {["工具广场", "密钥管理", "历史记录", "用户设置"].map((item, index) => {
              const icons = [Sparkles, KeyRound, History, Settings2];
              const Icon = icons[index];
              return (
                <a
                  key={item}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-cyan-50/72 transition-all hover:border-cyan-200/20 hover:bg-white/10 hover:text-white hover:shadow-[0_0_26px_rgba(40,240,213,0.14)]"
                  href={`#${index === 0 ? "tools" : index === 1 ? "keys" : index === 2 ? "history" : "settings"}`}
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white/8 text-cyan-200 transition-colors group-hover:bg-cyan-300/20 group-hover:text-cyan-100">
                    <Icon />
                  </span>
                  {item}
                </a>
              );
            })}
          </nav>

          <Separator className="my-7 bg-white/10" />

          <div className="relative flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Provider Matrix
            </p>
            {providers.map((item) => {
              const ready = configuredProviders.has(item.value);
              return (
                <div
                  key={item.value}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-sm"
                >
                  <span className="text-slate-100/86">{item.label}</span>
                  {ready ? (
                    <span className="flex items-center gap-1.5 text-cyan-200">
                      <CheckCircle2 />
                      已配
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-slate-300">
                      未配
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[#070b1f]/72 px-6 py-5 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                    Live Console
                  </Badge>
                  <Badge variant="secondary" className="border-fuchsia-200/20 bg-fuchsia-300/10 text-fuchsia-100">
                    BYOK 安全模式
                  </Badge>
                </div>
                <h1 className="neon-text text-3xl font-black tracking-normal md:text-4xl">
                  AI 工具工作台
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  当前用户：{userName}，所有模型调用都使用你自己的 API Key。
                </p>
              </div>
              <Button
                variant="outline"
                className="border-white/15 bg-white/8 text-white hover:bg-white/14"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut data-icon="inline-start" />
                退出
              </Button>
            </div>
          </header>

          <div className="grid gap-6 p-6 xl:grid-cols-[1fr_440px]">
            <div className="flex min-w-0 flex-col gap-7">
              <section id="tools" className="flex flex-col gap-4">
                <SectionHeading
                  eyebrow="Tool Galaxy"
                  title="工具广场"
                  description="模板驱动的 AI 工具星图，选择场景后右侧控制台会自动装载参数。"
                  action={`${tools.length} 个 MVP 工具`}
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {tools.map((tool, index) => {
                    const Icon = toolIcons[tool.id] ?? Sparkles;
                    const active = activeTool.id === tool.id;
                    return (
                      <button
                        key={tool.id}
                        data-active={active}
                        className={cn(
                          "neon-card group rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(40,240,213,0.12)]",
                          active && "gradient-ring shadow-[0_24px_90px_rgba(255,87,178,0.18)]"
                        )}
                        onClick={() => selectTool(tool)}
                      >
                        <div className="relative mb-5 flex items-center justify-between">
                          <div
                            className={cn(
                              "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-slate-950 shadow-lg",
                              iconGradients[index % iconGradients.length]
                            )}
                          >
                            <Icon />
                          </div>
                          <Badge
                            variant="secondary"
                            className="border-white/10 bg-white/10 text-slate-100"
                          >
                            {tool.category}
                          </Badge>
                        </div>
                        <h3 className="relative text-lg font-black tracking-normal text-white">
                          {tool.name}
                        </h3>
                        <p className="relative mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                          {tool.description}
                        </p>
                        <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 opacity-80" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <ApiKeyManager providers={providers} />

              <section id="history" className="flex flex-col gap-4">
                <SectionHeading
                  eyebrow="Run Memory"
                  title="历史记录"
                  description="保存工具、模型、输入输出和耗时，不保存明文 API Key。"
                />
                <div className="grid gap-3">
                  {(historyQuery.data ?? []).slice(0, 6).map((item) => (
                    <Card key={item.id} className="neon-card rounded-2xl">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle>{item.toolName}</CardTitle>
                            <CardDescription className="text-slate-300">
                              {item.provider} / {item.model} / {item.latencyMs}ms
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-white/10 text-slate-100">
                            {new Date(item.createdAt).toLocaleString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-sm leading-6 text-slate-300">
                          {item.output}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  {historyQuery.data?.length === 0 ? (
                    <Card className="neon-card rounded-2xl">
                      <CardContent className="pt-5 text-sm text-slate-300">
                        暂无历史记录，完成一次工具调用后会出现在这里。
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              </section>
            </div>

            <aside className="xl:sticky xl:top-28 xl:self-start">
              <Card className="glass-panel overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-white/10 bg-white/[0.035]">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="accent" className="bg-amber-300 text-slate-950">
                      Active Tool
                    </Badge>
                    <Zap className="text-amber-200" />
                  </div>
                  <CardTitle className="text-2xl font-black">{activeTool.name}</CardTitle>
                  <CardDescription className="text-slate-300">
                    {activeTool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldSelect
                      id="provider"
                      label="厂商"
                      value={provider}
                      onChange={(value) => selectProvider(value as Provider)}
                      options={providers.map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                    />
                    <FieldSelect
                      id="model"
                      label="模型"
                      value={model}
                      onChange={setModel}
                      options={currentProvider.models.map((item) => ({
                        value: item,
                        label: item
                      }))}
                    />
                  </div>

                  {activeTool.fields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-2">
                      <Label htmlFor={field.name} className="text-slate-200">
                        {field.label}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          className="field-glow min-h-52 resize-y rounded-2xl"
                          value={inputs[field.name] ?? ""}
                          onChange={(event) =>
                            setInputs({ ...inputs, [field.name]: event.target.value })
                          }
                          placeholder={field.placeholder}
                          rows={7}
                        />
                      ) : field.type === "select" ? (
                        <select
                          id={field.name}
                          className="field-glow h-11 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={inputs[field.name] ?? field.options?.[0] ?? ""}
                          onChange={(event) =>
                            setInputs({ ...inputs, [field.name]: event.target.value })
                          }
                        >
                          {field.options?.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id={field.name}
                          className="field-glow h-11 rounded-xl"
                          value={inputs[field.name] ?? ""}
                          onChange={(event) =>
                            setInputs({ ...inputs, [field.name]: event.target.value })
                          }
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="temperature" className="text-slate-200">
                        温度
                      </Label>
                      <Input
                        id="temperature"
                        className="field-glow h-11 rounded-xl"
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={temperature}
                        onChange={(event) => setTemperature(Number(event.target.value))}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="maxTokens" className="text-slate-200">
                        最大 Tokens
                      </Label>
                      <Input
                        id="maxTokens"
                        className="field-glow h-11 rounded-xl"
                        type="number"
                        min={128}
                        max={8000}
                        step={128}
                        value={maxTokens}
                        onChange={(event) => setMaxTokens(Number(event.target.value))}
                      />
                    </div>
                  </div>

                  <Button
                    className="chrome-button h-12 rounded-xl text-base font-black text-slate-950 hover:opacity-95"
                    disabled={runMutation.isPending}
                    onClick={() => runMutation.mutate()}
                  >
                    <Sparkles data-icon="inline-start" />
                    {runMutation.isPending ? "生成中..." : "运行工具"}
                  </Button>

                  {notice ? <p className="text-sm text-cyan-100">{notice}</p> : null}

                  <div className="min-h-64 rounded-2xl border border-white/10 bg-black/24 p-4 shadow-inner">
                    <p className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                      <span className="status-dot size-2 rounded-full bg-cyan-300 text-cyan-300" />
                      输出预览
                    </p>
                    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {output || "运行工具后，模型输出会显示在这里。"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function ApiKeyManager({ providers }: { providers: ProviderOption[] }) {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<Provider>(providers[0].value);
  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");
  const keysQuery = useQuery<ApiKeyRecord[]>({
    queryKey: ["api-keys"],
    queryFn: () => fetchJson("/api/api-keys")
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      fetchJson("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, label })
      }),
    onSuccess() {
      setApiKey("");
      setMessage("密钥已加密保存");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError(error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (target: Provider) =>
      fetchJson(`/api/api-keys/${target}`, { method: "DELETE" }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    }
  });

  return (
    <section id="keys" className="flex flex-col gap-4">
      <SectionHeading
        eyebrow="Encrypted Vault"
        title="API Key 管理"
        description="密钥只在服务端加密存储，前端只显示脱敏片段。"
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="neon-card rounded-2xl">
          <CardHeader>
            <CardTitle>新增或更新密钥</CardTitle>
            <CardDescription className="text-slate-300">
              同一厂商每个用户保留一条当前可用密钥
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FieldSelect
              id="key-provider"
              label="厂商"
              value={provider}
              onChange={(value) => setProvider(value as Provider)}
              options={providers.map((item) => ({
                value: item.value,
                label: item.label
              }))}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="key-label" className="text-slate-200">
                备注
              </Label>
              <Input
                id="key-label"
                className="field-glow h-11 rounded-xl"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="例如 个人 OpenAI Key"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="api-key" className="text-slate-200">
                API Key
              </Label>
              <Input
                id="api-key"
                className="field-glow h-11 rounded-xl"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="粘贴厂商 API Key"
              />
            </div>
            <Button
              className="chrome-button rounded-xl font-black text-slate-950"
              disabled={saveMutation.isPending || apiKey.length < 8}
              onClick={() => saveMutation.mutate()}
            >
              <KeyRound data-icon="inline-start" />
              {saveMutation.isPending ? "保存中..." : "加密保存"}
            </Button>
            {message ? <p className="text-sm text-cyan-100">{message}</p> : null}
          </CardContent>
        </Card>

        <Card className="neon-card rounded-2xl">
          <CardHeader>
            <CardTitle>已配置密钥</CardTitle>
            <CardDescription className="text-slate-300">
              列表不会暴露明文密钥
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(keysQuery.data ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-white">
                    {providers.find(
                      (providerItem) => providerItem.value === item.provider
                    )?.label ?? item.provider}
                  </p>
                  <p className="text-xs text-slate-300">
                    {item.label || "未备注"} / {item.keyHint}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:bg-rose-400/15 hover:text-rose-200"
                  onClick={() => deleteMutation.mutate(item.provider)}
                  aria-label="删除密钥"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {keysQuery.data?.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm text-slate-300">
                还没有配置密钥。添加后即可运行对应厂商模型。
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-xs font-black uppercase tracking-[0.24em] text-cyan-200/70">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-black tracking-normal text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      </div>
      {action ? (
        <Badge variant="secondary" className="bg-white/10 text-slate-100">
          {action}
        </Badge>
      ) : null}
    </div>
  );
}

function FieldSelect({
  id,
  label,
  value,
  options,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-slate-200">
        {label}
      </Label>
      <select
        id={id}
        className="field-glow h-11 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const text = await response.text();
  const data = text ? safeParseJson(text) : null;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data) ||
        text.slice(0, 300) ||
        `请求失败，状态码：${response.status}`
    );
  }

  if (data === null) {
    throw new Error("服务端返回了空响应，请稍后重试。");
  }

  return data as T;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getErrorMessage(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return null;
}
