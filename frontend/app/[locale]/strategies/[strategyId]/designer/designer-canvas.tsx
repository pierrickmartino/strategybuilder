"use client";

import { useMemo } from "react";
import { Background, Controls, ReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

type DesignerCanvasProps = {
  strategyName: string;
};

export default function DesignerCanvas({ strategyName }: DesignerCanvasProps) {
  const nodes = useMemo(
    () => [
      { id: "start", position: { x: 0, y: 0 }, data: { label: strategyName } },
      { id: "signal", position: { x: 0, y: 120 }, data: { label: "Check signal" } },
      { id: "action", position: { x: 0, y: 240 }, data: { label: "Execute trade" } },
    ],
    [strategyName]
  );

  const edges = useMemo(
    () => [
      { id: "e1", source: "start", target: "signal", animated: true },
      { id: "e2", source: "signal", target: "action" },
    ],
    []
  );

  return (
    <div className="h-[540px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background className="!bg-transparent" />
        <Controls className="!border-0 !bg-slate-900/80" />
      </ReactFlow>
    </div>
  );
}
