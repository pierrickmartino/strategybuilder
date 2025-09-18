import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

import StrategiesWorkspace from "./strategies-workspace";

type StrategiesPageProps = {
  params: {
    locale: string;
  };
};

export default async function StrategiesPage({ params: { locale } }: StrategiesPageProps) {
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return <StrategiesWorkspace dictionary={dictionary.strategies} />;
}
