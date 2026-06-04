import "./Header.css";
import { Gift, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import Button from "../Button/Button";

import { useUserState } from "../../store/useAppStore";
import { useEffect, useState } from "react";
import { logoutUser } from "../../api/auth";
import { getErrorMessage } from "../../helpers/helpers";

export default function Header() {
  const user = useUserState((state) => state.user);
  const token = useUserState((state) => state.token);
  const clearAuthData = useUserState((state) => state.clearAuthData);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    setLogoutError("");

    if (!token) {
      clearAuthData();
      setIsMenuOpen(false);
      navigate("/login", { replace: true });
      return;
    }

    try {
      setIsLoggingOut(true);
      await logoutUser(token);
      clearAuthData();
      setIsMenuOpen(false);
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
      <button
        className="header__menu-button"
        type="button"
        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isMenuOpen}
        aria-controls="header-actions"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <div
        id="header-actions"
        className={`header__actions ${isMenuOpen ? "header__actions--open" : ""}`}
      >
        {user ? (
          <>
            <div className="header__user">
              <span className="header__avatar" aria-hidden="true">
                {user.username.slice(0, 1).toUpperCase()}
              </span>
              <p className="header__welcome" title={user.username}>
                <span className="header__welcome-label">Bonjour,</span>
                <span className="header__welcome-name">{user.username}</span>
              </p>
            </div>
            <Button
              type="primary"
              href="/dashboard"
              label="Espace"
              icon={<LayoutDashboard size={18} />}
              iconPosition="left"
              className="header__button"
            />
            <Button
              type="secondary"
              href="/account"
              label="Compte"
              icon={<User size={18} />}
              iconPosition="left"
              className="header__button"
            />
            <Button
              type="secondary"
              onClick={handleLogout}
              disabled={isLoggingOut}
              label={isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
              icon={<LogOut size={18} />}
              iconPosition="left"
              className="header__button header__button--logout"
            />
          </>
        ) : (
          <>
            <Button
              type="secondary"
              href="/login"
              label="Se connecter"
              className="header__button"
            />
            <Button
              type="primary"
              href="/register"
              label="Inscription"
              className="header__button"
              dataTestId="nav-register"
            />
          </>
        )}

        {logoutError && <p className="header__error">{logoutError}</p>}
      </div>
    </header>
  );
}
