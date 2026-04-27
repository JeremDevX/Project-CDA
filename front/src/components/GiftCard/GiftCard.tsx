import { ChevronRight, Clock3, Ellipsis, ImageIcon, Users } from "lucide-react";
import { Link } from "react-router";
import "./GiftCard.css";

type GiftStatus = "draft" | "active";

interface GiftCardProps {
  id: number;
  title: string;
  status: GiftStatus;
  completion: number;
  recipientCount: number;
  imageCount?: number;
  draftExpirationMessage?: string;
}

function getCardCopy(status: GiftStatus) {
  if (status === "active") {
    return {
      badge: "Gift actif",
      action: "Voir le gift",
      progressColorClassName: "gift-card--active",
    };
  }

  return {
    badge: "Brouillon",
    action: "Continuer l'édition",
    progressColorClassName: "gift-card--draft",
  };
}

export default function GiftCard(props: GiftCardProps) {
  const cardCopy = getCardCopy(props.status);
  const editPath = `/gifts/${props.id}/pricing`;

  return (
    <article
      className={["gift-card", cardCopy.progressColorClassName].join(" ")}
    >
      <div className="gift-card__top-row">
        <span className="gift-card__badge">{cardCopy.badge}</span>
        <button
          type="button"
          className="gift-card__menu-button"
          aria-label={`Actions pour ${props.title}`}
        >
          <Ellipsis size={16} />
        </button>
      </div>

      <div className="gift-card__content">
        <h3 className="gift-card__title">{props.title}</h3>

        {props.status === "draft" && props.draftExpirationMessage ? (
          <p className="gift-card__meta gift-card__meta--warning">
            <Clock3 size={14} />
            <span>{props.draftExpirationMessage}</span>
          </p>
        ) : null}

        <div className="gift-card__progress-header">
          <span className="gift-card__progress-label">Complétion</span>
          <span className="gift-card__progress-value">{props.completion}%</span>
        </div>

        <div className="gift-card__progress-track" aria-hidden="true">
          <span
            className="gift-card__progress-fill"
            style={{ width: `${props.completion}%` }}
          />
        </div>

        <div className="gift-card__stats">
          <p className="gift-card__stat">
            <Users size={14} />
            <span>
              {props.recipientCount} destinataire
              {props.recipientCount > 1 ? "s" : ""}
            </span>
          </p>

          {props.imageCount && (
            <p className="gift-card__stat">
              <ImageIcon size={14} />
              <span>
                {props.imageCount} image
                {props.imageCount > 1 ? "s" : ""}
              </span>
            </p>
          )}
        </div>
      </div>

      {props.status === "draft" ? (
        <Link className="gift-card__action" to={editPath}>
          <span>{cardCopy.action}</span>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <button type="button" className="gift-card__action">
          <span>{cardCopy.action}</span>
          <ChevronRight size={16} />
        </button>
      )}
    </article>
  );
}
