import { InfoIcon } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useDebounceCallback } from "usehooks-ts";
import { getGiftById, updateGift, type GiftEditionStep } from "./api/gifts";
import Button from "./components/Button/Button";
import GiftTitleForm from "./components/GiftTitleForm/GiftTitleForm";
import GiftMessageEditor from "./components/GiftMessageEditor/GiftMessageEditor";
import GiftStepNav from "./components/GiftStepNav/GiftStepNav";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftCompositionPage.css";

const MAX_GIFT_TITLE_LENGTH = 250;
const AUTOSAVE_DELAY_MS = 1500;

export default function GiftCompositionPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);

  const [titleValue, setTitleValue] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autosaveMessage, setAutosaveMessage] = useState("");
  const [lastEditionStep, setLastEditionStep] =
    useState<GiftEditionStep | null>(null);
  const hasLoadedGiftRef = useRef(false);
  const latestDraftRef = useRef({
    title: "",
    message: "",
  });
  const isAutosavingRef = useRef(false);
  const hasPendingAutosaveRef = useRef(false);
  const autosavePromiseRef = useRef<Promise<void> | null>(null);

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
        const loadedDraft = {
          title: response.gift.title ?? "",
          message: response.gift.message ?? "",
        };

        latestDraftRef.current = loadedDraft;
        setTitleValue(loadedDraft.title);
        setMessageValue(loadedDraft.message);
        setLastEditionStep(response.gift.lastEditionStep ?? null);
        hasLoadedGiftRef.current = true;
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadGift();
  }, [token, numericGiftId]);

  const saveGiftComposition = useCallback(
    async (
      nextTitle: string,
      nextMessage: string,
      nextLastEditionStep?: GiftEditionStep,
    ) => {
      if (!token || !Number.isInteger(numericGiftId)) {
        return;
      }

      await updateGift(token, numericGiftId, {
        title: nextTitle,
        message: nextMessage,
        ...(nextLastEditionStep
          ? { lastEditionStep: nextLastEditionStep }
          : {}),
      });
    },
    [token, numericGiftId],
  );

  const handleAutosave = useCallback(async () => {
    if (isAutosavingRef.current) {
      hasPendingAutosaveRef.current = true;
      return;
    }

    isAutosavingRef.current = true;

    const autosavePromise = (async () => {
      let shouldSaveAgain = true;

      while (shouldSaveAgain) {
        hasPendingAutosaveRef.current = false;

        setAutosaveMessage("Enregistrement automatique...");
        await saveGiftComposition(
          latestDraftRef.current.title,
          latestDraftRef.current.message,
        );
        setAutosaveMessage("Brouillon enregistré");
        setErrorMessage("");

        shouldSaveAgain = hasPendingAutosaveRef.current;
      }
    })();

    autosavePromiseRef.current = autosavePromise;

    try {
      await autosavePromise;
    } catch (error) {
      setAutosaveMessage("");
      setErrorMessage(getErrorMessage(error));
    } finally {
      isAutosavingRef.current = false;
      autosavePromiseRef.current = null;
    }
  }, [saveGiftComposition]);

  const debouncedAutosave = useDebounceCallback(
    handleAutosave,
    AUTOSAVE_DELAY_MS,
  );

  function handleTitleChange(nextTitle: string) {
    latestDraftRef.current = {
      ...latestDraftRef.current,
      title: nextTitle,
    };
    setTitleValue(nextTitle);

    if (!hasLoadedGiftRef.current) {
      return;
    }

    debouncedAutosave();
  }

  function handleMessageChange(nextMessage: string) {
    latestDraftRef.current = {
      ...latestDraftRef.current,
      message: nextMessage,
    };
    setMessageValue(nextMessage);

    if (!hasLoadedGiftRef.current) {
      return;
    }

    debouncedAutosave();
  }

  async function handleNext() {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }
    debouncedAutosave.cancel();
    hasPendingAutosaveRef.current = false;
    setIsSaving(true);
    setErrorMessage("");

    try {
      await autosavePromiseRef.current;
      await saveGiftComposition(
        latestDraftRef.current.title,
        latestDraftRef.current.message,
        "images",
      );
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
      {Number.isInteger(numericGiftId) ? (
        <GiftStepNav
          giftId={numericGiftId}
          currentStep="composition"
          lastEditionStep={lastEditionStep}
        />
      ) : null}

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
          onTitleChange={handleTitleChange}
          maxLength={MAX_GIFT_TITLE_LENGTH}
          disabled={isLoading || isSaving}
        />
        <GiftMessageEditor
          value={messageValue}
          onChange={handleMessageChange}
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
      {autosaveMessage ? (
        <p className="gift-composition-page__autosave">{autosaveMessage}</p>
      ) : null}
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
