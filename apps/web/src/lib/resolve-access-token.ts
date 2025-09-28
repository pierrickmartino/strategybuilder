import type { Session, SupabaseClient } from "@supabase/supabase-js";

export async function resolveAccessToken(
  session: Session | null,
  supabase: SupabaseClient
): Promise<string> {
  if (session?.access_token) {
    return session.access_token;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("Missing Supabase access token");
  }
  return accessToken;
}

