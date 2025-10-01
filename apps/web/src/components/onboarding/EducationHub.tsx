"use client";

import Link from "next/link";

import { useOnboardingEducation } from "@/hooks/use-onboarding-education";

export function EducationHub() {
  const { data, isLoading, isError, error } = useOnboardingEducation();

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow shadow-slate-900/30">
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-100">Education hub</h2>
        <p className="text-sm text-slate-400">
          Understand what the demo covers, the limits of simulation, and how to safely evaluate your strategy.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-400">Loading education content…</p>}
      {isError && (
        <p className="text-sm text-red-400">
          {"We couldn't load the education hub right now. Please refresh or try again later."}
          {error instanceof Error ? ` (${error.message})` : null}
        </p>
      )}

      {!isLoading && !isError && data && (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.panels.map((panel) => (
            <li key={panel.id} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-100">{panel.title}</p>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  {panel.complianceTag}
                </span>
              </div>
              <p className="text-sm text-slate-400">{panel.summary}</p>
              <p className="text-sm text-slate-300">{panel.body}</p>
              {panel.media && panel.media.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resources</p>
                  <ul className="grid gap-2">
                    {panel.media.map((asset) => (
                      <li key={asset.id}>
                        <Link
                          href={asset.url}
                          target="_blank"
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs text-sky-300 transition hover:border-sky-500/60 hover:text-sky-200"
                        >
                          <span className="font-medium">{asset.title}</span>
                          <span className="text-[10px] uppercase tracking-wide text-slate-500">
                            {asset.type === "video" ? "Video" : asset.type === "article" ? "Guide" : "Tooltip"}
                            {asset.durationSeconds
                              ? ` · ${Math.round(asset.durationSeconds / 60)} min`
                              : ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
