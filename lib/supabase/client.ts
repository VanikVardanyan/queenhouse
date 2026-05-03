"use client";

import { createBrowserClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.warn("[supabase] env vars missing — returning null client");
    }
    return null;
  }
  cached = createBrowserClient(url, key);
  return cached;
}

// Re-export for callers that import CookieOptions through here
export type { CookieOptions };
