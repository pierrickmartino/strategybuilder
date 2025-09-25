import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PROTECTED_PATHS = [/\/[^/]+\/strategies/];
const AUTH_PATH = /\/[^/]+\/login$/;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing");
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        const cookieOptions = { ...options, path: options.path ?? "/" };
        request.cookies.set({ name, value, ...cookieOptions });
        response.cookies.set({ name, value, ...cookieOptions });
      },
      remove(name: string, options: CookieOptions) {
        const cookieOptions = { ...options, path: options.path ?? "/" };
        request.cookies.set({ name, value: "", ...cookieOptions, maxAge: 0 });
        response.cookies.set({ name, value: "", ...cookieOptions, maxAge: 0 });
      }
    }
  });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const locale = pathname.split("/")[1] || "en";
  const isProtectedRoute = PROTECTED_PATHS.some((pattern) => pattern.test(pathname));

  if (!session && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && AUTH_PATH.test(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/strategies`;
    redirectUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
