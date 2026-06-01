"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Strip BOM (U+FEFF) that may sneak in via Vercel CLI pipe encoding
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/﻿/g, "")
  );
}
