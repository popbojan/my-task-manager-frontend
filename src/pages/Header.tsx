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
      <div className="app-header__brand">Task Manager</div>

      <button
        type="button"
        className="app-header__logout"
        onClick={handleLogout}
        aria-label="Abmelden"
        title="Abmelden"
      >
        <svg
          className="app-header__logout-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
        </svg>
      </button>
    </header>
  );
}
