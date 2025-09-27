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

  if (!code) {
    return NextResponse.redirect(new URL(redirectTarget, requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL(redirectTarget, requestUrl.origin));
  }

  const {
    data: userResult,
    error: userError
  } = await supabase.auth.getUser();
  const user = userError ? null : userResult?.user;

  if (!user || user.user_metadata?.accepted_simulation_only) {
    return NextResponse.redirect(new URL(redirectTarget, requestUrl.origin));
  }

  const buildLoginRedirect = (errorCode: string) => {
    const loginUrl = new URL(`/${locale}/login`, requestUrl.origin);
    loginUrl.searchParams.set("error", errorCode);
    loginUrl.searchParams.set("redirectTo", redirectTarget);
    return NextResponse.redirect(loginUrl);
  };

  if (!consentAccepted) {
    return buildLoginRedirect("consent-required");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      accepted_simulation_only: true,
      accepted_simulation_only_at: new Date().toISOString()
    }
  });

  if (updateError) {
    return buildLoginRedirect("consent-update-failed");
  }

  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    return buildLoginRedirect("session-refresh-failed");
  }

  return NextResponse.redirect(new URL(redirectTarget, requestUrl.origin));
}
