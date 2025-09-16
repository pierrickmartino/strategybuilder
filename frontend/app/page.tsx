"use client";

import { FormEvent, useState } from "react";

const highlights = [
  {
    title: "Design visually",
    copy:
      "Drag, drop, and connect nodes on an infinite canvas to express trading logic without touching code.",
  },
  {
    title: "Validate safely",
    copy:
      "Replay strategies against curated historical OHLCV data to understand returns, drawdowns, and trade logs.",
  },
  {
    title: "Paper trade live",
    copy:
      "Shadow live markets through CCXT-powered feeds to see how your strategy behaves in current conditions.",
  },
];

const MOCK_EMAIL = "demo@strategybuilder.app";
const MOCK_PASSWORD = "demo123";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = email === MOCK_EMAIL && password === MOCK_PASSWORD;
    setMessage(success ? "Access granted! Loading workspace..." : "Invalid credentials. Try demo@strategybuilder.app / demo123.");
  };

  return (
    <main className="flex min-h-screen flex-col gap-16 bg-slate-950 px-6 pb-20 pt-24 text-slate-100">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-sky-300">
          Strategy Builder
        </span>
        <h1 className="mt-6 text-5xl font-bold sm:text-6xl">
          Build crypto trading strategies with zero code
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Drag-and-drop your logic, backtest on historical data, and paper trade live markets — all from one
          browser workspace designed for beginners and pros alike.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#"
            className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
          >
            Join the waitlist
          </a>
          <span className="text-sm text-slate-400">Free tier available at launch</span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40">
        <h2 className="text-xl font-semibold text-slate-100">Sign in to continue</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="demo@strategybuilder.app"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="demo123"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-sky-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Enter workspace
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-slate-300">
            {message}
          </p>
        )}
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3">
        {highlights.map(({ title, copy }) => (
          <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
        <h2 className="text-2xl font-semibold text-slate-100">Choose your pace</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-slate-50">Free</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>• 3 saved strategies</li>
              <li>• Daily backtest quota</li>
              <li>• One connected wallet</li>
            </ul>
          </div>
          <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-5">
            <h3 className="text-lg font-semibold text-slate-50">Premium</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>• Unlimited strategies &amp; backtests</li>
              <li>• Priority computation queue</li>
              <li>• Multiple wallets &amp; private sharing</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
