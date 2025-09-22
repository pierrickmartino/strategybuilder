import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

import StrategyDesignerShell from "./designer-shell";

type StrategyDesignerPageProps = {
  params: Promise<{ locale: string; strategyId: string }>;
};

export default async function StrategyDesignerPage({ params }: StrategyDesignerPageProps) {
  const { locale, strategyId } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <StrategyDesignerShell
      locale={locale}
      strategyId={strategyId}
      dictionary={dictionary.designer}
    />
  );
}
