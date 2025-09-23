import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en"),
  placeholder: () => import("./dictionaries/placeholder"),
} as const;

type DictionaryModule = Awaited<
  ReturnType<(typeof dictionaries)[keyof typeof dictionaries]>
>;

export type Dictionary = DictionaryModule["default"];

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const loadDictionary = dictionaries[locale] ?? dictionaries.en;
  const dictionaryModule = await loadDictionary();
  return dictionaryModule.default;
};
