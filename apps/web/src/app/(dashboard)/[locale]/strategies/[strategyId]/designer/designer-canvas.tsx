"use client";

import { useEffect, useRef, useState } from "react";

import type { StrategyVersionSummary } from "@strategybuilder/shared";

import "@xyflow/react/dist/style.css";

import { StrategyCanvas } from "@/components/canvas/StrategyCanvas";
import { useStrategyCanvas } from "@/stores/useStrategyCanvas";
import { useWorkspaceStore } from "@/stores/workspace-store";

type DesignerCanvasProps = {
  strategyId: string;
};

export default function DesignerCanvas({ strategyId }: DesignerCanvasProps) {
  const strategy = useWorkspaceStore((state) => state.strategy);
  const version = useWorkspaceStore((state) => state.version);
  const loadVersion = useStrategyCanvas((state) => state.loadVersion);
  const [currentVersion, setCurrentVersion] = useState<StrategyVersionSummary | null>(null);
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!strategy || !version) {
      return;
    }

    if (!initialisedRef.current) {
      const summary: StrategyVersionSummary = {
        id: version.id,
        version: version.version,
        label: version.label,
        graph: version.graph,
        validationIssues: version.validationIssues,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt
      };

      loadVersion({
        strategyId: strategy.id,
        versionId: version.id,
        graph: version.graph,
        issues: version.validationIssues
      });

      setCurrentVersion(summary);
      initialisedRef.current = true;
    }
  }, [loadVersion, strategy, version]);

  if (!strategy || !currentVersion) {
    return (
      <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 text-sm text-slate-400">
        Loading canvas…
      </div>
    );
  }

  return (
    <StrategyCanvas
      strategyId={strategy.id}
      versionId={currentVersion.id}
      onVersionSwitch={(next) => setCurrentVersion(next)}
    />
  );
}
