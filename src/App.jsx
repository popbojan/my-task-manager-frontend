import { useEffect } from "react";
import AppRoutes from "./AppRoutes.jsx";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { authApi } from "./api/authClient.js";

function AppContent() {
    const { setAccessToken } = useAuth();

    useEffect(() => {
        async function refresh() {
            try {
                const data = await authApi.refresh();
                setAccessToken(data.accessToken);
            } catch (err) {
                console.log("User not logged in");
            }
        }

        refresh();
    }, []);

    return <AppRoutes />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}