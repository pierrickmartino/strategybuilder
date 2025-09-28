"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type {
  CanvasValidationIssue,
  StrategyEdge,
  StrategyGraph,
  StrategyNode,
  StrategyNodePosition
} from "@strategybuilder/shared";

const HISTORY_LIMIT = 50;

function cloneGraph(graph: StrategyGraph): StrategyGraph {
  return {
    nodes: graph.nodes.map((node) => ({
      ...node,
      metadata: node.metadata
        ? {
            ...node.metadata,
            parameters: node.metadata.parameters ? { ...node.metadata.parameters } : undefined
          }
        : undefined
    })),
    edges: graph.edges.map((edge) => ({ ...edge }))
  };
}

function initialiseGraph(): StrategyGraph {
  return { nodes: [], edges: [] };
}

type HistoryStack = {
  past: StrategyGraph[];
  future: StrategyGraph[];
};

type ValidationState =
  | { status: "idle"; issues: CanvasValidationIssue[] }
  | { status: "pending"; issues: CanvasValidationIssue[] }
  | { status: "error"; issues: CanvasValidationIssue[]; message: string };

type CanvasState = {
  activeStrategyId: string | null;
  activeVersionId: string | null;
  graphs: Record<string, StrategyGraph>;
  history: Record<string, HistoryStack>;
  validation: Record<string, ValidationState>;
  dirty: Record<string, boolean>;
  loadVersion: (params: {
    strategyId: string;
    versionId: string;
    graph: StrategyGraph;
    issues?: CanvasValidationIssue[];
  }) => void;
  setActiveVersion: (versionId: string | null) => void;
  updateGraph: (versionId: string, mutate: (graph: StrategyGraph) => StrategyGraph) => void;
  upsertNode: (versionId: string, node: StrategyNode) => void;
  updateNode: (versionId: string, nodeId: string, updates: Partial<StrategyNode>) => void;
  moveNode: (versionId: string, nodeId: string, position: StrategyNodePosition) => void;
  removeNode: (versionId: string, nodeId: string) => void;
  connectNodes: (versionId: string, edge: StrategyEdge) => void;
  removeEdge: (versionId: string, edgeId: string) => void;
  undo: (versionId: string) => void;
  redo: (versionId: string) => void;
  markDirty: (versionId: string) => void;
  markSaved: (versionId: string) => void;
  markValidationPending: (versionId: string) => void;
  setValidationResult: (versionId: string, issues: CanvasValidationIssue[]) => void;
  setValidationError: (versionId: string, message: string) => void;
  reset: () => void;
};

function ensureHistory(history: Record<string, HistoryStack>, versionId: string): Record<string, HistoryStack> {
  if (history[versionId]) {
    return history;
  }
  return {
    ...history,
    [versionId]: { past: [], future: [] }
  };
}

function pushHistory(
  history: Record<string, HistoryStack>,
  versionId: string,
  snapshot: StrategyGraph
): Record<string, HistoryStack> {
  const existing = history[versionId] ?? { past: [], future: [] };
  const nextPast = [...existing.past, snapshot];
  if (nextPast.length > HISTORY_LIMIT) {
    nextPast.shift();
  }
  return {
    ...history,
    [versionId]: { past: nextPast, future: [] }
  };
}

