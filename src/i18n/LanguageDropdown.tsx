import { useEffect, useId, useRef, useState } from "react";
import { APP_LANGUAGES } from "@/i18n/types";
import { useLanguage } from "@/i18n/LanguageProvider";
import "./language-dropdown.css";

type LanguageDropdownProps = {
  className?: string;
};

export default function LanguageDropdown({ className = "" }: LanguageDropdownProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLanguage =
    APP_LANGUAGES.find((item) => item.code === language) ?? APP_LANGUAGES[1];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={`language-dropdown${className ? ` ${className}` : ""}`}
      ref={containerRef}
    >
      <button
        type="button"
        className="language-dropdown__trigger"
        aria-label={t("language.switch")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="language-dropdown__flag" aria-hidden="true">
          {currentLanguage.flag}
        </span>
        <span className="language-dropdown__label">
          {t(currentLanguage.labelKey)}
        </span>
        <svg
          className={`language-dropdown__chevron${isOpen ? " language-dropdown__chevron--open" : ""}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          className="language-dropdown__menu"
          role="listbox"
          aria-label={t("language.switch")}
        >
          {APP_LANGUAGES.map(({ code, flag, labelKey }) => {
            const label = t(labelKey);
            const isSelected = language === code;

            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  className={`language-dropdown__option${
                    isSelected ? " language-dropdown__option--selected" : ""
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLanguage(code);
                    setIsOpen(false);
                  }}
                >
                  <span className="language-dropdown__flag" aria-hidden="true">
                    {flag}
                  </span>
                  <span className="language-dropdown__option-label">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
