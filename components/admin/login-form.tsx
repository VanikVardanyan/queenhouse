"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    const supabase = createClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/admin/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-display text-2xl font-medium">Queen House Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Введите email для получения ссылки.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Отправляем…" : "Отправить ссылку"}
        </button>
        {status === "sent" && (
          <p className="text-sm text-primary">
            Ссылка отправлена на {email}. Откройте письмо и нажмите ссылку.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-500">Ошибка: {errorMsg}</p>
        )}
      </form>
    </div>
  );
}
