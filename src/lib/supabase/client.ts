"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function cleanEnv(value: string | undefined): string {
  return (value ?? "").replace(/﻿/g, "");
}

export function createClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return createSupabaseClient(url, key);
}
