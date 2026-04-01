import type { LucideIcon } from "lucide-react";
import "./InfoCard.css";

interface InfoCardProps {
  icon: LucideIcon;
  iconTone: "purple" | "teal" | "orange";
  title: string;
  text: string;
}

export default function InfoCard(props: InfoCardProps) {
  const Icon = props.icon;

  return (
    <div className="info-card">
      <Icon className={`info-card-icon info-card-icon-${props.iconTone}`} size={24} />
      <h3 className="info-card-title">{props.title}</h3>
      <p className="info-card-text">{props.text}</p>
    </div>
  );
}
