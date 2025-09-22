import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: { path?: string; maxAge?: number }) {
        cookieStore.set(name, value, { path: options.path ?? "/", maxAge: options.maxAge });
      },
      remove(name: string, options: { path?: string }) {
        cookieStore.delete({ name, path: options.path ?? "/" });
      }
    }
  });
}
