import "./Header.css";
import { Gift } from "lucide-react";
import { Link, useNavigate } from "react-router";
import Button from "../Button/Button";

import { useUserState } from "../../store/useAppStore";
import { useState } from "react";
import { logoutUser } from "../../api/auth";
import { getErrorMessage } from "../../helpers/helpers";

export default function Header() {
  const user = useUserState((state) => state.user);
  const token = useUserState((state) => state.token);
  const clearAuthData = useUserState((state) => state.clearAuthData);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setLogoutError("");

    if (!token) {
      clearAuthData();
      navigate("/login", { replace: true });
      return;
    }

    try {
      setIsLoggingOut(true);
      await logoutUser(token);
      clearAuthData();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(getErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="header">
      <Link className="header__brand" to="/">
        <Gift className="header__brand-icon" size={24} />
        <span className="header__brand-text">LegacyGift</span>
      </Link>
      <div className="header__actions">
        {user ? (
          <>
            <p className="header__welcome">Bienvenue, {user.username}!</p>
            <Button type="primary" href="/dashboard" label="Mon espace" />
            <Button type="primary" href="/account" label="Mon compte" />
            <Button
              type="secondary"
              onClick={handleLogout}
              disabled={isLoggingOut}
              label={isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
            />
          </>
        ) : (
          <>
            <Button type="secondary" href="/login" label="Se connecter" />
            <Button type="primary" href="/register" label="Inscription" />
          </>
        )}

        {logoutError && <p className="header__error">{logoutError}</p>}
      </div>
    </header>
  );
}
