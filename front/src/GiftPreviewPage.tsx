import { Check, CircleHelp, Maximize2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getGiftById,
  updateGift,
  type Gift,
  type GiftEditionStep,
} from "./api/gifts";
import { getGiftMedias, type GiftMedia } from "./api/giftMedia";
import Button from "./components/Button/Button";
import GiftStepNav from "./components/GiftStepNav/GiftStepNav";
import GiftPreviewPlayer from "./components/GiftPreviewPlayer/GiftPreviewPlayer";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftPreviewPage.css";

const previewInfoItems = [
  {
    icon: Pencil,
    title: "Gardez le contrôle",
    text: "Rien n'est définitif. Tant que votre Gift n'est pas activé, vous pouvez revenir en arrière pour ajuster vos mots ou changer vos photos.",
  },
  {
    icon: Maximize2,
    title: "Lisible partout",
    text: "Que vos proches ouvrent ce message sur un ordinateur, une tablette ou un smartphone, la mise en page s'adaptera parfaitement pour eux.",
  },
  {
    icon: CircleHelp,
    title: "Nous sommes là pour vous",
    text: "Une question sur le rendu ou besoin d'aide pour la mise en forme ? Notre équipe vous accompagne à chaque étape de votre création.",
  },
];

export default function GiftPreviewPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);

  const [gift, setGift] = useState<Gift | null>(null);
  const [medias, setMedias] = useState<GiftMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastEditionStep, setLastEditionStep] =
    useState<GiftEditionStep | null>(null);

  useEffect(() => {
    async function loadPreview() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        const [giftResponse, mediaResponse] = await Promise.all([
          getGiftById(token, numericGiftId),
          getGiftMedias(token, numericGiftId),
        ]);

        setGift(giftResponse.gift);
        setLastEditionStep(giftResponse.gift.lastEditionStep ?? null);
        setMedias(mediaResponse.medias);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadPreview();
  }, [token, numericGiftId]);

  async function handleNext() {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    setIsSavingStep(true);
    setErrorMessage("");

    try {
      await updateGift(token, numericGiftId, { lastEditionStep: "recipients" });
      navigate(`/gifts/${numericGiftId}/recipients`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingStep(false);
    }
  }

  return (
    <section className="gift-preview-page">
      {Number.isInteger(numericGiftId) ? (
        <GiftStepNav
          giftId={numericGiftId}
          currentStep="preview"
          lastEditionStep={lastEditionStep}
        />
      ) : null}

      <div className="gift-preview-page__content">
        <header className="gift-preview-page__header">
          <span className="gift-preview-page__kicker">
            Mode prévisualisation
          </span>
          <h1>Découvrez le message qu'ils recevront</h1>
          <p>
            Prenez un instant pour relire votre message. <br /> C'est ainsi que
            vos proches découvriront vos mots et vos images une fois le moment
            venu.
          </p>
        </header>

        {isLoading ? (
          <p className="gift-preview-page__status">Chargement...</p>
        ) : null}

        {errorMessage ? (
          <p className="gift-preview-page__error">{errorMessage}</p>
        ) : null}

        {!isLoading && gift ? (
          <GiftPreviewPlayer
            title={gift.title}
            message={gift.message}
            medias={medias}
          />
        ) : null}

        {!isLoading && gift ? (
          <div className="gift-preview-page__info-list">
            {previewInfoItems.map((item) => (
              <div key={item.title} className="gift-preview-page__info-item">
                <span className="gift-preview-page__info-icon">
                  <item.icon size={20} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="gift-preview-page__footer">
        <Button
          type="secondary"
          label="Modifier le contenu"
          href={`/gifts/${numericGiftId}/composition`}
          icon={<Pencil size={16} />}
          iconPosition="left"
        />
        <Button
          type="primary"
          label={isSavingStep ? "Enregistrement" : "Tout est correct"}
          onClick={handleNext}
          icon={<Check size={18} />}
          iconPosition="right"
          disabled={isLoading || isSavingStep || !gift}
        />
      </div>
    </section>
  );
}
