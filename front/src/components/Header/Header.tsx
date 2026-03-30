import "./Header.css";
import { Gift } from "lucide-react";
import Button from "../Button/Button";

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <Gift className="logo-icon" size={24} />
        <span className="logo-text">LegacyGift</span>
      </div>
      <div className="header-actions">
        <Button type="secondary" href="#login" label="Se connecter" />
        <Button type="primary" href="#signup" label="Inscription" />
      </div>
    </header>
  );
}
