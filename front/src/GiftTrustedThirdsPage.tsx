import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createGiftTrustedThird,
  deleteGiftTrustedThird,
  getGiftTrustedThirds,
  type GiftTrustedThird,
  validateGiftTrustedThirds,
} from "./api/giftTrustedThirds";
import { getGiftById, updateGift, type GiftEditionStep } from "./api/gifts";
import Button from "./components/Button/Button";
import GiftStepNav from "./components/GiftStepNav/GiftStepNav";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftTrustedThirdsPage.css";

const emptyForm = {
  fullName: "",
  email: "",
  relation: "",
  phone: "",
};

const REQUIRED_TRUSTED_THIRD_COUNT = 3;

export default function GiftTrustedThirdsPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);

  const [trustedThirds, setTrustedThirds] = useState<GiftTrustedThird[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastEditionStep, setLastEditionStep] =
    useState<GiftEditionStep | null>(null);

  useEffect(() => {
    async function loadTrustedThirds() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        const [giftResponse, trustedThirdsResponse] = await Promise.all([
          getGiftById(token, numericGiftId),
          getGiftTrustedThirds(token, numericGiftId),
        ]);
        setLastEditionStep(giftResponse.gift.lastEditionStep ?? null);
        setTrustedThirds(trustedThirdsResponse.trustedThirds);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadTrustedThirds();
  }, [token, numericGiftId]);

  const isFormComplete =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.relation.trim() &&
    formData.phone.trim();
  const canAddTrustedThird =
    trustedThirds.length < REQUIRED_TRUSTED_THIRD_COUNT;

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !Number.isInteger(numericGiftId) || !canAddTrustedThird) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await createGiftTrustedThird(token, numericGiftId, {
        fullName: formData.fullName,
        email: formData.email,
        relation: formData.relation,
        phone: formData.phone,
      });

      setTrustedThirds((currentTrustedThirds) => [
        ...currentTrustedThirds,
        response.trustedThird,
      ]);
      setFormData(emptyForm);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(trustedThirdId: number) {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    try {
      await deleteGiftTrustedThird(token, numericGiftId, trustedThirdId);
      setTrustedThirds((currentTrustedThirds) =>
        currentTrustedThirds.filter(
          (trustedThird) => trustedThird.id !== trustedThirdId,
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function handleContinue() {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    try {
      setIsSavingStep(true);
      setErrorMessage("");
      await validateGiftTrustedThirds(token, numericGiftId);
      await updateGift(token, numericGiftId, {
        lastEditionStep: "confirmations",
      });
      navigate(`/gifts/${numericGiftId}/confirmations`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingStep(false);
    }
  }

  return (
    <section className="gift-trusted-thirds-page">
      {Number.isInteger(numericGiftId) ? (
        <GiftStepNav
          giftId={numericGiftId}
          currentStep="trusted-thirds"
          lastEditionStep={lastEditionStep}
        />
      ) : null}

      <div className="gift-trusted-thirds-page__content">
        <header className="gift-trusted-thirds-page__header">
          <h1>Désignez vos tiers de confiance</h1>
          <p>
            Choisissez les personnes qui confirmeront le moment venu le
            déclenchement de votre transmission. Par sécurité, elles n'auront
            jamais accès au contenu de votre message.
          </p>
        </header>

        <aside className="gift-trusted-thirds-page__notice">
          <span>
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>Sécurité et Vie Privée</strong>
            <p>
              Le rôle d'un tiers est strictement administratif. Ils reçoivent un
              lien de confirmation uniquement le moment venu. Votre message
              reste chiffré et strictement privé : aucun contenu personnel ne
              leur est partagé.
            </p>
          </div>
        </aside>

        {isLoading ? (
          <p className="gift-trusted-thirds-page__status">Chargement...</p>
        ) : null}

        <form
          className="gift-trusted-thirds-page__form"
          onSubmit={handleSubmit}
        >
          <div className="gift-trusted-thirds-page__form-title">
            <UserPlus size={22} />
            <div>
              <h2>Nouvelle personne de confiance</h2>
              <p>Renseignez les informations de la personne de confiance.</p>
            </div>
          </div>

          <div className="gift-trusted-thirds-page__form-grid">
            <label>
              <span>NOM COMPLET</span>
              <div className="gift-trusted-thirds-page__input">
                <User size={18} />
                <input
                  type="text"
                  value={formData.fullName}
                  placeholder="Jean Dupont"
                  maxLength={120}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                />
              </div>
            </label>

            <label>
              <span>EMAIL</span>
              <div className="gift-trusted-thirds-page__input">
                <Mail size={18} />
                <input
                  type="email"
                  value={formData.email}
                  placeholder="jean@exemple.fr"
                  maxLength={254}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
            </label>

            <label>
              <span>RELATION</span>
              <div className="gift-trusted-thirds-page__input">
                <Users size={18} />
                <input
                  type="text"
                  value={formData.relation}
                  placeholder="Ex: Frère, Ami."
                  maxLength={80}
                  onChange={(event) =>
                    updateField("relation", event.target.value)
                  }
                />
              </div>
            </label>

            <label className="gift-trusted-thirds-page__phone-field">
              <span>Téléphone</span>
              <div className="gift-trusted-thirds-page__input">
                <Phone size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  placeholder="+33 1 23 45 67 89"
                  maxLength={30}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </div>
            </label>

            <button
              type="submit"
              className="gift-trusted-thirds-page__submit"
              disabled={isSubmitting || !isFormComplete || !canAddTrustedThird}
            >
              Ajouter
            </button>
          </div>
        </form>

        <section className="gift-trusted-thirds-page__list">
          <div className="gift-trusted-thirds-page__list-title">
            <h2>LISTE DES TIERS DÉSIGNÉS</h2>
            <span>{trustedThirds.length} / 3</span>
          </div>

          <div className="gift-trusted-thirds-page__table">
            {trustedThirds.map((trustedThird) => (
              <div
                className="gift-trusted-thirds-page__row"
                key={trustedThird.id}
              >
                <div className="gift-trusted-thirds-page__person">
                  <strong>{trustedThird.fullName}</strong>
                  <span>
                    <Mail size={15} />
                    {trustedThird.email}
                  </span>
                </div>
                <div className="gift-trusted-thirds-page__detail">
                  <small>Relation</small>
                  <span>{trustedThird.relation}</span>
                </div>
                <div className="gift-trusted-thirds-page__detail">
                  <small>Téléphone</small>
                  <span>{trustedThird.phone}</span>
                </div>
                <button
                  type="button"
                  aria-label="Supprimer ce tiers de confiance"
                  onClick={() => handleDelete(trustedThird.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}

            {!isLoading && trustedThirds.length === 0 ? (
              <p className="gift-trusted-thirds-page__empty">
                Aucun tiers de confiance ajouté.
              </p>
            ) : null}
          </div>
        </section>

        {errorMessage ? (
          <p className="gift-trusted-thirds-page__error">{errorMessage}</p>
        ) : null}
      </div>

      <div className="gift-trusted-thirds-page__footer">
        <Button
          type="secondary"
          label="Retour"
          href={`/gifts/${numericGiftId}/recipients`}
          icon={<ChevronLeft size={16} />}
          iconPosition="left"
        />
        <Button
          type="primary"
          label={isSavingStep ? "Enregistrement" : "Suivant"}
          onClick={handleContinue}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
          disabled={
            isLoading ||
            isSavingStep ||
            trustedThirds.length !== REQUIRED_TRUSTED_THIRD_COUNT
          }
        />
      </div>
    </section>
  );
}
