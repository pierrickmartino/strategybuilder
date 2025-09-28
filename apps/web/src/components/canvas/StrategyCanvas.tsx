"use client";

import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type ReactFlowInstance
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getBlockDefinition,
  type CanvasValidationIssue,
  type StrategyGraph,
  type StrategyNode,
  type StrategyNodePosition,
  type StrategyVersionSummary
} from "@strategybuilder/shared";

import {
  useAutosaveStrategyVersion,
  useRevertStrategyVersion,
  useStrategyVersions,
  useValidateStrategyGraph
} from "@/hooks/use-strategy-versions";
import { CanvasInspector } from "@/components/canvas/CanvasInspector";
import { CanvasNode, type CanvasNodeData } from "@/components/canvas/CanvasNode";
import { CanvasPalette } from "@/components/canvas/CanvasPalette";
import { useStrategyCanvas } from "@/stores/useStrategyCanvas";

const nodeTypes = { canvas: CanvasNode };

type StrategyCanvasProps = {
  strategyId: string;
  versionId: string;
  onVersionSwitch: (version: StrategyVersionSummary) => void;
};

type IssuesByNode = Record<string, CanvasValidationIssue[]>;

function buildIssuesMap(issues: CanvasValidationIssue[]): IssuesByNode {
  return issues.reduce<IssuesByNode>((acc, issue) => {
    if (issue.nodeId) {
      acc[issue.nodeId] = acc[issue.nodeId] ? [...acc[issue.nodeId], issue] : [issue];
    }
    return acc;
  }, {});
}

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

