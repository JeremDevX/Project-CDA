import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getGiftById, updateGiftMessage } from "./api/gifts";
import Button from "./components/Button/Button";
import GiftTitleForm from "./components/GiftTitleForm/GiftTitleForm";
import GiftMessageEditor from "./components/GiftMessageEditor/GiftMessageEditor";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftCompositionPage.css";

const MAX_GIFT_TITLE_LENGTH = 250;

export default function GiftCompositionPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);

  const [titleValue, setTitleValue] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const numericGiftId = Number(giftId);
  const previousStepPath = Number.isInteger(numericGiftId)
    ? `/gifts/${numericGiftId}/creation-mode`
    : "/dashboard";

  useEffect(() => {
    async function loadGift() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setIsLoading(false);
        setErrorMessage("Gift introuvable");
        return;
      }

      try {
        const response = await getGiftById(token, numericGiftId);
        setTitleValue(response.gift.title ?? "");
        setMessageValue(response.gift.message ?? "");
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadGift();
  }, [token, numericGiftId]);

  async function handleNext() {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await updateGiftMessage(token, numericGiftId, {
        title: titleValue,
        message: messageValue,
      });
      navigate(`/gifts/${numericGiftId}/images`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }
  const isMessageEmpty =
    messageValue
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length === 0;

  const isSubmitDisabled =
    isLoading || isSaving || titleValue.trim().length === 0 || isMessageEmpty;

  return (
    <section className="gift-composition-page">
      <div className="gift-composition-page__content">
        <header className="gift-composition-page__header">
          <h1>Composition du message</h1>
          <p>Prenez le temps d'exprimer ce qui compte vraiment.</p>
          <small>
            Votre brouillon est enregistré en temps réel et restera accessible
            durant 30 jours avant activation.
          </small>
        </header>

        <GiftTitleForm
          titleValue={titleValue}
          onTitleChange={setTitleValue}
          maxLength={MAX_GIFT_TITLE_LENGTH}
          disabled={isLoading || isSaving}
        />
        <GiftMessageEditor
          value={messageValue}
          onChange={setMessageValue}
          disabled={isLoading || isSaving}
        />

        <aside className="gift-composition-page__notice">
          <span className="gift-composition-page__notice-icon">
            <InfoIcon size={18} />
          </span>
          <div>
            <strong>Un doute sur la rédaction ?</strong>
            <p>
              Ne vous souciez pas de la forme parfaite. Parlez avec votre coeur.
              Vous pourrez revenir modifier ce message à tout moment tant que le
              gift n'est pas activé.
            </p>
          </div>
        </aside>
      </div>

      {errorMessage ? (
        <p className="gift-composition-page__error">{errorMessage}</p>
      ) : null}

      <div className="gift-composition-page__actions">
        <Button type="secondary" label="Retour" href={previousStepPath} />
        <Button
          type="primary"
          label={isSaving ? "Enregistrement" : "Enregistrer et Suivant"}
          onClick={handleNext}
          disabled={isSubmitDisabled}
        />
      </div>
    </section>
  );
}
