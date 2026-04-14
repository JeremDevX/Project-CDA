import {
  CheckIcon,
  ImageIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import { offerPlans, type OfferPlanId } from "../../data/offerPlans";
import "./OfferSelection.css";

type OfferSelectionProps = {
  selectedOffer: OfferPlanId | null;
  onSelectOffer: (offer: OfferPlanId) => void;
};

const demoRecipients = [
  {
    initials: "CL",
    name: "Claire Laurent",
    detail: "claire.laurent@email.com",
  },
  {
    initials: "PL",
    name: "Pierre Laurent",
    detail: "pierre.laurent@email.com",
  },
  {
    initials: "EL",
    name: "Emma Laurent",
    detail: "emma.laurent@email.com",
  },
];

const demoTrustedContacts = [
  {
    initials: "TM",
    name: "Thomas Moreau",
    detail: "Frère",
  },
  {
    initials: "SB",
    name: "Sophie Bernard",
    detail: "Amie",
  },
  {
    initials: "AM",
    name: "Antoine Martin",
    detail: "Ami",
  },
];

const imageLabels = ["Souvenir", "Paysage", "Photo de famille", "Portrait"];

export default function OfferSelection({
  selectedOffer,
  onSelectOffer,
}: OfferSelectionProps) {
  const activeOffer =
    offerPlans.find((plan) => plan.id === selectedOffer) ?? offerPlans[1];
  const visibleRecipients = demoRecipients.slice(
    0,
    activeOffer.recipientPreviewCount,
  );
  const visibleImages = imageLabels.slice(0, activeOffer.imagePreviewCount);
  const recipientLimit = activeOffer.recipientLimit ?? "illimité";
  const recipientCounter = `${visibleRecipients.length}/${recipientLimit}`;
  const mediaCounter =
    activeOffer.imageLimit === null
      ? `${visibleImages.length}/illimité`
      : `${visibleImages.length}/${activeOffer.imageLimit}`;
  const imageCounter =
    activeOffer.allowsVideo && visibleImages.length > 0
      ? `${mediaCounter} + vidéo`
      : mediaCounter;

  return (
    <div className="offer-selection">
      <header className="offer-selection__header">
        <h2>Ne laissez rien au hasard, transmettez l'essentiel</h2>
        <p>
          Ce modèle vous montre comment vos souvenirs seront mis en valeur.
          <br />
          Textes, photos ou vidéos : composez aujourd'hui le cadeau qui
          accompagnera vos proches demain.
        </p>
      </header>

      <div className="offer-selection__demo-layout">
        <article className="offer-selection__demo-card">
          <div className="offer-selection__demo-ribbon">Démonstration</div>

          <section className="offer-selection__message">
            <p className="offer-selection__section-title">
              <MessageSquareIcon size={16} />
              Votre futur message
            </p>
            <h3>À ma chère famille et mes amis</h3>
            <p>
              Si vous lisez ceci, c'est que le moment est venu. Je voulais vous
              laisser un dernier témoignage de mon affection.
            </p>
            <p>
              Ne soyez pas tristes trop longtemps, souvenez-vous des bons
              moments passés ensemble...
            </p>
          </section>

          <section className="offer-selection__images">
            <p className="offer-selection__section-title">
              <ImageIcon size={16} />
              Vos médias ({imageCounter})
            </p>
            <p className="offer-selection__media-note">
              {activeOffer.imageLimitLabel} · {activeOffer.videoLabel}
            </p>

            {visibleImages.length > 0 || activeOffer.allowsVideo ? (
              <div className="offer-selection__image-grid">
                {visibleImages.map((label) => (
                  <div
                    className="offer-selection__image-placeholder"
                    key={label}
                  >
                    {label}
                  </div>
                ))}
                {activeOffer.allowsVideo && (
                  <div className="offer-selection__image-placeholder offer-selection__image-placeholder--video">
                    Vidéo
                  </div>
                )}
              </div>
            ) : (
              <p className="offer-selection__empty-note">
                Cette offre garde le message au format texte. Les images sont
                disponibles avec les offres Standard et Premium.
              </p>
            )}
          </section>
        </article>

        <aside className="offer-selection__side">
          <section className="offer-selection__side-section">
            <div className="offer-selection__side-title">
              <UsersIcon size={16} />
              <span>Destinataires</span>
              <strong>{recipientCounter}</strong>
            </div>

            <p className="offer-selection__side-note">
              {activeOffer.recipientLimitLabel}
            </p>

            {visibleRecipients.map((recipient) => (
              <div className="offer-selection__person" key={recipient.name}>
                <span>{recipient.initials}</span>
                <div>
                  <strong>{recipient.name}</strong>
                  <small>{recipient.detail}</small>
                </div>
              </div>
            ))}
          </section>

          <section className="offer-selection__side-section">
            <div className="offer-selection__side-title">
              <ShieldCheckIcon size={16} />
              <span>Tiers de confiance</span>
            </div>

            {demoTrustedContacts.map((contact) => (
              <div className="offer-selection__person" key={contact.name}>
                <span>{contact.initials}</span>
                <div>
                  <strong>{contact.name}</strong>
                  <small>{contact.detail}</small>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>

      <div className="offer-selection__plans">
        {offerPlans.map((plan) => {
          const isSelected = selectedOffer === plan.id;

          return (
            <button
              key={plan.id}
              aria-pressed={isSelected}
              className={[
                "offer-selection__plan",
                `offer-selection__plan--${plan.id}`,
                isSelected ? "offer-selection__plan--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="button"
              onClick={() => onSelectOffer(plan.id)}
            >
              <span className="offer-selection__plan-radio" />

              <span className="offer-selection__plan-header">
                <strong>{plan.title}</strong>
                <span className="offer-selection__price">
                  {plan.price}
                  <small>{plan.taxLabel}</small>
                </span>
              </span>

              {plan.badge ? (
                <span className="offer-selection__badge">{plan.badge}</span>
              ) : null}

              <span className="offer-selection__features">
                {plan.features.map((feature) => (
                  <span key={feature}>
                    <CheckIcon size={14} />
                    {feature}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
