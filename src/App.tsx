import "./app.css";
import { useEffect, useRef, type ReactElement } from "react";
import AppRoutes from "@/AppRoutes";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageProvider";
import { authApi, setAccessTokenGetter } from "@/api/authClient";
import Header from "@/pages/header/Header";

// TODO: make an interceptor so that /auth/refresh is always called, when accessToken expires

function AppContent() {
  const { accessToken, setAccessToken, isAuthReady, setIsAuthReady } = useAuth();
  const { t } = useLanguage();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    async function refresh() {
      try {
        const data = await authApi.refreshAccessToken();
        setAccessToken(data.accessToken);
      } catch {
        setAccessToken(null);
      } finally {
        setIsAuthReady(true);
      }
    }

    refresh();
  }, [setAccessToken, setIsAuthReady]);

  if (!isAuthReady) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <>
      <Header />
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}