"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  });
}
