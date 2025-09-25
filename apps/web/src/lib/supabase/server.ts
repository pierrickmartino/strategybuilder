import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

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
      set(name: string, value: string, options?: CookieOptions) {
        const cookieOptions = { ...options, path: options?.path ?? "/" };
        cookieStore.set({ name, value, ...cookieOptions });
      },
      remove(name: string, options?: CookieOptions) {
        const cookieOptions = { ...options, path: options?.path ?? "/" };
        cookieStore.set({ name, value: "", ...cookieOptions, maxAge: 0 });
      }
    }
  });
}
