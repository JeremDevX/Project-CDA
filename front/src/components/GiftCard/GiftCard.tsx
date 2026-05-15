import {
  ChevronRight,
  Clock3,
  Ellipsis,
  ImageIcon,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router";
import "./GiftCard.css";

type GiftStatus = "draft" | "active";

interface GiftCardProps {
  id: number;
  title: string;
  status: GiftStatus;
  completion: number;
  editPath: string;
  recipientCount: number;
  imageCount?: number;
  videoCount?: number;
  draftExpirationMessage?: string;
  recipientLimit?: number | null;
  imageLimit?: number | null;
  videoLimit?: number;
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

function formatUsageLabel(
  count: number,
  limit: number | null,
  singular: string,
  plural: string,
) {
  const limitLabel = limit === null ? "∞" : limit;
  const unit = limit === 1 || count === 1 ? singular : plural;

  return {
    countLabel: `${count}/${limitLabel}`,
    unitLabel: unit,
  };
}

export default function GiftCard(props: GiftCardProps) {
  const cardCopy = getCardCopy(props.status);
  const recipientStat =
    props.recipientLimit !== undefined
      ? formatUsageLabel(
          props.recipientCount,
          props.recipientLimit,
          "destinataire",
          "destinataires",
        )
      : {
          countLabel: String(props.recipientCount),
          unitLabel: `destinataire${props.recipientCount > 1 ? "s" : ""}`,
        };
  const imageStat =
    props.imageLimit !== undefined
      ? formatUsageLabel(
          props.imageCount ?? 0,
          props.imageLimit,
          "image",
          "images",
        )
      : props.imageCount
        ? {
            countLabel: String(props.imageCount),
            unitLabel: `image${props.imageCount > 1 ? "s" : ""}`,
          }
        : null;
  const videoStat =
    props.videoLimit !== undefined
      ? formatUsageLabel(
          props.videoCount ?? 0,
          props.videoLimit,
          "vidéo",
          "vidéos",
        )
      : null;

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
            <span className="gift-card__stat-copy">
              <strong>{recipientStat.countLabel}</strong>
              <small>{recipientStat.unitLabel}</small>
            </span>
          </p>

          {imageStat ? (
            <p className="gift-card__stat">
              <ImageIcon size={14} />
              <span className="gift-card__stat-copy">
                <strong>{imageStat.countLabel}</strong>
                <small>{imageStat.unitLabel}</small>
              </span>
            </p>
          ) : null}

          {videoStat ? (
            <p className="gift-card__stat">
              <Video size={14} />
              <span className="gift-card__stat-copy">
                <strong>{videoStat.countLabel}</strong>
                <small>{videoStat.unitLabel}</small>
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <Link className="gift-card__action" to={props.editPath}>
        <span>{cardCopy.action}</span>
        <ChevronRight size={16} />
      </Link>
    </article>
  );
}
