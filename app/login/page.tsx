"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, Fingerprint, KeyRound, Layers3, ShieldCheck, Sparkles } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setPending(false);

    if (result?.error) {
      setError("邮箱或密码不正确");
      return;
    }

    router.push("/workspace");
  }

  return (
    <main className="aurora-page min-h-screen px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="flex flex-col justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="brand-mark flex size-13 items-center justify-center rounded-2xl text-slate-950">
              <Bot />
            </div>
            <div>
              <p className="text-2xl font-black tracking-normal">聚合AI工坊</p>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-100/65">
                Model Control Center
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge className="border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                自带 API Key
              </Badge>
              <Badge className="border-fuchsia-200/20 bg-fuchsia-300/10 text-fuchsia-100">
                多模型统一调用
              </Badge>
            </div>
            <h1 className="neon-text text-5xl font-black leading-tight tracking-normal md:text-6xl">
              一个入口，点亮你的 AI 工具星图。
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              管理 OpenAI、DeepSeek、通义千问、Kimi、Gemini 等厂商密钥，
              把写作、翻译、总结、代码审查沉淀成更炫也更顺手的工作流。
            </p>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["密钥隔离", KeyRound, "服务端加密存储"],
              ["模板驱动", Layers3, "工具快速扩展"],
              ["安全调用", ShieldCheck, "前端不碰明文"]
            ].map(([label, Icon, desc]) => (
              <div key={label as string} className="neon-card rounded-2xl p-4">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-fuchsia-300 text-slate-950">
                  <Icon />
                </div>
                <p className="text-sm font-black">{label as string}</p>
                <p className="mt-1 text-xs text-slate-300">{desc as string}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <Card className="glass-panel w-full overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-white/10 bg-white/[0.035]">
              <div className="mb-3 flex items-center justify-between">
                <Badge variant="accent" className="bg-amber-300 text-slate-950">
                  Access Portal
                </Badge>
                <Fingerprint className="text-cyan-200" />
              </div>
              <CardTitle className="text-3xl font-black">登录工作台</CardTitle>
              <CardDescription className="text-slate-300">
                使用你的账号进入 AI 工具控制台
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-slate-200">
                    邮箱
                  </Label>
                  <Input
                    id="email"
                    className="field-glow h-12 rounded-xl"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-slate-200">
                    密码
                  </Label>
                  <Input
                    id="password"
                    className="field-glow h-12 rounded-xl"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="至少 8 位"
                    required
                  />
                </div>
                {error ? <p className="text-sm text-rose-200">{error}</p> : null}
                <Button
                  className="chrome-button h-12 rounded-xl text-base font-black text-slate-950"
                  disabled={pending}
                  type="submit"
                >
                  <Sparkles data-icon="inline-start" />
                  {pending ? "登录中..." : "登录"}
                </Button>
              </form>
              <p className="mt-5 text-sm text-slate-300">
                还没有账号？{" "}
                <Link className="font-bold text-cyan-200 hover:text-cyan-100" href="/register">
                  立即注册
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
