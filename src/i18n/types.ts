import { Language } from "@/api/generated";

export type AppLanguage = "de" | "en" | "sr";

export const APP_LANGUAGES: {
  code: AppLanguage;
  apiLanguage: Language;
  flag: string;
  labelKey: "language.de" | "language.en" | "language.sr";
}[] = [
  { code: "sr", apiLanguage: Language.Sr, flag: "🇷🇸", labelKey: "language.sr" },
  { code: "de", apiLanguage: Language.De, flag: "🇩🇪", labelKey: "language.de" },
  { code: "en", apiLanguage: Language.En, flag: "🇬🇧", labelKey: "language.en" },
];

export const DEFAULT_APP_LANGUAGE: AppLanguage = "de";

export const LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  de: "de-DE",
  en: "en-GB",
  sr: "sr-RS",
};

export function appLanguageFromApi(language: Language): AppLanguage {
  switch (language) {
    case Language.En:
      return "en";
    case Language.Sr:
      return "sr";
    default:
      return "de";
  }
}

export function apiLanguageFromApp(language: AppLanguage): Language {
  const match = APP_LANGUAGES.find((item) => item.code === language);
  return match?.apiLanguage ?? Language.De;
}
