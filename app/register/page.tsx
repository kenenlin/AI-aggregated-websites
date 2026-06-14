"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Rocket, Sparkles } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setPending(false);

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error ?? "注册失败");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="aurora-page flex min-h-screen items-center justify-center px-6 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden flex-col justify-center gap-5 lg:flex">
          <div className="flex items-center gap-3">
            <div className="brand-mark flex size-12 items-center justify-center rounded-2xl">
              <img src="/brand-icon.png" alt="" className="size-full rounded-2xl object-cover" />
            </div>
            <div>
              <p className="text-2xl font-black">聚合AI工坊</p>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/65">
                Launch a toolbox
              </p>
            </div>
          </div>
          <h1 className="neon-text text-5xl font-black leading-tight tracking-normal">
            创建你的专属 AI 调度舱。
          </h1>
          <p className="max-w-lg text-lg leading-8 text-slate-300">
            注册后即可进入工作台，配置自己的模型厂商 API Key，并开始运行工具模板。
          </p>
          <div className="neon-card rounded-3xl p-5">
            <p className="mb-3 text-sm font-black text-white">MVP 已准备</p>
            <div className="grid gap-3 text-sm text-slate-300">
              <span>多厂商密钥管理</span>
              <span>工具模板执行</span>
              <span>历史记录追踪</span>
            </div>
          </div>
        </section>

        <Card className="glass-panel overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-white/10 bg-white/[0.035]">
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="accent" className="bg-amber-300 text-slate-950">
                New Pilot
              </Badge>
              <Rocket className="text-fuchsia-200" />
            </div>
            <CardTitle className="text-3xl font-black">创建账号</CardTitle>
            <CardDescription className="text-slate-300">
              注册后即可配置自己的模型厂商 API Key
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-slate-200">
                  昵称
                </Label>
                <Input
                  id="name"
                  className="field-glow h-12 rounded-xl"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-slate-200">
                  邮箱
                </Label>
                <Input
                  id="email"
                  className="field-glow h-12 rounded-xl"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
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
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  minLength={8}
                  required
                />
              </div>
              {message ? <p className="text-sm text-rose-200">{message}</p> : null}
              <Button
                className="chrome-button h-12 rounded-xl text-base font-black text-slate-950"
                disabled={pending}
                type="submit"
              >
                <Sparkles data-icon="inline-start" />
                {pending ? "创建中..." : "注册"}
              </Button>
            </form>
            <p className="mt-5 text-sm text-slate-300">
              已有账号？{" "}
              <Link className="font-bold text-cyan-200 hover:text-cyan-100" href="/login">
                去登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
