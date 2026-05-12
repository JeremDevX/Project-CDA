import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getGiftById, updateGift } from "./api/gifts";
import Button from "./components/Button/Button";
import OfferSelection from "./components/OfferSelection/OfferSelection";
import type { OfferPlanId } from "./data/offerPlans";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftPricingPage.css";

export default function GiftPricingPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const [selectedOffer, setSelectedOffer] = useState<OfferPlanId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const numericGiftId = Number(giftId);

  useEffect(() => {
    async function loadGift() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setIsLoading(false);
        setErrorMessage("Gift introuvable");
        return;
      }

      try {
        const response = await getGiftById(token, numericGiftId);
        setSelectedOffer(response.gift.offer ?? null);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadGift();
  }, [token, numericGiftId]);

  async function handleStart() {
    if (!token || !selectedOffer || !Number.isInteger(numericGiftId)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await updateGift(token, numericGiftId, {
        offer: selectedOffer,
        lastEditionStep: "creation-mode",
      });
      navigate(`/gifts/${numericGiftId}/creation-mode`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="gift-pricing-page">
      <OfferSelection
        selectedOffer={selectedOffer}
        onSelectOffer={setSelectedOffer}
      />

      {errorMessage && (
        <p className="gift-pricing-page__error">{errorMessage}</p>
      )}

      <div className="gift-pricing-page__actions">
        <Button type="secondary" label="Retour" href="/dashboard" />
        <Button
          type="primary"
          label={isSaving ? "Enregistrement" : "Commencer"}
          onClick={handleStart}
          disabled={!selectedOffer || isLoading || isSaving}
        />
      </div>
    </section>
  );
}