function VersionHistory({
  versions,
  currentVersionId,
  onLoad,
  onRevert,
  revertingId
}: {
  versions: StrategyVersionSummary[];
  currentVersionId: string;
  onLoad: (version: StrategyVersionSummary) => void;
  onRevert: (version: StrategyVersionSummary) => void;
  revertingId: string | null;
}) {
  if (versions.length === 0) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
        <h3 className="text-sm font-semibold text-slate-100">Version history</h3>
        <p>Versions will appear here after your first save.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <header>
        <h3 className="text-sm font-semibold text-slate-100">Version history</h3>
        <p className="text-xs text-slate-400">Load or revert to previous snapshots.</p>
      </header>
      <ul className="flex max-h-48 flex-col gap-2 overflow-auto text-sm">
        {versions.map((version) => {
          const active = version.id === currentVersionId;
          const createdAt = new Date(version.createdAt).toLocaleString();
          return (
            <li
              key={version.id}
              className={`rounded-xl border px-3 py-2 ${
                active ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-900/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-100">{version.label}</p>
                  <p className="text-[11px] text-slate-400">v{version.version} · {createdAt}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onLoad(version)}
                    className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-sky-500 hover:text-sky-300"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onRevert(version)}
                    disabled={revertingId === version.id}
                    className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-rose-500 hover:text-rose-300 disabled:opacity-50"
                  >
                    {revertingId === version.id ? "Reverting" : "Revert"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function StrategyCanvas({ strategyId, versionId, onVersionSwitch }: StrategyCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [revertNotice, setRevertNotice] = useState<string | null>(null);

  const graph = useStrategyCanvas((state) => state.graphs[versionId]);
  const validationState = useStrategyCanvas((state) => state.validation[versionId]);
  const dirty = useStrategyCanvas((state) => state.dirty[versionId] ?? false);

  const loadVersion = useStrategyCanvas((state) => state.loadVersion);
  const updateGraph = useStrategyCanvas((state) => state.updateGraph);
  const upsertNode = useStrategyCanvas((state) => state.upsertNode);
  const moveNode = useStrategyCanvas((state) => state.moveNode);
  const removeNode = useStrategyCanvas((state) => state.removeNode);
  const connectNodes = useStrategyCanvas((state) => state.connectNodes);
  const removeEdge = useStrategyCanvas((state) => state.removeEdge);
  const markSaved = useStrategyCanvas((state) => state.markSaved);
  const setValidationResult = useStrategyCanvas((state) => state.setValidationResult);
  const setValidationError = useStrategyCanvas((state) => state.setValidationError);
  const markValidationPending = useStrategyCanvas((state) => state.markValidationPending);

  const versionsQuery = useStrategyVersions(strategyId);
  const autosaveMutation = useAutosaveStrategyVersion(strategyId);
  const validateMutation = useValidateStrategyGraph(strategyId);
  const revertMutation = useRevertStrategyVersion(strategyId);

  const issuesByNode = useMemo(() => buildIssuesMap(validationState?.issues ?? []), [validationState]);
  const globalIssues = useMemo(
    () => (validationState?.issues ?? []).filter((issue) => !issue.nodeId),
    [validationState]
  );

  const nodes = useMemo(() => {
    if (!graph) {
      return [];
    }
    return graph.nodes.map((node) => ({
      id: node.id,
      type: "canvas",
      position: node.position ?? { x: 0, y: 0 },
      data: {
        label: node.label,
        kind: node.type,
        issues: issuesByNode[node.id] ?? []
      } satisfies CanvasNodeData
    }));
  }, [graph, issuesByNode]);

  const edges = useMemo(() => {
    if (!graph) {
      return [];
    }
    return graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined
    }));
  }, [graph]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (!versionId) {
          return;
        }
        if (change.type === "position" && change.position) {
          if (!change.dragging) {
            moveNode(versionId, change.id, change.position as StrategyNodePosition);
          }
        }
        if (change.type === "remove") {
          removeNode(versionId, change.id);
        }
        if (change.type === "select") {
          setSelectedNodeId(change.selected ? change.id : null);
        }
      });
    },
    [moveNode, removeNode, versionId]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "remove" && versionId) {
          removeEdge(versionId, change.id);
        }
      });
    },
    [removeEdge, versionId]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!versionId || !connection.source || !connection.target) {
        return;
      }
      const existing = graph?.edges.some(
        (edge) => edge.source === connection.source && edge.target === connection.target
      );
      if (existing) {
        return;
      }
      connectNodes(versionId, {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined
      });
    },
    [connectNodes, graph?.edges, versionId]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!versionId || !reactFlowInstance) {
        return;
      }
      const kind = event.dataTransfer.getData("application/x-canvas-block");
      if (!kind) {
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      });
      const definition = getBlockDefinition(kind);
      if (!definition) {
        return;
      }
      const id = `${kind}-${crypto.randomUUID().slice(0, 8)}`;
      const parameters = Object.fromEntries(
        definition.parameters.map((parameter) => [parameter.key, parameter.default])
      );
      const node: StrategyNode = {
        id,
        label: definition.label,
        type: definition.kind,
        position,
        metadata: {
          description: definition.description,
          parameters
        }
      };
      upsertNode(versionId, node);
      setSelectedNodeId(id);
    },
    [reactFlowInstance, upsertNode, versionId]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleValidate = useCallback(() => {
    if (!graph || !versionId) {
      return;
    }
    markValidationPending(versionId);
    validateMutation
      .mutateAsync(cloneGraph(graph))
      .then((issues) => {
        setValidationResult(versionId, issues);
      })
      .catch((error: Error) => {
        setValidationError(versionId, error.message);
      });
  }, [graph, markValidationPending, setValidationError, setValidationResult, validateMutation, versionId]);

  useEffect(() => {
    if (!graph || !dirty || autosaveMutation.isPending || !versionId) {
      return;
    }
    const handle = window.setTimeout(() => {
      autosaveMutation
        .mutateAsync({ graph: cloneGraph(graph) })
        .then((version) => {
          markSaved(versionId);
          setValidationResult(versionId, version.validationIssues);
        })
        .catch((error: Error) => {
          setValidationError(versionId, error.message);
        });
    }, 1500);

    return () => window.clearTimeout(handle);
  }, [autosaveMutation, dirty, graph, markSaved, setValidationError, setValidationResult, versionId]);

  const handleParameterUpdate = useCallback(
    (parameterKey: string, value: number | string | boolean) => {
      if (!versionId || !selectedNodeId) {
        return;
      }
      updateGraph(versionId, (mutable) => {
        const node = mutable.nodes.find((entry) => entry.id === selectedNodeId);
        if (node) {
          const metadata = node.metadata ?? {};
          const parameters = { ...(metadata.parameters ?? {}) };
          parameters[parameterKey] = value;
          node.metadata = { ...metadata, parameters };
        }
        return mutable;
      });
    },
    [selectedNodeId, updateGraph, versionId]
  );

  const handleLoadVersion = useCallback(
    (version: StrategyVersionSummary) => {
      loadVersion({
        strategyId,
        versionId: version.id,
        graph: version.graph,
        issues: version.validationIssues
      });
      setSelectedNodeId(null);
      onVersionSwitch(version);
    },
    [loadVersion, onVersionSwitch, strategyId]
  );

  const handleRevertVersion = useCallback(
    async (version: StrategyVersionSummary) => {
      setRevertingId(version.id);
      try {
        const created = await revertMutation.mutateAsync(version.id);
        loadVersion({
          strategyId,
          versionId: created.id,
          graph: created.graph,
          issues: created.validationIssues
        });
        setSelectedNodeId(null);
        onVersionSwitch(created);
        setRevertNotice(`Restored version ${created.label}`);
      } finally {
        setRevertingId(null);
      }
    },
    [loadVersion, onVersionSwitch, revertMutation, strategyId]
  );

  useEffect(() => {
    if (!revertNotice) {
      return;
    }
    const timeout = window.setTimeout(() => setRevertNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [revertNotice]);

  const selectedNode = useMemo(() => {
    if (!graph || !selectedNodeId) {
      return null;
    }
    return graph.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [graph, selectedNodeId]);

  const validationMessage = useMemo(() => {
    if (!validationState) {
      return null;
    }
    if (validationState.status === "pending") {
      return "Running validation";
    }
    if (validationState.status === "error") {
      return validationState.message;
    }
    if (validationState.issues.length === 0) {
      return "All checks passed";
    }
    return `${validationState.issues.length} issues detected`;
  }, [validationState]);

  return (
    <ReactFlowProvider>
      <div className="flex h-full gap-4">
        <CanvasPalette />
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="rounded-md border border-slate-700 px-2 py-1 text-xs uppercase tracking-wide text-slate-400">
                Canvas
              </span>
              {dirty && <span className="text-slate-200">Unsaved changes</span>}
              {autosaveMutation.isPending && <span className="text-slate-200">Saving…</span>}
              {validationMessage && <span className="text-slate-400">{validationMessage}</span>}
              {revertNotice && <span className="text-emerald-300">{revertNotice}</span>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleValidate}
                className="rounded-md border border-sky-500 px-3 py-1.5 text-sm font-medium text-sky-200 transition hover:bg-sky-500/10"
              >
                Validate
              </button>
            </div>
          </header>
          <div className="flex min-h-0 flex-1 gap-4">
            <div
              className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60"
              data-testid="canvas-surface"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onInit={setReactFlowInstance}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                onPaneClick={() => setSelectedNodeId(null)}
                fitView
                style={{ width: "100%", height: "100%" }}
              >
                <Background className="!bg-transparent" />
                <Controls className="!border-0 !bg-slate-900/80" />
              </ReactFlow>
            </div>
            <div className="flex w-80 shrink-0 flex-col gap-4">
              {globalIssues.length > 0 && (
                <section
                  className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100 shadow-sm"
                  data-testid="canvas-global-issues"
                >
                  <header className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-wide">
                    <span className="font-semibold">Validation blockers</span>
                    <span className="text-rose-300">
                      {globalIssues.length} {globalIssues.length === 1 ? "issue" : "issues"}
                    </span>
                  </header>
                  <ul className="space-y-2 text-rose-100">
                    {globalIssues.map((issue, index) => (
                      <li key={`${issue.code}-${index}`} className="leading-snug">
                        <div className="text-xs font-semibold text-rose-200">{issue.code}</div>
                        <p className="text-sm">{issue.message}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <CanvasInspector node={selectedNode} onUpdate={handleParameterUpdate} />
              <VersionHistory
                versions={versionsQuery.data ?? []}
                currentVersionId={versionId}
                onLoad={handleLoadVersion}
                onRevert={handleRevertVersion}
                revertingId={revertingId}
              />
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