export const useStrategyCanvas = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        activeStrategyId: null,
        activeVersionId: null,
        graphs: {},
        history: {},
        validation: {},
        dirty: {},
        loadVersion: ({ strategyId, versionId, graph, issues }) =>
          set((state) => {
            const snapshot = cloneGraph(graph);
            const validationState: ValidationState = {
              status: "idle",
              issues: issues ?? []
            };
            return {
              activeStrategyId: strategyId,
              activeVersionId: versionId,
              graphs: { ...state.graphs, [versionId]: snapshot },
              history: {
                ...state.history,
                [versionId]: { past: [], future: [] }
              },
              validation: { ...state.validation, [versionId]: validationState },
              dirty: { ...state.dirty, [versionId]: false }
            };
          }),
        setActiveVersion: (versionId) =>
          set((state) => ({
            activeVersionId: versionId,
            history: ensureHistory(state.history, versionId ?? "")
          })),
        updateGraph: (versionId, mutate) =>
          set((state) => {
            const current = state.graphs[versionId] ?? initialiseGraph();
            const nextGraph = mutate(cloneGraph(current));
            return {
              graphs: { ...state.graphs, [versionId]: nextGraph },
              history: pushHistory(state.history, versionId, cloneGraph(current)),
              dirty: { ...state.dirty, [versionId]: true }
            };
          }),
        upsertNode: (versionId, node) =>
          get().updateGraph(versionId, (graph) => {
            const idx = graph.nodes.findIndex((existing) => existing.id === node.id);
            if (idx >= 0) {
              graph.nodes[idx] = { ...graph.nodes[idx], ...node };
            } else {
              graph.nodes.push(node);
            }
            return graph;
          }),
        updateNode: (versionId, nodeId, updates) =>
          get().updateGraph(versionId, (graph) => {
            const node = graph.nodes.find((existing) => existing.id === nodeId);
            if (node) {
              Object.assign(node, updates);
            }
            return graph;
          }),
        moveNode: (versionId, nodeId, position) =>
          get().updateGraph(versionId, (graph) => {
            const node = graph.nodes.find((existing) => existing.id === nodeId);
            if (node) {
              node.position = position;
            }
            return graph;
          }),
        removeNode: (versionId, nodeId) =>
          get().updateGraph(versionId, (graph) => {
            graph.nodes = graph.nodes.filter((node) => node.id !== nodeId);
            graph.edges = graph.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
            return graph;
          }),
        connectNodes: (versionId, edge) =>
          get().updateGraph(versionId, (graph) => {
            const exists = graph.edges.some((existing) => existing.id === edge.id);
            if (!exists) {
              graph.edges.push(edge);
            }
            return graph;
          }),
        removeEdge: (versionId, edgeId) =>
          get().updateGraph(versionId, (graph) => {
            graph.edges = graph.edges.filter((edge) => edge.id !== edgeId);
            return graph;
          }),
        undo: (versionId) =>
          set((state) => {
            const stack = state.history[versionId];
            if (!stack || stack.past.length === 0) {
              return state;
            }
            const previous = stack.past[stack.past.length - 1];
            const past = stack.past.slice(0, -1);
            const current = state.graphs[versionId] ?? initialiseGraph();
            const future = [cloneGraph(current), ...stack.future];
            return {
              graphs: { ...state.graphs, [versionId]: cloneGraph(previous) },
              history: { ...state.history, [versionId]: { past, future } },
              dirty: { ...state.dirty, [versionId]: true }
            };
          }),
        redo: (versionId) =>
          set((state) => {
            const stack = state.history[versionId];
            if (!stack || stack.future.length === 0) {
              return state;
            }
            const [next, ...rest] = stack.future;
            const current = state.graphs[versionId] ?? initialiseGraph();
            const past = [...stack.past, cloneGraph(current)];
            return {
              graphs: { ...state.graphs, [versionId]: cloneGraph(next) },
              history: { ...state.history, [versionId]: { past, future: rest } },
              dirty: { ...state.dirty, [versionId]: true }
            };
          }),
        markDirty: (versionId) =>
          set((state) => ({ dirty: { ...state.dirty, [versionId]: true } })),
        markSaved: (versionId) =>
          set((state) => ({ dirty: { ...state.dirty, [versionId]: false } })),
        markValidationPending: (versionId) =>
          set((state) => {
            const current = state.validation[versionId];
            return {
              validation: {
                ...state.validation,
                [versionId]: {
                  status: "pending",
                  issues: current?.issues ?? []
                }
              }
            };
          }),
        setValidationResult: (versionId, issues) =>
          set((state) => ({
            validation: {
              ...state.validation,
              [versionId]: { status: "idle", issues }
            }
          })),
        setValidationError: (versionId, message) =>
          set((state) => {
            const current = state.validation[versionId];
            return {
              validation: {
                ...state.validation,
                [versionId]: {
                  status: "error",
                  message,
                  issues: current?.issues ?? []
                }
              }
            };
          }),
        reset: () =>
          set({
            activeStrategyId: null,
            activeVersionId: null,
            graphs: {},
            history: {},
            validation: {},
            dirty: {}
          })
      }),
      {
        name: "strategybuilder.canvas"
      }
    )
  )
);

