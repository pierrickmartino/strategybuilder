"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import type { TemplateShare } from "@strategybuilder/shared";
import { useTemplates } from "@/hooks/use-templates";
import { useOnboardingProgress } from "@/stores/onboarding-progress";

type TemplateLibraryProps = {
  variant?: "grid" | "compact";
};

function TemplateCard({ template, onSelect }: { template: TemplateShare; onSelect: (template: TemplateShare) => void }) {
  return (
    <li className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow shadow-slate-900/40">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-semibold text-slate-100">{template.metadata.title}</p>
          <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-500">
            {template.metadata.audience}
          </span>
        </div>
        <p className="text-sm text-slate-400">{template.metadata.description}</p>
      </header>

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Block highlights</p>
        <ul className="grid gap-2">
          {template.metadata.blocks.map((block) => (
            <li
              key={block.id}
              className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold" title={block.tooltip}>
                  {block.title}
                </span>
                <span className="text-xs text-slate-500">{block.summary}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2 text-xs text-slate-400">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disclaimers</p>
        <ul className="grid gap-1">
          {template.metadata.disclaimers.map((disclaimer, index) => (
            <li key={index} className="leading-relaxed">
              {disclaimer}
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{template.cloneCount.toLocaleString()} clones</span>
          <span aria-hidden="true">·</span>
          <span>{template.metadata.estimatedBacktestMinutes} min backtest</span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(template)}
          className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Use template
        </button>
      </footer>
    </li>
  );
}

export function TemplateLibrary({ variant = "grid" }: TemplateLibraryProps) {
  const { locale } = useParams<{ locale: string }>();
  const { data, isLoading, isError, error } = useTemplates();
  const { markStep, steps } = useOnboardingProgress(
    useShallow((state) => ({
      markStep: state.markStep,
      steps: state.steps
    }))
  );

  const handleSelect = (template: TemplateShare) => {
    const currentStatus = steps["load-template"]?.status;
    if (currentStatus !== "completed") {
      markStep("load-template", "completed", {
        templateId: template.id,
        audience: template.metadata.audience,
        slug: template.metadata.slug
      });
    }
  };

  const templateList = data ?? [];
  const isCompact = variant === "compact";

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow shadow-slate-900/20">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Template library</h2>
          <p className="text-sm text-slate-400">
            Jump-start your build with educator-reviewed strategies and contextual block tips.
          </p>
        </div>
        {!isCompact && (
          <Link
            href={locale ? `/${locale}/templates` : "/templates"}
            className="rounded-lg border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-sky-500/60 hover:text-sky-200"
          >
            View full library
          </Link>
        )}
      </header>

      {isLoading && <p className="text-sm text-slate-400">Loading templates…</p>}
      {isError && (
        <p className="text-sm text-red-400">
          {"We couldn't load templates right now."}
          {error instanceof Error ? ` (${error.message})` : null}
        </p>
      )}

      {!isLoading && !isError && templateList.length > 0 && (
        <ul className={`grid gap-4 ${isCompact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {templateList.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
          ))}
        </ul>
      )}

      {!isLoading && !isError && templateList.length === 0 && (
        <p className="text-sm text-slate-400">No templates available yet. Check back soon.</p>
      )}
    </section>
  );
}
