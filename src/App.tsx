import { useEffect, useState } from "react";
import AppRoutes from "./AppRoutes";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { authApi } from "./api/authClient";

function AppContent() {
  const { setAccessToken } = useAuth();
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    async function refresh() {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.accessToken);
      } catch (err) {
        console.log("User not logged in");
      } finally {
        setIsAuthLoading(false);
      }
    }

    refresh();
  }, [setAccessToken]);

  if (isAuthLoading) {
    return <div>Lade...</div>;
  }

  return <AppRoutes />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}