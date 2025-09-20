import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

import DesignerCanvas from "./designer-canvas";

type StrategyDesignerPageProps = {
  params: Promise<{ locale: string; strategyId: string }>;
};

export default async function StrategyDesignerPage({ params }: StrategyDesignerPageProps) {
  const { locale, strategyId } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const strategy = dictionary.strategies.demoStrategies.find((item) => `${item.id}` === strategyId);

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 px-8 py-6">
        <div>
          <h1 className="text-3xl font-semibold">{dictionary.designer.heading}</h1>
          <p className="text-sm text-slate-400">{dictionary.designer.description}</p>
        </div>
        <Link
          href={`/${locale}/strategies`}
          className="text-sm text-sky-400 transition hover:text-sky-300"
        >
          {dictionary.designer.backAction}
        </Link>
      </header>
      <section className="flex flex-1 min-h-0 flex-col gap-4 px-8 py-6">
        <p className="text-sm text-slate-400">
          {strategy?.name ?? dictionary.designer.untitled}
        </p>
        <div className="flex flex-1 min-h-0">
          <DesignerCanvas strategyName={strategy?.name ?? dictionary.designer.untitled} />
        </div>
      </section>
    </main>
  );
}
