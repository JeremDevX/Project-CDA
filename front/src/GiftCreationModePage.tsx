import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { updateGiftCreationMode } from "./api/gifts";
import Button from "./components/Button/Button";
import CreationModeSelection from "./components/CreationModeSelection/CreationModeSelection";
import type { CreationModeId } from "./data/creationModes";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftCreationModePage.css";

export default function GiftCreationModePage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const [selectedMode, setSelectedMode] = useState<CreationModeId>("free");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const numericGiftId = Number(giftId);
  const previousStepPath = Number.isInteger(numericGiftId)
    ? `/gifts/${numericGiftId}/pricing`
    : "/dashboard";

  async function handleNext() {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await updateGiftCreationMode(token, numericGiftId, selectedMode);
      navigate(`/gifts/${numericGiftId}/title`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="gift-creation-mode-page">
      <CreationModeSelection
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
      />

      {errorMessage && (
        <p className="gift-creation-mode-page__error">{errorMessage}</p>
      )}

      <div className="gift-creation-mode-page__actions">
        <Button type="secondary" label="Retour" href={previousStepPath} />
        <Button
          type="primary"
          label={isSaving ? "Enregistrement" : "Suivant"}
          onClick={handleNext}
          disabled={isSaving}
        />
      </div>
    </section>
  );
}
