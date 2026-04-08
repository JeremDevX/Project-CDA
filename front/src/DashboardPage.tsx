import { PlusIcon } from "lucide-react";
import "./DashboardPage.css";
import Button from "./components/Button/Button";

export default function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-page__panel">
        <div className="dashboard-page__panel-header">
          <div>
            <h2 className="dashboard-page__section-title">Mes gifts</h2>
            <p className="dashboard-page__section-subtitle">
              Gérez vos messages posthumes en toute sécurité. Vos brouillons
              sont conservés gratuitement jusqu'à 30 jours.
            </p>
          </div>

          <Button
            type="primary"
            href="/gifts/new"
            label="Créer un gift"
            icon={<PlusIcon size={16} />}
            iconPosition="left"
          />
        </div>

        <div className="dashboard-page__empty-state">
          <p className="dashboard-page__empty-title">
            Aucun gift pour le moment
          </p>
          <p className="dashboard-page__empty-text">
            Vous n'avez encore aucun gift associé à votre compte. Créez votre
            premier gift pour démarrer.
          </p>
          <Button type="cta" href="/gifts/new" label="Créer mon premier gift" />
        </div>
      </div>
    </section>
  );
}
