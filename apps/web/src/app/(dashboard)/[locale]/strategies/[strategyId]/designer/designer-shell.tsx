"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Dictionary } from "@/i18n/get-dictionary";
import { useWorkspaceBootstrap } from "@/hooks/use-workspace-bootstrap";
import { useWorkspaceStore } from "@/stores/workspace-store";

import DesignerCanvas from "./designer-canvas";

type StrategyDesignerShellProps = {
  locale: string;
  strategyId: string;
  dictionary: Dictionary["designer"];
};

export default function StrategyDesignerShell({
  locale,
  strategyId,
  dictionary
}: StrategyDesignerShellProps) {
  useWorkspaceBootstrap();
  const bootstrapStrategy = useWorkspaceStore((state) => state.strategy);
  const graph = useWorkspaceStore((state) => state.graph);

  const [title, setTitle] = useState(dictionary.untitled);

  useEffect(() => {
    if (bootstrapStrategy && bootstrapStrategy.id === strategyId) {
      setTitle(bootstrapStrategy.name);
      return;
    }

    if (graph) {
      const node = graph.nodes.find((item) => item.id === strategyId);
      if (node) {
        setTitle(node.label);
      }
    }
  }, [bootstrapStrategy, graph, strategyId, dictionary.untitled]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 px-8 py-6">
        <div>
          <h1 className="text-3xl font-semibold">{dictionary.heading}</h1>
          <p className="text-sm text-slate-400">{dictionary.description}</p>
        </div>
        <Link
          href={`/${locale}/strategies`}
          className="text-sm text-orange-400 transition hover:text-orange-300"
        >
          {dictionary.backAction}
        </Link>
      </header>
      <section className="flex flex-1 min-h-0 flex-col gap-4 px-8 py-6">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="flex flex-1 min-h-0">
          <DesignerCanvas strategyId={strategyId} />
        </div>
      </section>
    </main>
  );
}
