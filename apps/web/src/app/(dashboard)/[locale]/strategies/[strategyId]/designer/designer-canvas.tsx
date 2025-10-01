"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { StrategyVersionSummary } from "@strategybuilder/shared";

import "@xyflow/react/dist/style.css";

import { StrategyCanvas } from "@/components/canvas/StrategyCanvas";
import { useStrategyVersions } from "@/hooks/use-strategy-versions";
import { useStrategyCanvas } from "@/stores/useStrategyCanvas";
import { useWorkspaceStore } from "@/stores/workspace-store";

type DesignerCanvasProps = {
  strategyId: string;
};

export default function DesignerCanvas({ strategyId }: DesignerCanvasProps) {
  const strategy = useWorkspaceStore((state) => state.strategy);
  const version = useWorkspaceStore((state) => state.version);
  const loadVersion = useStrategyCanvas((state) => state.loadVersion);
  const versionsQuery = useStrategyVersions(strategyId);
  const [currentVersion, setCurrentVersion] = useState<StrategyVersionSummary | null>(null);
  const initialisedRef = useRef(false);

  useEffect(() => {
    initialisedRef.current = false;
    setCurrentVersion(null);
  }, [strategyId]);

  useEffect(() => {
    if (initialisedRef.current) {
      return;
    }

    if (strategy && version && strategy.id === strategyId) {
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
      return;
    }

    if (versionsQuery.data && versionsQuery.data.length > 0) {
      const [latest] = versionsQuery.data;
      loadVersion({
        strategyId,
        versionId: latest.id,
        graph: latest.graph,
        issues: latest.validationIssues
      });
      setCurrentVersion(latest);
      initialisedRef.current = true;
    }
  }, [
    loadVersion,
    strategy,
    strategyId,
    version,
    versionsQuery.data
  ]);

  const loading = useMemo(
    () =>
      versionsQuery.isLoading ||
      (!initialisedRef.current && (!strategy || strategy.id !== strategyId) && !versionsQuery.data),
    [strategy, strategyId, versionsQuery.data, versionsQuery.isLoading]
  );

  if (!currentVersion) {
    if (versionsQuery.isError) {
      return (
        <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-rose-700 bg-rose-950/60 px-6 text-center text-sm text-rose-100">
          Failed to load the strategy canvas. Please refresh the page to try again.
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 text-sm text-slate-400">
          Loading canvas…
        </div>
      );
    }

    return (
      <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 text-sm text-slate-400">
        No saved versions were found for this strategy.
      </div>
    );
  }

  return (
    <StrategyCanvas
      strategyId={strategyId}
      versionId={currentVersion.id}
      onVersionSwitch={(next) => setCurrentVersion(next)}
    />
  );
}
