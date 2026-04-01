import { Gift, Network, ShieldCheck, EyeOff, Scale, FileText } from "lucide-react";
import Button from "./components/Button/Button";
import HowItWorksSection from "./components/HowItWorksSection/HowItWorksSection";
import InfoCard from "./components/InfoCard/InfoCard";
import PricingSection from "./components/PricingSection/PricingSection";
import "./LandingPage.css";

export default function LandingPage() {
  const valueProps = [
    {
      icon: Network,
      iconTone: "purple" as const,
      title: "Création guidée",
      text: "Un espace serein pour poser vos pensées. Notre interface vous accompagne pas à pas pour rédiger des messages qui comptent.",
    },
    {
      icon: ShieldCheck,
      iconTone: "teal" as const,
      title: "Activation de confiance",
      text: "Aucun déclenchement automatique arbitraire. La livraison est validée par un quorum de vos proches de confiance que vous aurez choisis.",
    },
    {
      icon: EyeOff,
      iconTone: "orange" as const,
      title: "Confidentialité maîtrisée",
      text: "Vos données sont limitées au strict nécessaire et utilisées uniquement pour assurer la transmission de vos messages, selon vos paramètres.",
    },
  ];

  const trustItems = [
    {
      icon: Scale,
      iconTone: "teal" as const,
      title: "Simplicité juridique",
      text: "Pas de notaire, pas de procédure complexe. Un service privé qui complète vos dispositions existantes.",
    },
    {
      icon: ShieldCheck,
      iconTone: "purple" as const,
      title: "Contrôle du contenu",
      text: "Vous pouvez modifier votre gift tant qu'il est en brouillon, puis via une option après activation.",
    },
    {
      icon: FileText,
      iconTone: "orange" as const,
      title: "Éthique et transparence",
      text: "Un processus clair, sans exploitation de données, conçu pour respecter votre intention.",
    },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Vos derniers mots, au moment où ils comptent le plus.
          </h1>
          <p className="hero-subtitle">
            Préparez des messages et des souvenirs à transmettre à vos proches
            après votre départ. Un système de validation par tiers de confiance
            garantit une livraison maîtrisée et humaine.
          </p>
          <div className="hero-cta">
            <Button type="primary" href="/login" label="Commencer mon héritage" />
            <Button
              type="secondary"
              href="#protocol"
              label="Découvrir le protocole"
            />
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow"></div>
          <div className="hero-glow-secondary"></div>
          <div className="hero-visual-card">
            <Gift className="logo-icon hero-card-icon" size={24} />
            <h3 className="visual-card-title">Message personnel</h3>
            <p className="visual-card-text">
              Une parole importante, écrite aujourd'hui, préservée et transmise
              avec attention demain.
            </p>
          </div>
        </div>
      </section>
      <section className="value-prop">
        <h2 className="section-title">Proposition de valeur</h2>
        <div className="value-prop-list">
          {valueProps.map((item) => (
            <InfoCard
              key={item.title}
              icon={item.icon}
              iconTone={item.iconTone}
              title={item.title}
              text={item.text}
            />
          ))}
        </div>
      </section>

      <HowItWorksSection />

      <PricingSection />

      <section className="value-prop">
        <h2 className="section-title">Confiance et sécurité</h2>
        <div className="value-prop-list">
          {trustItems.map((item) => (
            <InfoCard
              key={item.title}
              icon={item.icon}
              iconTone={item.iconTone}
              title={item.title}
              text={item.text}
            />
          ))}
        </div>
      </section>

      <section className="final-cta">
        <span className="final-cta-kicker">Prêt à commencer</span>
        <h1 className="final-cta-title">
          Préparez l'avenir, libérez votre présent.
        </h1>
        <p className="final-cta-text">
          Commencez simplement avec un premier message, puis faites évoluer le à
          votre rythme.
        </p>
        <Button
          type="primary"
          href="/login"
          label="Créer mon premier message"
          className="final-cta-button"
        />
      </section>
    </>
  );
}
