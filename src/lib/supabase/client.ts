"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let cachedClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "sb-skillplan-auth-token",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    }
  );
  return cachedClient;
}
