"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import type { OnboardingStepId, OnboardingStepStatus } from "@strategybuilder/shared";
import { OnboardingAnalyticsBridge } from "./OnboardingAnalyticsBridge";
import { useOnboardingProgress } from "@/stores/onboarding-progress";

type OnboardingChecklistProps = {
  templateHref?: string;
  runBacktestHref?: string;
  onTemplateSelect?: () => void;
};

const STATUS_STYLE: Record<OnboardingStepStatus, string> = {
  pending: "bg-slate-800 text-slate-400",
  "in-progress": "bg-sky-600/10 text-sky-300 border border-sky-500/40",
  completed: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
};

const STATUS_LABEL: Record<OnboardingStepStatus, string> = {
  pending: "Not started",
  "in-progress": "In progress",
  completed: "Completed"
};

export function OnboardingChecklist({
  templateHref,
  runBacktestHref,
  onTemplateSelect
}: OnboardingChecklistProps) {
  const { locale } = useParams<{ locale: string }>();
  const { definitions, steps, markStep, reset } = useOnboardingProgress(
    useShallow((state) => ({
      definitions: state.definitions,
      steps: state.steps,
      markStep: state.markStep,
      reset: state.reset
    }))
  );

  const progress = useOnboardingProgress((state) => state.getProgress());

  const localTemplateHref = templateHref ?? (locale ? `/${locale}/templates` : "/templates");

  const handleComplete = (stepId: OnboardingStepId) => {
    markStep(stepId, "completed");
  };

  return (
    <section className="grid gap-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Guided onboarding</h2>
          <p className="text-sm text-slate-400">Complete each step to activate your demo workspace.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Progress</p>
            <p className="text-sm font-medium text-slate-200">
              {progress.completed}/{progress.total} · {progress.percentage}%
            </p>
          </div>
          <div className="relative h-12 w-12 rounded-full border border-slate-800">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <path
                d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="3"
                strokeDasharray={`${progress.percentage}, 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-100">
              {progress.percentage}%
            </span>
          </div>
        </div>
      </div>

      <ol className="grid gap-3" aria-label="Onboarding checklist">
        {definitions.map((definition) => {
          const step = steps[definition.id];
          const status = step?.status ?? "pending";
          return (
            <li
              key={definition.id}
              className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4 md:grid-cols-[auto,1fr,auto] md:items-center"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[status]}`}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">{definition.title}</p>
                <p className="text-sm text-slate-400">{definition.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {definition.id === "load-template" && (
                  <Link
                    href={localTemplateHref}
                    className="rounded-lg border border-sky-500/60 px-3 py-1 text-xs font-medium text-sky-300 transition hover:bg-sky-500/10"
                    onClick={onTemplateSelect}
                  >
                    Browse templates
                  </Link>
                )}
                {definition.id === "run-backtest" && runBacktestHref && (
                  <Link
                    href={runBacktestHref}
                    className="rounded-lg border border-emerald-500/60 px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10"
                  >
                    Open designer
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleComplete(definition.id)}
                  className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                  aria-label={`Mark step ${definition.title} as complete`}
                >
                  Mark done
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 pt-4">
        <p className="text-xs text-slate-500">Progress is saved to your browser so you can pick up where you left off.</p>
        <button
          type="button"
          onClick={() => {
            reset();
          }}
          className="text-xs text-slate-400 transition hover:text-slate-200"
        >
          Reset checklist
        </button>
      </div>

      <OnboardingAnalyticsBridge />
    </section>
  );
}
