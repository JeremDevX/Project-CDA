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
      <h2 className="section-title">Tarification</h2>
      <div className="pricing-list">
        {pricingPlans.map((plan) => (
          <div
            key={plan.title}
            className={[
              "pricing-card",
              plan.isPopular ? "pricing-card-featured" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="pricing-card-header">
              {plan.isPopular ? (
                <span className="pricing-popular">La plus populaire</span>
              ) : null}
              <div className="pricing-price">{plan.price}</div>
              <h3 className="pricing-title">{plan.title}</h3>
              <span
                className={[
                  "pricing-badge",
                  plan.badgeColor !== "default" ? plan.badgeColor : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {plan.badge}
              </span>
            </div>

            <ul className="pricing-features">
              {plan.features.map((feature) => (
                <li key={feature} className="pricing-feature">
                  <Check className="pricing-feature-icon" size={16} />
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
