"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (isRegister) {
      setError("注册成功！请登录～");
      setIsRegister(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">
            SkillPlan
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            {isRegister ? "开始你的学习旅程吧～" : "欢迎回来，今天也要加油哦～"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm text-center text-[var(--danger)]">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : isRegister ? "注册" : "登录"}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-4">
          {isRegister ? "已经有账号了？" : "还没有账号？"}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="ml-1 text-[var(--primary)] hover:underline"
          >
            {isRegister ? "去登录" : "来注册"}
          </button>
        </p>
      </div>
    </div>
  );
}
