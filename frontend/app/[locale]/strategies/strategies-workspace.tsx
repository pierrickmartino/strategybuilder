"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";

import type { Dictionary } from "@/i18n/get-dictionary";

type Strategy = {
  id: number;
  name: string;
  notes: string;
};

type StrategiesWorkspaceProps = {
  dictionary: Dictionary["strategies"];
};

export default function StrategiesWorkspace({ dictionary }: StrategiesWorkspaceProps) {
  const { locale } = useParams<{ locale: string }>();
  const [strategies, setStrategies] = useState<Strategy[]>(() =>
    dictionary.demoStrategies.map((strategy) => ({ ...strategy }))
  );
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const reset = () => {
    setEditingId(null);
    setName("");
    setNotes("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    const next: Strategy = {
      id: editingId ?? Date.now(),
      name: name.trim(),
      notes: notes.trim(),
    };

    setStrategies((prev) =>
      editingId ? prev.map((item) => (item.id === editingId ? next : item)) : [...prev, next]
    );

    reset();
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto grid w-full max-w-3xl gap-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">{dictionary.heading}</h1>
          <p className="text-sm text-slate-400">{dictionary.description}</p>
        </header>
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
        <ul className="space-y-3">
          {strategies.map((strategy) => (
            <li
              key={strategy.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
            >
              <div>
                <h2 className="text-lg font-semibold">{strategy.name}</h2>
                {strategy.notes && <p className="mt-1 text-sm text-slate-400">{strategy.notes}</p>}
              </div>
              <div className="flex gap-2 text-sm">
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
                  onClick={() =>
                    setStrategies((prev) => prev.filter((item) => item.id !== strategy.id))
                  }
                  className="rounded-lg border border-red-500 px-3 py-1 text-red-400 hover:bg-red-500/10"
                >
                  {dictionary.deleteAction}
                </button>
              </div>
            </li>
          ))}
          {strategies.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
              {dictionary.emptyState}
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
