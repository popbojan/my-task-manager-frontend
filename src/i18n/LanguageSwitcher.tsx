import { APP_LANGUAGES } from "@/i18n/types";
import { useLanguage } from "@/i18n/LanguageProvider";
import "./language-switcher.css";

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`language-switcher${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={t("language.switch")}
    >
      {APP_LANGUAGES.map(({ code, flag, labelKey }) => (
        <button
          key={code}
          type="button"
          className={`language-switcher__button${
            language === code ? " language-switcher__button--active" : ""
          }`}
          onClick={() => setLanguage(code)}
          aria-label={t(labelKey)}
          title={t(labelKey)}
        >
          <span className="language-switcher__flag" aria-hidden="true">
            {flag}
          </span>
        </button>
      ))}
    </div>
  );
}
