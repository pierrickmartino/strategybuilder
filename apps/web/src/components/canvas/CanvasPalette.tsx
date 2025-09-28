"use client";

import { useMemo } from "react";

import { getBlockDefinitions } from "@strategybuilder/shared";

type CanvasPaletteProps = {
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>, blockKind: string) => void;
};

export function CanvasPalette({ onDragStart }: CanvasPaletteProps) {
  const blocks = useMemo(() => getBlockDefinitions(), []);

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <header>
        <h2 className="text-sm font-semibold text-slate-200">Building Blocks</h2>
        <p className="text-xs text-slate-400">Drag onto the canvas to add nodes.</p>
      </header>
      <div className="flex flex-col gap-2 overflow-auto">
        {blocks.map((block) => (
          <button
            key={block.kind}
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/x-canvas-block", block.kind);
              event.dataTransfer.effectAllowed = "move";
              onDragStart?.(event, block.kind);
            }}
            className="rounded-xl border border-transparent bg-slate-900/80 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
          >
            <p className="font-medium text-slate-100">{block.label}</p>
            <p className="text-xs text-slate-400">{block.description}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
