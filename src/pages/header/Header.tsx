import "./header.css";
import { NavLink, useNavigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "@/auth/AuthContext";
import { authApi } from "@/api/authClient";
import { useLanguage } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import type { TranslationKey } from "@/i18n/locales";

function TasksNavIcon() {
  return (
    <svg className="app-header__nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

function RecurringNavIcon() {
  return (
    <svg className="app-header__nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6V3L8 7l4 4V8c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 17.03 20 15.57 20 14c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 9.74C4.46 10.97 4 12.43 4 14c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
    </svg>
  );
}

const NAV_ITEMS: {
  to: string;
  labelKey: TranslationKey;
  icon: ReactElement;
}[] = [
  { to: "/tasks", labelKey: "header.nav.tasks", icon: <TasksNavIcon /> },
  {
    to: "/recurring-tasks",
    labelKey: "header.nav.recurringTasks",
    icon: <RecurringNavIcon />,
  },
];

export default function Header() {
  const { accessToken, setAccessToken } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!accessToken) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setAccessToken(null);
      navigate("/login");
    }
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">{t("header.brand")}</div>

      <nav className="app-header__nav" aria-label={t("header.nav.main")}>
        {NAV_ITEMS.map(({ to, labelKey, icon }) => {
          const label = t(labelKey);

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `app-header__nav-link${isActive ? " app-header__nav-link--active" : ""}`
              }
              title={label}
            >
              {icon}
              <span className="app-header__nav-label">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="app-header__actions">
        <LanguageSwitcher />
        <button
          type="button"
          className="app-header__logout"
          onClick={handleLogout}
          aria-label={t("header.logout")}
          title={t("header.logout")}
        >
          <svg
            className="app-header__logout-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
