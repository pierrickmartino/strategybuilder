"use client";

import { create } from "zustand";

import type {
  EducatorCallout,
  StrategyGraph,
  StrategyVersionSummary,
  WorkspaceBootstrapPayload
} from "@strategybuilder/shared";

type WorkspaceSummary = WorkspaceBootstrapPayload["workspace"];
type StrategySummary = WorkspaceBootstrapPayload["strategy"];

type WorkspaceState = {
  workspace: WorkspaceSummary | null;
  strategy: StrategySummary | null;
  graph: StrategyGraph | null;
  version: (StrategyVersionSummary & { educatorCallouts: EducatorCallout[] }) | null;
  callouts: EducatorCallout[];
  hydrated: boolean;
  hydrateFromBootstrap: (payload: WorkspaceBootstrapPayload) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  strategy: null,
  graph: null,
  version: null,
  callouts: [],
  hydrated: false,
  hydrateFromBootstrap: (payload) =>
    set({
      workspace: payload.workspace,
      strategy: payload.strategy,
      graph: payload.version.graph,
      version: payload.version,
      callouts: payload.version.educatorCallouts,
      hydrated: true
    })
}));
