import {
  Gift,
  Network,
  ShieldCheck,
  EyeOff,
  Scale,
  FileText,
} from "lucide-react";
import Button from "./components/Button/Button";
import HowItWorksSection from "./components/HowItWorksSection/HowItWorksSection";
import "./LandingPage.css";

export default function LandingPage() {
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
            <Button
              type="primary"
              href="#start"
              label="Commencer mon héritage"
            />
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
        <div className="vp-grid">
          <div className="vp-card">
            <Network className="vp-icon icon-purple" size={24} />
            <h3 className="vp-title">Création guidée</h3>
            <p className="vp-text">
              Un espace serein pour poser vos pensées. Notre interface vous
              accompagne pas à pas pour rédiger des messages qui comptent.
            </p>
          </div>
          <div className="vp-card">
            <ShieldCheck className="vp-icon icon-teal" size={24} />
            <h3 className="vp-title">Activation de confiance</h3>
            <p className="vp-text">
              Aucun déclenchement automatique arbitraire. La livraison est
              validée par un quorum de vos proches de confiance que vous aurez
              choisis.
            </p>
          </div>
          <div className="vp-card">
            <EyeOff className="vp-icon icon-orange" size={24} />
            <h3 className="vp-title">Confidentialité maîtrisée</h3>
            <p className="vp-text">
              Vos données sont limitées au strict nécessaire et utilisées
              uniquement pour assurer la transmission de vos messages, selon vos
              paramètres.
            </p>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      <section className="pricing">
        <h2 className="section-title">Tarification</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3 className="pricing-title">Offre Essentiel</h3>
            <div>
              <span className="pricing-badge">Jusqu'à 5 destinataires</span>
            </div>
            <p className="pricing-desc">
              Pour l'essentiel. Vos pensées les plus précieuses pour votre
              famille proche.
            </p>
            <div className="pricing-price">5€</div>
            <Button
              type="cta"
              href="#pricing-essentiel"
              label="CTA"
              fullWidth
            />
          </div>
          <div className="pricing-card pricing-card-featured">
            <span className="pricing-popular">La plus populaire</span>
            <h3 className="pricing-title">Offre Standard</h3>
            <div>
              <span className="pricing-badge green">
                Jusqu'à 15 destinataires
              </span>
            </div>
            <p className="pricing-desc">
              Le choix de la sérénité. Idéal pour transmettre à votre entourage.
            </p>
            <div className="pricing-price">15€</div>
            <Button
              type="cta"
              color="green"
              href="#pricing-standard"
              label="CTA"
              fullWidth
            />
          </div>
          <div className="pricing-card">
            <h3 className="pricing-title">Offre Premium</h3>
            <div>
              <span className="pricing-badge gold">
                Jusqu'à 50 destinataires
              </span>
            </div>
            <p className="pricing-desc">
              Une transmission plus large, pour inclure chaque personne
              importante.
            </p>
            <div className="pricing-price">50€</div>
            <Button
              type="cta"
              color="gold"
              href="#pricing-premium"
              label="CTA"
              fullWidth
            />
          </div>
        </div>
      </section>

      <section className="value-prop">
        <h2 className="section-title">Confiance et sécurité</h2>
        <div className="vp-grid">
          <div className="vp-card">
            <Scale className="vp-icon icon-teal" size={24} />
            <h3 className="vp-title">Simplicité juridique</h3>
            <p className="vp-text">
              Pas de notaire, pas de procédure complexe. Un service privé qui
              complète vos dispositions existantes.
            </p>
          </div>
          <div className="vp-card">
            <ShieldCheck className="vp-icon icon-purple" size={24} />
            <h3 className="vp-title">Contrôle du contenu</h3>
            <p className="vp-text">
              Vous pouvez modifier votre gift tant qu'il est en brouillon, puis
              via une option après activation.
            </p>
          </div>
          <div className="vp-card">
            <FileText className="vp-icon icon-orange" size={24} />
            <h3 className="vp-title">Éthique et transparence</h3>
            <p className="vp-text">
              Un processus clair, sans exploitation de données, conçu pour
              respecter votre intention.
            </p>
          </div>
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
          href="#"
          label="Créer mon premier message"
          className="final-cta-button"
        />
      </section>
    </>
  );
}
