import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/api/authClient";
import { useAuth } from "@/auth/AuthContext";
import { translations, type TranslationKey } from "@/i18n/locales";
import {
  apiLanguageFromApp,
  appLanguageFromApi,
  DEFAULT_APP_LANGUAGE,
  LOCALE_BY_LANGUAGE,
  type AppLanguage,
} from "@/i18n/types";

const STORAGE_KEY = "app-language";

type LanguageContextType = {
  language: AppLanguage;
  locale: string;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function readStoredLanguage(): AppLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === "de" || stored === "en" || stored === "sr") {
    return stored;
  }

  return DEFAULT_APP_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [language, setLanguageState] = useState<AppLanguage>(readStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    async function syncFromUser() {
      try {
        const user = await authApi.getCurrentUser();
        const userLanguage = appLanguageFromApi(user.language);
        setLanguageState(userLanguage);
        localStorage.setItem(STORAGE_KEY, userLanguage);
      } catch {
        // Keep local preference when profile cannot be loaded.
      }
    }

    syncFromUser();
  }, [accessToken]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>) => {
      let text =
        translations[language][key] ??
        translations[DEFAULT_APP_LANGUAGE][key] ??
        key;

      if (params) {
        for (const [paramKey, value] of Object.entries(params)) {
          text = text.replaceAll(`{{${paramKey}}}`, value);
        }
      }

      return text;
    },
    [language],
  );

  const setLanguage = useCallback(
    (nextLanguage: AppLanguage) => {
      setLanguageState(nextLanguage);
      localStorage.setItem(STORAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage;

      if (!accessToken) {
        return;
      }

      authApi
        .updateUserPreferences({
          updateUserPreferencesRequest: {
            language: apiLanguageFromApp(nextLanguage),
          },
        })
        .catch((error) => {
          console.error("Failed to save language preference", error);
        });
    },
    [accessToken],
  );

  const value = useMemo(
    () => ({
      language,
      locale: LOCALE_BY_LANGUAGE[language],
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}

export function useApiLanguage() {
  const { language } = useLanguage();
  return apiLanguageFromApp(language);
}
