import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en"),
  placeholder: () => import("./dictionaries/placeholder"),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[keyof typeof dictionaries]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const loadDictionary = dictionaries[locale] ?? dictionaries.en;
  const dictionaryModule = await loadDictionary();
  return dictionaryModule.default;
};
