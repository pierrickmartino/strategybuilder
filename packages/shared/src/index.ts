import type { StrategyNode, StrategyVersionSummary } from "./canvas";

export * from "./canvas";
export * from "./id";
export * from "./templates";
export * from "./education";

export type WorkspaceConsent = {
  acceptedSimulationOnly: boolean;
  acceptedAt: string | null;
};

export interface EducatorCallout {
  id: string;
  title: string;
  body: string;
  placement: string;
}

export interface StrategyVersionSeed {
  versionName: string;
  description?: string;
  nodes: StrategyNode[];
}

export interface WorkspaceBootstrapPayload {
  workspace: {
    id: string;
    name: string;
    templateId: string | null;
    createdAt: string | null;
  };
  strategy: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string | null;
  };
  version: StrategyVersionSummary & {
    educatorCallouts: EducatorCallout[];
  };
  created: boolean;
  userId?: string;
}
