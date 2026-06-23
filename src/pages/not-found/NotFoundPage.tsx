import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageProvider";
import "./notfound.css";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{t("notFound.message")}</p>
      <Link to="/login">{t("common.backToLogin")}</Link>
    </div>
  );
}
