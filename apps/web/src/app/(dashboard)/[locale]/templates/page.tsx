import { notFound } from "next/navigation";

import { TemplateLibrary } from "@/components/onboarding/TemplateLibrary";
import { isLocale } from "@/i18n/config";

type TemplatesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-50">Starter templates</h1>
          <p className="text-sm text-slate-400">
            Explore educator-reviewed strategies complete with safeguards, annotations, and risk disclosures.
          </p>
        </header>

        <TemplateLibrary variant="grid" />
      </section>
    </main>
  );
}
