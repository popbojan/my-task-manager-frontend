import { de, type TranslationKey } from "./de";
import { en } from "./en";
import { sr } from "./sr";
import type { AppLanguage } from "../types";

export type { TranslationKey };

export const translations: Record<AppLanguage, Record<TranslationKey, string>> =
  {
    de,
    en,
    sr,
  };
