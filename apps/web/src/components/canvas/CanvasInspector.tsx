"use client";

import { useMemo } from "react";

import {
  getBlockDefinition,
  type CanvasBlockParameterDefinition,
  type StrategyNode
} from "@strategybuilder/shared";

function renderInput(
  parameter: CanvasBlockParameterDefinition,
  value: number | string | boolean,
  onChange: (next: number | string | boolean) => void,
  inputId: string
) {
  switch (parameter.type) {
    case "number":
      return (
        <input
          type="number"
          id={inputId}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
          value={value as number}
          min={parameter.min}
          max={parameter.max}
          step={parameter.step ?? 1}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      );
    case "enum":
      return (
        <select
          id={inputId}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
          value={value as string}
          onChange={(event) => onChange(event.target.value)}
        >
          {(parameter.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            id={inputId}
            className="rounded border-slate-600 bg-slate-900 text-sky-400"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          Enabled
        </label>
      );
    default:
      return (
        <input
          type="text"
          id={inputId}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
          value={value as string}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

type CanvasInspectorProps = {
  node: StrategyNode | null;
  onUpdate: (key: string, value: number | string | boolean) => void;
};

export function CanvasInspector({ node, onUpdate }: CanvasInspectorProps) {
  const definition = useMemo(() => (node ? getBlockDefinition(node.type) : undefined), [node]);

  if (!node || !definition) {
    return (
      <aside className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
        <p>Select a block to edit its parameters.</p>
      </aside>
    );
  }

  const parameters = definition.parameters;
  const current = node.metadata?.parameters ?? {};

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-slate-400">Configuration</p>
        <h2 className="text-lg font-semibold text-slate-100">{node.label}</h2>
        <p className="text-xs text-slate-400">{definition.description}</p>
      </header>
      <div className="flex flex-col gap-3">
      {parameters.map((parameter) => {
        const value = current[parameter.key] ?? parameter.default;
        const inputId = `parameter-${parameter.key}`;
        return (
          <div key={parameter.key} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-200" htmlFor={inputId}>
              {parameter.label}
            </label>
            {renderInput(parameter, value, (next) => onUpdate(parameter.key, next), inputId)}
            {parameter.hint && <p className="text-xs text-slate-400">{parameter.hint}</p>}
          </div>
        );
      })}
    </div>
    </aside>
  );
}
