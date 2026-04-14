import { PlusIcon } from "lucide-react";
import "./DashboardPage.css";
import Button from "./components/Button/Button";
import GiftCard from "./components/GiftCard/GiftCard";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createGift, getGifts, type Gift } from "./api/gifts";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = useUserState((state) => state.token);
  const [isCreatingGift, setIsCreatingGift] = useState(false);
  const [createGiftError, setCreateGiftError] = useState("");

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(true);
  const [loadGiftsError, setLoadGiftsError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    async function loadGifts() {
      setIsLoadingGifts(true);
      setLoadGiftsError("");

      try {
        if (token) {
          const data = await getGifts(token);
          setGifts(data.gifts);
        }
      } catch (error) {
        setLoadGiftsError(getErrorMessage(error));
      } finally {
        setIsLoadingGifts(false);
      }
    }

    loadGifts();
  }, [token]);

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

          {gifts.length > 0 && (
            <Button
              type="primary"
              label={isCreatingGift ? "Création en cours" : "Créer un gift"}
              icon={<PlusIcon size={16} />}
              iconPosition="left"
              onClick={handleCreateGift}
              disabled={isCreatingGift}
            />
          )}
        </div>
        {createGiftError && (
          <p className="dashboard-page__error">{createGiftError}</p>
        )}
        <div className="dashboard-page__gift-list">
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              title={gift.title}
              status={gift.status === "active" ? "active" : "draft"}
              updatedLabel={`Mis à jour le ${new Date(
                gift.updatedAt,
              ).toLocaleDateString("fr-FR")}`}
              completion={gift.status === "active" ? 100 : 0}
              recipientCount={0}
              imageCount={0}
            />
          ))}
        </div>
        {gifts.length === 0 && isLoadingGifts && (
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
              label={
                isCreatingGift ? "Création en cours" : "Créer mon premier gift"
              }
              onClick={handleCreateGift}
              disabled={isCreatingGift}
            />
          </div>
        )}
        {loadGiftsError && (
          <p className="dashboard-page__error">{loadGiftsError}</p>
        )}
      </div>
    </section>
  );
}
