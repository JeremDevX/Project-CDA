import { Check } from "lucide-react";
import Button from "../Button/Button";
import "./PricingSection.css";

const pricingPlans = [
  {
    title: "Offre Essentiel",
    badge: "Singulier",
    badgeColor: "default",
    features: [
      "1 destinataire unique",
      "Conservation 10 ans",
      "Message texte illimité",
    ],
    price: "19€",
    buttonColor: "default" as const,
    isPopular: false,
  },
  {
    title: "Offre Standard",
    badge: "Pluriel",
    badgeColor: "green",
    features: [
      "Jusqu'à 5 destinataires",
      "Conservation 35 ans",
      "Message texte illimité + 10 images HD",
    ],
    price: "39€",
    buttonColor: "green" as const,
    isPopular: true,
  },
  {
    title: "Offre Premium",
    badge: "Absolu",
    badgeColor: "gold",
    features: [
      "Destinataires illimités",
      "Conservation à vie",
      "Texte + images illimités",
    ],
    price: "49€",
    buttonColor: "gold" as const,
    isPopular: false,
  },
];

export default function PricingSection() {
  return (
    <section className="pricing">
      <h2 className="pricing__title">Tarification</h2>
      <div className="pricing__list">
        {pricingPlans.map((plan) => (
          <div
            key={plan.title}
            className={[
              "pricing__card",
              plan.isPopular ? "pricing__card--featured" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="pricing__card-header">
              {plan.isPopular ? (
                <span className="pricing__popular">La plus populaire</span>
              ) : null}
              <div className="pricing__price">{plan.price}</div>
              <h3 className="pricing__plan-title">{plan.title}</h3>
              <span
                className={[
                  "pricing__badge",
                  plan.badgeColor !== "default"
                    ? `pricing__badge--${plan.badgeColor}`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {plan.badge}
              </span>
            </div>

            <ul className="pricing__features">
              {plan.features.map((feature) => (
                <li key={feature} className="pricing__feature">
                  <Check className="pricing__feature-icon" size={16} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              type="cta"
              color={plan.buttonColor}
              href="/login"
              label="Je choisis cette offre"
              fullWidth
            />
          </div>
        ))}
      </div>
    </section>
  );
}
