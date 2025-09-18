import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

import AuthForm from "./auth-form";

type AuthPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AuthPage({ params }: AuthPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return <AuthForm locale={locale} dictionary={dictionary.auth} />;
}
