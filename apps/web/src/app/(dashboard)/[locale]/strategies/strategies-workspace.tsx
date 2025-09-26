"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { Dictionary } from "@/i18n/get-dictionary";
import { useWorkspaceBootstrap } from "@/hooks/use-workspace-bootstrap";
import { useWorkspaceStore } from "@/stores/workspace-store";

const metricTemplates = [
  [
    ["ROI", "+12%"],
    ["Win rate", "58%"],
    ["Max DD", "-7%"]
  ],
  [
    ["ROI", "+18%"],
    ["Win rate", "62%"],
    ["Max DD", "-5%"]
  ],
  [
    ["ROI", "+9%"],
    ["Win rate", "55%"],
    ["Max DD", "-4%"]
  ]
];

type Strategy = {
  id: string;
  name: string;
  notes: string;
};

type StrategiesWorkspaceProps = {
  dictionary: Dictionary["strategies"];
};

export default function StrategiesWorkspace({ dictionary }: StrategiesWorkspaceProps) {
  const { locale } = useParams<{ locale: string }>();
  const {
    isLoading,
    isError,
    error: bootstrapError
  } = useWorkspaceBootstrap();
  const workspace = useWorkspaceStore((state) => state.workspace);
  const strategySummary = useWorkspaceStore((state) => state.strategy);
  const graph = useWorkspaceStore((state) => state.graph);
  const callouts = useWorkspaceStore((state) => state.callouts);

  const initialStrategies = useMemo<Strategy[]>(
    () =>
      dictionary.demoStrategies.map((strategy) => ({
        id: String(strategy.id),
        name: strategy.name,
        notes: strategy.notes
      })),
    [dictionary.demoStrategies]
  );

  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [name, setName] = useState("");
  useEffect(() => {
    if (!strategySummary) {
      return;
    }

    setStrategies((prev) => {
      if (prev.some((item) => item.id === strategySummary.id)) {
        return prev;
      }

      return [
        {
          id: strategySummary.id,
          name: strategySummary.name,
          notes: strategySummary.description ?? ""
        },
        ...prev
      ];
    });
  }, [strategySummary]);

  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

    const reset = () => {
    setEditingId(null);
    setName("");
    setNotes("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    const next: Strategy = {
      id: editingId ?? crypto.randomUUID(),
      name: name.trim(),
      notes: notes.trim()
    };

    setStrategies((prev) =>
      editingId ? prev.map((item) => (item.id === editingId ? next : item)) : [next, ...prev]
    );

    reset();
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {workspace ? dictionary.workspacePrefix.replace("{name}", workspace.name) : dictionary.heading}
          </p>
          <h1 className="text-3xl font-semibold text-slate-50">
            {strategySummary ? strategySummary.name : dictionary.heading}
          </h1>
          <p className="text-sm text-slate-400">{dictionary.description}</p>
        </header>

        {callouts.length > 0 && (
          <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-slate-100">{dictionary.onboardingHeading}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {callouts.map((callout) => (
                <li
                  key={callout.id}
                  className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300"
                >
                  <p className="font-semibold text-slate-100">{callout.title}</p>
                  <p className="mt-1 text-slate-400">{callout.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="grid gap-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm text-slate-300" htmlFor="name">
                {dictionary.nameLabel}
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                placeholder={dictionary.namePlaceholder}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-300" htmlFor="notes">
                {dictionary.notesLabel}
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-[96px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                placeholder={dictionary.notesPlaceholder}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                {editingId ? dictionary.saveAction : dictionary.createAction}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  {dictionary.cancelAction}
                </button>
              )}
            </div>
          </form>

          {isLoading && (
            <p className="text-sm text-slate-400">{dictionary.loadingWorkspace}</p>
          )}
          {isError && (
            <p className="text-sm text-red-400">
              {dictionary.bootstrapError}
              {bootstrapError instanceof Error ? ` (${bootstrapError.message})` : null}
            </p>
          )}

          <ul className="grid gap-4 sm:grid-cols-2">
            {strategies.map((strategy, index) => {
              const stats = metricTemplates[index % metricTemplates.length];
              return (
                <li
                  key={strategy.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow shadow-slate-900/40"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">{strategy.name}</h2>
                    {strategy.notes && <p className="mt-1 text-sm text-slate-400">{strategy.notes}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs uppercase tracking-wide text-slate-400">
                    {stats.map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2"
                      >
                        <p>{label}</p>
                        <p className="mt-1 text-base font-semibold text-slate-100">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Link
                      href={`/${locale}/strategies/${strategy.id}/designer`}
                      className="rounded-lg border border-sky-500 px-3 py-1 text-sky-300 hover:bg-sky-500/10"
                    >
                      {dictionary.designerAction}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(strategy.id);
                        setName(strategy.name);
                        setNotes(strategy.notes);
                      }}
                      className="rounded-lg border border-slate-700 px-3 py-1 hover:border-sky-400 hover:text-sky-300"
                    >
                      {dictionary.editAction}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStrategies((prev) => prev.filter((item) => item.id !== strategy.id))}
                      className="rounded-lg border border-red-500 px-3 py-1 text-red-400 hover:bg-red-500/10"
                    >
                      {dictionary.deleteAction}
                    </button>
                  </div>
                </li>
              );
            })}
            {strategies.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                {dictionary.emptyState}
              </li>
            )}
          </ul>
        </section>
      </section>
    </main>
  );
}
