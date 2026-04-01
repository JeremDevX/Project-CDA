import type { ReactNode } from "react";
import { Link } from "react-router";
import "./Button.css";

interface ButtonProps {
  type?: "primary" | "secondary" | "cta";
  href?: string;
  fullWidth?: boolean;
  onClick?: () => void;
  label: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right" | "both";
  disabled?: boolean;
  color?: "default" | "green" | "gold";
  className?: string;
}

function renderIcon(icon: ReactNode, shouldRender: boolean) {
  return shouldRender ? <span className="app-button-icon">{icon}</span> : null;
}

export default function Button(props: ButtonProps) {
  const variant = props.type ?? "primary";
  const color = props.color ?? "default";
  const className = [
    "app-button",
    `app-button-${variant}`,
    `app-button-color-${color}`,
    props.fullWidth ? "app-button-full-width" : "",
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {renderIcon(
        props.icon,
        props.iconPosition === "left" || props.iconPosition === "both",
      )}
      <span className="app-button-label">{props.label}</span>
      {renderIcon(
        props.icon,
        props.iconPosition === "right" || props.iconPosition === "both",
      )}
    </>
  );

  if (props.href) {
    if (props.href.startsWith("/")) {
      return (
        <Link className={className} to={props.href}>
          {content}
        </Link>
      );
    }

    return (
      <a className={className} href={props.href}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={className}
      onClick={props.onClick}
      disabled={props.disabled}
      type="button"
    >
      {content}
    </button>
  );
}
