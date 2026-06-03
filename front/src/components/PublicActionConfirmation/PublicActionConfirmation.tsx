import type { ReactNode } from "react";
import { Info } from "lucide-react";
import "./PublicActionConfirmation.css";

type PublicActionConfirmationProps = {
  icon?: ReactNode;
  title: string;
  message: string;
  statusMessage?: string;
  errorMessage?: string;
  notice?: string;
};

export default function PublicActionConfirmation({
  icon,
  title,
  message,
  statusMessage,
  errorMessage,
  notice,
}: PublicActionConfirmationProps) {
  return (
    <section className="public-action-confirmation">
      <div className="public-action-confirmation__content">
        <span className="public-action-confirmation__icon" aria-hidden="true">
          {icon ?? <Info size={34} />}
        </span>

        <header className="public-action-confirmation__header">
          <h1>{title}</h1>
          <p>{message}</p>
        </header>

        {statusMessage ? (
          <p className="public-action-confirmation__status">{statusMessage}</p>
        ) : null}

        {errorMessage ? (
          <p className="public-action-confirmation__error">{errorMessage}</p>
        ) : null}

        {notice && !errorMessage && !statusMessage ? (
          <aside className="public-action-confirmation__notice">{notice}</aside>
        ) : null}
      </div>
    </section>
  );
}
