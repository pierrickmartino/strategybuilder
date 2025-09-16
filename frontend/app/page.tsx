export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-sky-300">
        Strategy Builder
      </span>
      <h1 className="text-balance text-5xl font-bold sm:text-6xl">
        Next.js + Tailwind CSS frontend scaffold
      </h1>
      <p className="max-w-2xl text-lg text-slate-300">
        This project ships with sensible defaults so you can focus on building product features
        instead of wiring up tooling. Run <code className="rounded bg-slate-800 px-2 py-1 font-mono text-sm">npm run dev</code> inside
        the <code className="rounded bg-slate-800 px-2 py-1 font-mono text-sm">frontend</code> directory to get started.
      </p>
    </main>
  );
}
