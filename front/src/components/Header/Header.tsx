import "./Header.css";
import { Gift } from "lucide-react";
import { Link } from "react-router";
import Button from "../Button/Button";

import { useUserState } from "../../store/useAppStore";

export default function Header() {
  const user = useUserState((state) => state.user);

  return (
    <header className="header">
      <Link className="header-brand" to="/">
        <Gift className="logo-icon" size={24} />
        <span className="logo-text">LegacyGift</span>
      </Link>
      {
        <div className="header-actions">
          {user ? (
            <>
              <Button type="secondary" href="/dashboard" label="Mon espace" />
              <p>Bienvenue, {user.username}! </p>
            </>
          ) : (
            <>
              <Button type="secondary" href="/login" label="Se connecter" />
              <Button type="primary" href="/register" label="Inscription" />
            </>
          )}
        </div>
      }
    </header>
  );
}
