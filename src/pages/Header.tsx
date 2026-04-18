import "./header.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authApi } from "../api/authClient";

export default function Header() {
  const { accessToken, setAccessToken } = useAuth();
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
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}