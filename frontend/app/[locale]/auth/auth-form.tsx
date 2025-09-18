"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const MOCK_EMAIL = "demo@strategybuilder.app";
const MOCK_PASSWORD = "demo123";

type AuthFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export default function AuthForm({ locale, dictionary }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = email === MOCK_EMAIL && password === MOCK_PASSWORD;
    if (success) {
      setMessage(dictionary.success);
      router.push(`/${locale}/strategies`);
    } else {
      setMessage(dictionary.error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40">
        <h1 className="text-2xl font-semibold text-slate-100">{dictionary.heading}</h1>
        <p className="mt-2 text-sm text-slate-400">{dictionary.subheading}</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder={dictionary.passwordPlaceholder}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-sky-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            {dictionary.submit}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
      </section>
    </main>
  );
}
