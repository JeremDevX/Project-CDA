import { ChevronLeft, ChevronRight, Info, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { confirmGift, getGiftById, type GiftEditionStep } from "./api/gifts";
import Button from "./components/Button/Button";
import GiftStepNav from "./components/GiftStepNav/GiftStepNav";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftConfirmationsPage.css";

type ConfirmationKey =
  | "respectAndKindnessConfirmed"
  | "contactDetailsConfirmed"
  | "activationConfirmed";

const confirmationItems: {
  key: ConfirmationKey;
  title: string;
  text: string;
}[] = [
  {
    key: "respectAndKindnessConfirmed",
    title: "Respect et bienveillance",
    text: "Je certifie que le contenu de ce message (texte et images) est conforme à nos conditions d'utilisation et ne contient aucun propos haineux ou illégal.",
  },
  {
    key: "contactDetailsConfirmed",
    title: "Validation des coordonnées",
    text: "Je confirme avoir vérifié l'identité et les coordonnées de mes destinataires ainsi que de mes tiers de confiance pour assurer le succès de la transmission.",
  },
  {
    key: "activationConfirmed",
    title: "Finalisation et activation",
    text: "Je comprends que ma création est actuellement enregistrée en tant que brouillon (valable 30 jours) et qu'elle ne sera activée et protégée pour le futur qu'après mon choix d'offre finale.",
  },
];

const emptyConfirmations = {
  respectAndKindnessConfirmed: false,
  contactDetailsConfirmed: false,
  activationConfirmed: false,
};

export default function GiftConfirmationsPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);

  const [confirmations, setConfirmations] = useState(emptyConfirmations);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastEditionStep, setLastEditionStep] =
    useState<GiftEditionStep | null>(null);

  useEffect(() => {
    async function loadGift() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getGiftById(token, numericGiftId);
        const hasConfirmed = Boolean(response.gift.finalConfirmationsAt);
        setLastEditionStep(response.gift.lastEditionStep ?? null);
        setConfirmations({
          respectAndKindnessConfirmed: hasConfirmed,
          contactDetailsConfirmed: hasConfirmed,
          activationConfirmed: hasConfirmed,
        });
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadGift();
  }, [token, numericGiftId]);

  const canContinue =
    confirmations.respectAndKindnessConfirmed &&
    confirmations.contactDetailsConfirmed &&
    confirmations.activationConfirmed;

  function updateConfirmation(key: ConfirmationKey) {
    setConfirmations((currentConfirmations) => ({
      ...currentConfirmations,
      [key]: !currentConfirmations[key],
    }));
  }

  async function handleContinue() {
    if (!token || !Number.isInteger(numericGiftId) || !canContinue) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await confirmGift(token, numericGiftId, {
        finalConfirmationsAccepted: true,
      });
      navigate(`/gifts/${numericGiftId}/summary`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="gift-confirmations-page">
      {Number.isInteger(numericGiftId) ? (
        <GiftStepNav
          giftId={numericGiftId}
          currentStep="confirmations"
          lastEditionStep={lastEditionStep}
        />
      ) : null}

      <div className="gift-confirmations-page__content">
        <header className="gift-confirmations-page__header">
          <span className="gift-confirmations-page__icon">
            <ShieldCheck size={34} />
          </span>
          <h1>Dernières confirmations</h1>
          <p>
            Avant de sécuriser votre héritage numérique, merci de confirmer
            votre accord sur ces points essentiels. Cela garantit le respect et
            la bonne transmission de votre message.
          </p>
        </header>

        {isLoading ? (
          <p className="gift-confirmations-page__status">Chargement...</p>
        ) : null}

        <div className="gift-confirmations-page__list">
          {confirmationItems.map((item) => (
            <label className="gift-confirmations-page__item" key={item.key}>
              <input
                type="checkbox"
                checked={confirmations[item.key]}
                onChange={() => updateConfirmation(item.key)}
              />
              <span className="gift-confirmations-page__checkbox" />
              <span>
                <strong>{item.title}</strong>
                <small>{item.text}</small>
              </span>
            </label>
          ))}
        </div>

        <aside className="gift-confirmations-page__notice">
          <Info size={20} />
          <p>
            Vos données sont intégralement chiffrées. Conformément à notre
            politique de confidentialité, personne n'y aura accès avant la
            validation de vos tiers de confiance, le moment venu.
          </p>
        </aside>

        {errorMessage ? (
          <p className="gift-confirmations-page__error">{errorMessage}</p>
        ) : null}
      </div>

      <div className="gift-confirmations-page__footer">
        <Button
          type="secondary"
          label="Retour"
          href={`/gifts/${numericGiftId}/trusted-thirds`}
          icon={<ChevronLeft size={16} />}
          iconPosition="left"
        />
        <Button
          type="primary"
          label="Suivant"
          onClick={handleContinue}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
          disabled={isLoading || isSubmitting || !canContinue}
        />
      </div>
    </section>
  );
}
