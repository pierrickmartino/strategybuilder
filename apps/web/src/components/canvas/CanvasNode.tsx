"use client";

import type { CanvasValidationIssue } from "@strategybuilder/shared";
import type { NodeProps } from "@xyflow/react";

export type CanvasNodeData = {
  label: string;
  kind: string;
  issues: CanvasValidationIssue[];
};

export function CanvasNode({ data, selected }: NodeProps<CanvasNodeData>) {
  const hasErrors = data.issues.some((issue) => issue.severity === "error");
  const hasWarnings = data.issues.some((issue) => issue.severity === "warning");

  return (
    <div
      className={`min-w-[160px] rounded-2xl border px-4 py-3 shadow-lg transition focus:outline-none focus-visible:ring-2 ${
        selected ? "border-sky-400 ring-2 ring-sky-400/40" : "border-slate-700"
      } ${hasErrors ? "bg-rose-500/10" : hasWarnings ? "bg-amber-500/10" : "bg-slate-900/90"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">{data.kind}</span>
        {hasErrors && <span className="text-xs font-semibold text-rose-400">Error</span>}
        {!hasErrors && hasWarnings && <span className="text-xs font-semibold text-amber-400">Check</span>}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-100">{data.label}</p>
      {data.issues.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-slate-300">
          {data.issues.slice(0, 2).map((issue) => (
            <li key={`${issue.code}-${issue.message.slice(0, 12)}`}>{issue.message}</li>
          ))}
          {data.issues.length > 2 && <li>+{data.issues.length - 2} more</li>}
        </ul>
      )}
    </div>
  );
}

