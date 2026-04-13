import { Link } from "react-router-dom";
import "./notfound.css";

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Seite nicht gefunden.</p>
      <Link to="/login">Zurück zum Login</Link>
    </div>
  );
}