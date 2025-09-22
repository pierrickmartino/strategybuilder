"use client";

import { useMemo } from "react";
import { Background, Controls, ReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useWorkspaceStore } from "@/stores/workspace-store";

type DesignerCanvasProps = {
  strategyName: string;
};

export default function DesignerCanvas({ strategyName }: DesignerCanvasProps) {
  const graph = useWorkspaceStore((state) => state.graph);

  const nodes = useMemo(() => {
    if (!graph) {
      return [
        { id: "start", position: { x: 0, y: 0 }, data: { label: strategyName } },
        { id: "signal", position: { x: 0, y: 140 }, data: { label: "Check signal" } },
        { id: "action", position: { x: 0, y: 280 }, data: { label: "Execute trade" } }
      ];
    }

    return graph.nodes.map((node, index) => ({
      id: node.id,
      position: { x: (index % 2) * 240, y: index * 140 },
      data: { label: node.label }
    }));
  }, [graph, strategyName]);

  const edges = useMemo(() => {
    if (!graph) {
      return [
        { id: "e1", source: "start", target: "signal", animated: true },
        { id: "e2", source: "signal", target: "action" }
      ];
    }

    return graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true
    }));
  }, [graph]);

  return (
    <div className="flex h-full w-full flex-1 min-h-[420px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <ReactFlow nodes={nodes} edges={edges} fitView style={{ width: "100%", height: "100%" }}>
        <Background className="!bg-transparent" />
        <Controls className="!border-0 !bg-slate-900/80" />
      </ReactFlow>
    </div>
  );
}
