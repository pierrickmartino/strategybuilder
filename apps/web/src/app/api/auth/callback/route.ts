import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function resolveLocale(requestedLocale?: string | null) {
  if (!requestedLocale) {
    return "en";
  }
  return requestedLocale;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const consentAccepted = requestUrl.searchParams.get("consent") === "true";
  const locale = resolveLocale(requestUrl.searchParams.get("locale"));
  const redirectTarget = requestUrl.searchParams.get("next") ?? `/${locale}/strategies`;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const {
        data: userResult,
        error: userError
      } = await supabase.auth.getUser();
      const user = userError ? null : userResult?.user;

      if (user && !user.user_metadata?.accepted_simulation_only) {
        if (consentAccepted) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              accepted_simulation_only: true,
              accepted_simulation_only_at: new Date().toISOString()
            }
          });
          if (updateError) {
            const loginUrl = new URL(`/${locale}/login`, requestUrl.origin);
            loginUrl.searchParams.set("error", "consent-update-failed");
            loginUrl.searchParams.set("redirectTo", redirectTarget);
            return NextResponse.redirect(loginUrl);
          }
        } else {
          const loginUrl = new URL(`/${locale}/login`, requestUrl.origin);
          loginUrl.searchParams.set("error", "consent-required");
          loginUrl.searchParams.set("redirectTo", redirectTarget);
          return NextResponse.redirect(loginUrl);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(redirectTarget, requestUrl.origin));
}
