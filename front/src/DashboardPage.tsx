import { PlusIcon } from "lucide-react";
import "./DashboardPage.css";
import Button from "./components/Button/Button";
import GiftCard from "./components/GiftCard/GiftCard";

import { useState } from "react";
import { useNavigate } from "react-router";
import { createGift } from "./api/gifts";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";

const mockGifts = [
  {
    id: "1",
    title: "Mon premier gift",
    status: "draft" as const,
    updatedLabel: "Il y a 2 jours",
    completion: 65,
    recipientCount: 3,
    imageCount: 5,
  },
  {
    id: "2",
    title: "Second Gift",
    status: "active" as const,
    updatedLabel: "Il y a 2 jours",
    completion: 100,
    recipientCount: 3,
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = useUserState((state) => state.token);
  const [isCreatingGift, setIsCreatingGift] = useState(false);
  const [createGiftError, setCreateGiftError] = useState("");

  async function handleCreateGift() {
    if (!token || isCreatingGift) {
      return;
    }

    setIsCreatingGift(true);
    setCreateGiftError("");

    try {
      const data = await createGift(token);
      navigate(`/gifts/${data.gift.id}/pricing`);
    } catch (error) {
      setCreateGiftError(getErrorMessage(error));
    } finally {
      setIsCreatingGift(false);
    }
  }
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
            label={isCreatingGift ? "Création en cours" : "Créer un gift"}
            icon={<PlusIcon size={16} />}
            iconPosition="left"
            onClick={handleCreateGift}
            disabled={isCreatingGift}
          />
        </div>
        {createGiftError && (
          <p className="dashboard-page__error">{createGiftError}</p>
        )}
        <div className="dashboard-page__gift-list">
          {mockGifts.map((gift) => (
            <GiftCard
              key={gift.id}
              title={gift.title}
              status={gift.status}
              updatedLabel={gift.updatedLabel}
              completion={gift.completion}
              recipientCount={gift.recipientCount}
              imageCount={gift.imageCount}
            />
          ))}
        </div>
        {mockGifts.length === 0 && (
          <div className="dashboard-page__empty-state">
            <p className="dashboard-page__empty-title">
              Aucun gift pour le moment
            </p>
            <p className="dashboard-page__empty-text">
              Vous n'avez encore aucun gift associé à votre compte. Créez votre
              premier gift pour démarrer.
            </p>
            <Button
              type="cta"
              href="/gifts/new"
              label="Créer mon premier gift"
            />
          </div>
        )}
      </div>
    </section>
  );
}
