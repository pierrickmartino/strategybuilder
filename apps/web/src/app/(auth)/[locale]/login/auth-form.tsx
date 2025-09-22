"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const OAUTH_PROVIDER = "google";

type Mode = "sign-in" | "sign-up";

type AuthFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export default function AuthForm({ locale, dictionary }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabaseClient();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(
    () => searchParams.get("redirectTo") ?? `/${locale}/strategies`,
    [locale, searchParams]
  );

  const handleOAuthSignIn = async () => {
    setError(null);
    setStatusMessage(dictionary.messages.redirectingForOAuth);

    const origin = window.location.origin;
    const callbackUrl = new URL("/api/auth/callback", origin).toString();

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: OAUTH_PROVIDER,
      options: {
        redirectTo: callbackUrl,
        scopes: "email"
      }
    });

    if (oauthError) {
      setError(oauthError.message);
      setStatusMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!email || !password) {
      setError(dictionary.messages.missingCredentials);
      return;
    }

    if (mode === "sign-up" && !consent) {
      setError(dictionary.messages.consentRequired);
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            data: {
              accepted_simulation_only: true,
              accepted_simulation_only_at: new Date().toISOString()
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        setStatusMessage(dictionary.messages.verifyEmail);
        setMode("sign-in");
        return;
      }

      const {
        data: { user },
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      if (!user?.user_metadata?.accepted_simulation_only) {
        setError(dictionary.messages.consentRequired);
        await supabase.auth.signOut();
        return;
      }

      setStatusMessage(dictionary.messages.successRedirect);
      router.push(redirectPath);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : dictionary.messages.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-100">{dictionary.heading}</h1>
          <p className="text-sm text-slate-400">{dictionary.subheading}</p>
        </header>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleOAuthSignIn}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-400 hover:text-sky-200"
          >
            {dictionary.oauthButton}
          </button>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <span className="h-px flex-1 bg-slate-800" />
            {dictionary.orDivider}
            <span className="h-px flex-1 bg-slate-800" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-slate-300">
              {dictionary.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder={dictionary.emailPlaceholder}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-slate-300">
              {dictionary.passwordLabel}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder={dictionary.passwordPlaceholder}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            />
            <p className="text-xs text-slate-500">{dictionary.passwordGuidance}</p>
          </div>

          {mode === "sign-up" && (
            <label className="flex items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-400"
              />
              <span>
                {dictionary.consentLabel}
                <span className="mt-1 block text-xs text-slate-500">{dictionary.consentHint}</span>
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sky-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? dictionary.loading
              : mode === "sign-in"
                ? dictionary.signInAction
                : dictionary.signUpAction}
          </button>
        </form>

        <footer className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setMode((prev) => (prev === "sign-in" ? "sign-up" : "sign-in"));
              setError(null);
              setStatusMessage(null);
            }}
            className="w-full text-sm text-sky-300 hover:text-sky-200"
          >
            {mode === "sign-in" ? dictionary.switchToSignUp : dictionary.switchToSignIn}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {statusMessage && <p className="text-sm text-slate-300">{statusMessage}</p>}
        </footer>
      </section>
    </main>
  );
}
