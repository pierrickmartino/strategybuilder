export const i18n = {
  defaultLocale: "en",
  locales: ["en", "placeholder"] as const,
};

export type Locale = (typeof i18n.locales)[number];

export const isLocale = (value: string): value is Locale =>
  i18n.locales.includes(value as Locale);
