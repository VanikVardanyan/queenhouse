"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL_DOMAIN } from "@/lib/supabase/types";

export function LoginForm() {
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setErrorMsg("Supabase կարգավորված չէ։ Ստուգեք env-փոփոխականները Vercel-ում։");
      return;
    }
    const email = `${login.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setStatus("error");
      setErrorMsg("Սխալ մուտքանուն կամ գաղտնաբառ");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-display text-2xl font-medium">Queen House Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Մուտք գործեք ադմինի վահանակ։</p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Մուտքանուն</span>
          <input
            type="text"
            required
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Գաղտնաբառ</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Մուտք գործում ենք…" : "Մուտք գործել"}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-500">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
