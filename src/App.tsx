import "./app.css";
import { useEffect, useRef } from "react";
import AppRoutes from "./AppRoutes";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { authApi } from "./api/authClient";
import Header from "./pages/Header";

// TODO: make an interceptor so that /auth/refresh is always called, when accessToken expires

function AppContent() {
  const { setAccessToken, isAuthReady, setIsAuthReady } = useAuth();
  const hasInitializedRef = useRef(false);

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
    return <div>Lade...</div>;
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
      <AppContent />
    </AuthProvider>
  );
}