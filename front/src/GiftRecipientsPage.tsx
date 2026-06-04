import {
  ChevronLeft,
  ChevronRight,
  Info,
  Mail,
  Phone,
  Trash2,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createGiftRecipient,
  deleteGiftRecipient,
  getGiftRecipients,
  type GiftRecipient,
} from "./api/giftRecipients";
import {
  getGiftById,
  updateGift,
  type Gift,
  type GiftEditionStep,
} from "./api/gifts";
import Button from "./components/Button/Button";
import GiftStepNav from "./components/GiftStepNav/GiftStepNav";
import { getErrorMessage } from "./helpers/helpers";
import { getGiftSlotSummary } from "./helpers/offerLimits";
import { useUserState } from "./store/useAppStore";
import "./GiftRecipientsPage.css";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
};

export default function GiftRecipientsPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);

  const [gift, setGift] = useState<Gift | null>(null);
  const [recipients, setRecipients] = useState<GiftRecipient[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastEditionStep, setLastEditionStep] =
    useState<GiftEditionStep | null>(null);

  useEffect(() => {
    async function loadRecipients() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        const [giftResponse, recipientsResponse] = await Promise.all([
          getGiftById(token, numericGiftId),
          getGiftRecipients(token, numericGiftId),
        ]);

        setGift(giftResponse.gift);
        setLastEditionStep(giftResponse.gift.lastEditionStep ?? null);
        setRecipients(recipientsResponse.recipients);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipients();
  }, [token, numericGiftId]);

  const limits = getGiftSlotSummary(gift?.offer);
  const recipientLimit = limits?.recipientLimit ?? null;
  const recipientCount = recipients.length;
  const counterLabel =
    recipientLimit === null
      ? `${recipientCount}/∞`
      : `${recipientCount}/${recipientLimit}`;
  const canAddRecipient =
    !isLoading &&
    !!limits &&
    (recipientLimit === null || recipientCount < recipientLimit);
  const isFormComplete =
    formData.fullName.trim() && formData.email.trim() && formData.phone.trim();

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !Number.isInteger(numericGiftId) || !canAddRecipient) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await createGiftRecipient(token, numericGiftId, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      setRecipients((currentRecipients) => [
        ...currentRecipients,
        response.recipient,
      ]);
      setFormData(emptyForm);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(recipientId: number) {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    try {
      await deleteGiftRecipient(token, numericGiftId, recipientId);
      setRecipients((currentRecipients) =>
        currentRecipients.filter((recipient) => recipient.id !== recipientId),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function handleNext() {
    if (!token || !Number.isInteger(numericGiftId) || recipients.length === 0) {
      return;
    }

    setIsSavingStep(true);
    setErrorMessage("");

    try {
      await updateGift(token, numericGiftId, {
        lastEditionStep: "trusted-thirds",
      });
      navigate(`/gifts/${numericGiftId}/trusted-thirds`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingStep(false);
    }
  }

  return (
    <section className="gift-recipients-page">
      {Number.isInteger(numericGiftId) ? (
        <GiftStepNav
          giftId={numericGiftId}
          currentStep="recipients"
          lastEditionStep={lastEditionStep}
        />
      ) : null}

      <div className="gift-recipients-page__content">
        <header className="gift-recipients-page__header">
          <h1>À qui souhaitez-vous transmettre ce message ?</h1>
          <p>Ajoutez les personnes qui recevront votre héritage numérique.</p>
          <p>
            Elles ne seront informées de son existence que lorsque vos tiers de
            confiance auront activé la transmission.
          </p>
        </header>

        {isLoading ? (
          <p className="gift-recipients-page__status">Chargement...</p>
        ) : null}

        {!isLoading && !limits ? (
          <p className="gift-recipients-page__error">
            Offre requise avant ajout de destinataire.
          </p>
        ) : null}

        {canAddRecipient ? (
          <form className="gift-recipients-page__form" onSubmit={handleSubmit}>
            <div className="gift-recipients-page__form-title">
              <span>
                <UserPlus size={22} />
              </span>
              <h2>Ajouter destinataire</h2>
            </div>

            <div className="gift-recipients-page__form-grid">
              <label>
                <span>Nom complet</span>
                <div className="gift-recipients-page__input">
                  <User size={18} />
                  <input
                    type="text"
                    data-testid="recipient-full-name"
                    value={formData.fullName}
                    placeholder="ex: Sophie Martin"
                    maxLength={120}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                  />
                </div>
              </label>

              <label>
                <span>Adresse email</span>
                <div className="gift-recipients-page__input">
                  <Mail size={18} />
                  <input
                    type="email"
                    data-testid="recipient-email"
                    value={formData.email}
                    placeholder="sophie@email.com"
                    maxLength={254}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                  />
                </div>
              </label>

              <label>
                <span>Téléphone</span>
                <div className="gift-recipients-page__input">
                  <Phone size={18} />
                  <input
                    type="tel"
                    data-testid="recipient-phone"
                    value={formData.phone}
                    placeholder="+33 1 23 45 67 89"
                    maxLength={30}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                  />
                </div>
              </label>

              <button
                type="submit"
                className="gift-recipients-page__submit"
                data-testid="recipient-add"
                disabled={isSubmitting || !isFormComplete}
              >
                Ajouter à la liste
              </button>
            </div>
          </form>
        ) : null}

        {!isLoading && limits && !canAddRecipient ? (
          <p className="gift-recipients-page__status">
            Limite de destinataires atteinte.
          </p>
        ) : null}

        <section className="gift-recipients-page__list">
          <div className="gift-recipients-page__list-title">
            <Users size={22} />
            <h2>Liste des destinataires</h2>
            <span>{counterLabel}</span>
          </div>

          <div className="gift-recipients-page__table">
            <div className="gift-recipients-page__row gift-recipients-page__row--head">
              <span>Nom</span>
              <span>Email</span>
              <span>Téléphone</span>
              <span>Action</span>
            </div>

            {recipients.map((recipient) => (
              <div className="gift-recipients-page__row" key={recipient.id}>
                <strong>{recipient.fullName}</strong>
                <span>{recipient.email}</span>
                <span>{recipient.phone}</span>
                <button
                  type="button"
                  aria-label="Supprimer ce destinataire"
                  onClick={() => handleDelete(recipient.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {!isLoading && recipients.length === 0 ? (
              <p className="gift-recipients-page__empty">
                Aucun destinataire ajouté.
              </p>
            ) : null}
          </div>
        </section>

        <aside className="gift-recipients-page__notice">
          <Info size={20} />
          <p>
            Les coordonnées de vos proches sont chiffrées et sécurisées. Aucune
            notification ne leur sera envoyée avant le déclenchement officiel de
            la transmission par vos tiers de confiance. Votre démarche reste
            totalement privée.
          </p>
        </aside>

        {errorMessage ? (
          <p className="gift-recipients-page__error">{errorMessage}</p>
        ) : null}
      </div>

      <div className="gift-recipients-page__footer">
        <Button
          type="secondary"
          label="Retour"
          href={`/gifts/${numericGiftId}/preview`}
          icon={<ChevronLeft size={16} />}
          iconPosition="left"
        />
        <Button
          type="primary"
          label={isSavingStep ? "Enregistrement" : "Suivant"}
          onClick={handleNext}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
          disabled={isLoading || isSavingStep || recipients.length === 0}
          dataTestId="gift-recipients-next"
        />
      </div>
    </section>
  );
}
