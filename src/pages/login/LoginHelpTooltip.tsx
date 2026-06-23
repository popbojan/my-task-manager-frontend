import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function LoginHelpTooltip() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popoverId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="login-help" ref={containerRef}>
      <button
        type="button"
        className="login-help__trigger"
        aria-label={t("login.help.trigger")}
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg
          className="login-help__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
      </button>

      {isOpen && (
        <div
          id={popoverId}
          className="login-help__popover"
          role="tooltip"
        >
          <p className="login-help__title">{t("login.help.title")}</p>
          <ol className="login-help__steps">
            <li>{t("login.help.step1")}</li>
            <li>{t("login.help.step2")}</li>
            <li>{t("login.help.step3")}</li>
          </ol>
          <p className="login-help__note">{t("login.help.note")}</p>
        </div>
      )}
    </div>
  );
}
