export type WorkspaceConsent = {
  acceptedSimulationOnly: boolean;
  acceptedAt: string | null;
};

export interface StrategyNode {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface StrategyEdge {
  id: string;
  source: string;
  target: string;
}

export interface StrategyGraph {
  nodes: StrategyNode[];
  edges: StrategyEdge[];
}

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
  version: {
    id: string;
    versionName: string;
    graph: StrategyGraph;
    educatorCallouts: EducatorCallout[];
    createdAt: string | null;
  };
  created: boolean;
  userId?: string;
}
