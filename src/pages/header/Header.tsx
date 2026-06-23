import "./header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { authApi } from "@/api/authClient";
import { useLanguage } from "@/i18n/LanguageProvider";
import LanguageDropdown from "@/i18n/LanguageDropdown";
import type { TranslationKey } from "@/i18n/locales";

const NAV_ITEMS: {
  to: string;
  labelKey: TranslationKey;
}[] = [
  { to: "/tasks", labelKey: "header.nav.tasks" },
  { to: "/recurring-tasks", labelKey: "header.nav.recurringTasks" },
];

function isNavItemActive(path: string, pathname: string): boolean {
  if (path === "/tasks") {
    return pathname === "/tasks";
  }

  return pathname === path;
}

export default function Header() {
  const { accessToken, setAccessToken } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isHeroHeader =
    location.pathname === "/recurring-tasks" ||
    location.pathname === "/tasks";

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
    <header
      className={`app-header${isHeroHeader ? " app-header--hero" : ""}`}
    >
      <div className="app-header__brand">{t("header.brand")}</div>

      <nav className="app-header__nav" aria-label={t("header.nav.main")}>
        {NAV_ITEMS.map(({ to, labelKey }) => {
          const active = isNavItemActive(to, location.pathname);

          return (
            <Link
              key={to}
              to={to}
              className={
                active
                  ? "app-header__nav-link app-header__nav-link--active"
                  : "app-header__nav-link"
              }
              aria-current={active ? "page" : undefined}
            >
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="app-header__actions">
        <LanguageDropdown className="language-dropdown--login app-header__language" />
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
