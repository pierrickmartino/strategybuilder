import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type HomePageProps = {
  params: {
    locale: string;
  };
};

export default async function HomePage({ params: { locale } }: HomePageProps) {
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const { hero, highlights, pricing } = dictionary.home;

  return (
    <main className="flex min-h-screen flex-col gap-16 bg-slate-950 px-6 pb-20 pt-24 text-slate-100">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-sky-300">
          {hero.badge}
        </span>
        <h1 className="mt-6 text-5xl font-bold sm:text-6xl">{hero.heading}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">{hero.description}</p>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Link
            href="auth"
            className="rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500 hover:text-slate-950"
          >
            {hero.cta}
          </Link>
          <span className="text-xs text-slate-400">{hero.credentialsHint}</span>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3">
        {highlights.map(({ title, copy }) => (
          <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
        <h2 className="text-2xl font-semibold text-slate-100">{pricing.heading}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {pricing.tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-5 ${
                tier.highlighted
                  ? "border-sky-500/40 bg-sky-500/10"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <h3 className="text-lg font-semibold text-slate-50">{tier.name}</h3>
              <ul
                className={`mt-3 space-y-2 text-sm ${
                  tier.highlighted ? "text-slate-200" : "text-slate-400"
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
