import "./Header.css";
import { Gift } from "lucide-react";
import { Link } from "react-router";
import Button from "../Button/Button";

export default function Header() {
  return (
    <header className="header">
      <Link className="header-brand" to="/">
        <Gift className="logo-icon" size={24} />
        <span className="logo-text">LegacyGift</span>
      </Link>
      <div className="header-actions">
        <Button type="secondary" href="/login" label="Se connecter" />
        <Button type="primary" href="/login" label="Inscription" />
      </div>
    </header>
  );
}
