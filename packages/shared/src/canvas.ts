import rawDefinitions from "./data/block-definitions.json";

export type CanvasSignalType = string;

export type CanvasParameterType = "number" | "enum" | "boolean" | "text";

export type CanvasValidationSeverity = "error" | "warning";

export type CanvasValidationIssue = {
  nodeId: string | null;
  code: string;
  message: string;
  severity: CanvasValidationSeverity;
};

export type CanvasBlockPortDefinition = {
  id: string;
  label: string;
  type: CanvasSignalType | string;
  required?: boolean;
};

export type CanvasBlockParameterDefinition = {
  key: string;
  label: string;
  type: CanvasParameterType;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  hint?: string;
};

export type CanvasBlockLimits = Record<string, number | undefined> & {
  free?: number;
  pro?: number;
};

export type CanvasBlockDefinition = {
  kind: string;
  label: string;
  category: string;
  description: string;
  ports: {
    inputs: CanvasBlockPortDefinition[];
    outputs: CanvasBlockPortDefinition[];
  };
  parameters: CanvasBlockParameterDefinition[];
  limits: CanvasBlockLimits;
};

export type CanvasBlockCatalog = {
  signalTypes: CanvasSignalType[];
  blocks: CanvasBlockDefinition[];
};

export type StrategyNodePosition = {
  x: number;
  y: number;
};

export type StrategyNodeParameters = Record<string, number | string | boolean>;

export type StrategyNodeMetadata = {
  parameters?: StrategyNodeParameters;
  description?: string;
  hint?: string;
};

export interface StrategyNode {
  id: string;
  label: string;
  type: string;
  metadata?: StrategyNodeMetadata;
  position?: StrategyNodePosition;
}

export interface StrategyEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface StrategyGraph {
  nodes: StrategyNode[];
  edges: StrategyEdge[];
}

export interface StrategyVersionSummary {
  id: string;
  version: number;
  label: string;
  graph: StrategyGraph;
  validationIssues: CanvasValidationIssue[];
  createdAt: string;
  updatedAt: string | null;
}

const { signalTypes = [], blocks = [] } = rawDefinitions as {
  signalTypes?: CanvasSignalType[];
  blocks?: CanvasBlockDefinition[];
};

export const CANVAS_SIGNAL_TYPES: CanvasSignalType[] = [...signalTypes];

const BLOCK_CATALOG: CanvasBlockDefinition[] = blocks.map((block) => ({
  ...block,
  ports: {
    inputs: block.ports.inputs.map((port) => ({ ...port })),
    outputs: block.ports.outputs.map((port) => ({ ...port }))
  },
  parameters: block.parameters.map((parameter) => ({ ...parameter })),
  limits: { ...block.limits }
}));
const BLOCK_LOOKUP = new Map<string, CanvasBlockDefinition>(
  BLOCK_CATALOG.map((definition) => [definition.kind, definition])
);

export function getBlockDefinitions(): CanvasBlockDefinition[] {
  return BLOCK_CATALOG;
}

export function getBlockDefinition(kind: string): CanvasBlockDefinition | undefined {
  return BLOCK_LOOKUP.get(kind);
}
