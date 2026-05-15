import { Check, CreditCard, ShieldCheck, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import {
  getGiftRecipients,
  type GiftRecipient,
} from "./api/giftRecipients";
import {
  getGiftTrustedThirds,
  type GiftTrustedThird,
} from "./api/giftTrustedThirds";
import { getGiftMedias, type GiftMedia } from "./api/giftMedia";
import {
  createGiftCheckoutSession,
  getGiftById,
  validateGiftPayment,
  type Gift,
} from "./api/gifts";
import Button from "./components/Button/Button";
import GiftPreviewPlayer from "./components/GiftPreviewPlayer/GiftPreviewPlayer";
import GiftStepNav from "./components/GiftStepNav/GiftStepNav";
import { offerPlans } from "./data/offerPlans";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftSummaryPage.css";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function GiftSummaryPage() {
  const { giftId } = useParams();
  const [searchParams] = useSearchParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);
  const paymentStatus = searchParams.get("payment");
  const checkoutSessionId = searchParams.get("session_id");

  const [gift, setGift] = useState<Gift | null>(null);
  const [medias, setMedias] = useState<GiftMedia[]>([]);
  const [recipients, setRecipients] = useState<GiftRecipient[]>([]);
  const [trustedThirds, setTrustedThirds] = useState<GiftTrustedThird[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    async function loadSummary() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        const [
          giftResponse,
          mediaResponse,
          recipientsResponse,
          trustedThirdsResponse,
        ] = await Promise.all([
          getGiftById(token, numericGiftId),
          getGiftMedias(token, numericGiftId),
          getGiftRecipients(token, numericGiftId),
          getGiftTrustedThirds(token, numericGiftId),
        ]);

        setGift(giftResponse.gift);
        setMedias(mediaResponse.medias);
        setRecipients(recipientsResponse.recipients);
        setTrustedThirds(trustedThirdsResponse.trustedThirds);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadSummary();
  }, [token, numericGiftId]);

  useEffect(() => {
    async function validateReturnedPayment() {
      if (!token || !Number.isInteger(numericGiftId)) {
        return;
      }

      if (paymentStatus === "cancel") {
        setPaymentMessage("Paiement annulé. Votre gift reste en brouillon.");
        return;
      }

      if (paymentStatus !== "success" || !checkoutSessionId) {
        return;
      }

      try {
        setIsPaymentLoading(true);
        const response = await validateGiftPayment(
          token,
          numericGiftId,
          checkoutSessionId,
        );

        setGift(response.gift);
        setPaymentMessage("Paiement validé. Votre gift est activé.");
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsPaymentLoading(false);
      }
    }

    validateReturnedPayment();
  }, [token, numericGiftId, paymentStatus, checkoutSessionId]);

  async function handleStartPayment() {
    if (!token || !Number.isInteger(numericGiftId)) {
      setErrorMessage("Gift introuvable");
      return;
    }

    try {
      setErrorMessage("");
      setPaymentMessage("");
      setIsPaymentLoading(true);
      const response = await createGiftCheckoutSession(token, numericGiftId);

      window.location.assign(response.url);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsPaymentLoading(false);
    }
  }

  const selectedOffer = offerPlans.find((offer) => offer.id === gift?.offer);
  const isGiftActive = gift?.status === "active";

  return (
    <section className="gift-summary-page">
      {Number.isInteger(numericGiftId) ? (
        <GiftStepNav
          giftId={numericGiftId}
          currentStep="summary"
          lastEditionStep={gift?.lastEditionStep}
        />
      ) : null}

      <div className="gift-summary-page__grid">
        <div className="gift-summary-page__main">
          <header className="gift-summary-page__header">
            <h1>Vérifiez et activez votre Gift</h1>
            <p>
              Relisez une dernière fois les détails de votre message avant de
              sécuriser sa transmission pour le futur.
            </p>
          </header>

          {isLoading ? (
            <p className="gift-summary-page__status">Chargement...</p>
          ) : null}

          {errorMessage ? (
            <p className="gift-summary-page__error">{errorMessage}</p>
          ) : null}

          {paymentMessage ? (
            <p className="gift-summary-page__success">{paymentMessage}</p>
          ) : null}

          {!isLoading && gift ? (
            <GiftPreviewPlayer
              title={gift.title}
              message={gift.message}
              medias={medias}
            />
          ) : null}

          {!isLoading ? (
            <div className="gift-summary-page__people">
              <section>
                <h2>
                  <Users size={18} />
                  DESTINATAIRES
                </h2>
                <div className="gift-summary-page__people-list">
                  {recipients.map((recipient) => (
                    <article
                      className="gift-summary-page__person"
                      key={recipient.id}
                    >
                      <span>{getInitials(recipient.fullName)}</span>
                      <div>
                        <strong>{recipient.fullName}</strong>
                        <small>{recipient.email}</small>
                      </div>
                    </article>
                  ))}
                  {recipients.length === 0 ? (
                    <p className="gift-summary-page__empty">
                      Aucun destinataire ajouté.
                    </p>
                  ) : null}
                </div>
              </section>

              <section>
                <h2>
                  <ShieldCheck size={18} />
                  TIERS DE CONFIANCE
                </h2>
                <div className="gift-summary-page__people-list">
                  {trustedThirds.map((trustedThird) => (
                    <article
                      className="gift-summary-page__person"
                      key={trustedThird.id}
                    >
                      <span>
                        <UserRound size={18} />
                      </span>
                      <div>
                        <strong>{trustedThird.fullName}</strong>
                        <small>{trustedThird.relation}</small>
                      </div>
                    </article>
                  ))}
                  {trustedThirds.length === 0 ? (
                    <p className="gift-summary-page__empty">
                      Aucun tiers de confiance ajouté.
                    </p>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <aside className="gift-summary-page__aside">
          <div className="gift-summary-page__offer-header">
            <h2>Votre offre</h2>
            <p>Récapitulatif de votre offre.</p>
          </div>

          {selectedOffer ? (
            <section className="gift-summary-page__offer-card">
              <div className="gift-summary-page__offer-title">
                <strong>{selectedOffer.title}</strong>
                <p>
                  {selectedOffer.price}
                  <span>{selectedOffer.taxLabel}</span>
                </p>
                <i aria-hidden="true" />
              </div>
              <ul>
                {selectedOffer.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="gift-summary-page__status">Offre non sélectionnée.</p>
          )}

          <label className="gift-summary-page__promo">
            <span>Code promo</span>
            <input placeholder="ENTREZ LE CODE ICI..." disabled />
          </label>

          <div className="gift-summary-page__total">
            <p>
              <span>Sous-total</span>
              <strong>{selectedOffer?.price ?? "-"}</strong>
            </p>
            <p>
              <span>Frais de maintenance cloud</span>
              <strong>Inclus</strong>
            </p>
            <p>
              <span>Total à régler</span>
              <strong>{selectedOffer?.price ?? "-"}</strong>
            </p>
          </div>

          <Button
            type="primary"
            label={
              isGiftActive
                ? "Gift activé"
                : isPaymentLoading
                  ? "Paiement..."
                  : "Payer avec Stripe"
            }
            disabled={
              isLoading ||
              isPaymentLoading ||
              !gift ||
              !selectedOffer ||
              isGiftActive
            }
            fullWidth
            icon={<CreditCard size={17} />}
            iconPosition="left"
            onClick={handleStartPayment}
          />

          <p className="gift-summary-page__secure">
            <CreditCard size={16} />
            PAIEMENT 100% SÉCURISÉ
          </p>

          <section className="gift-summary-page__notice">
            <h2>
              <ShieldCheck size={18} />
              RAPPEL DE SÉCURITÉ
            </h2>
            <p>
              Votre création est actuellement un brouillon temporaire. Une fois
              le paiement validé, votre contenu est immédiatement crypté et mis
              à l'abri sur nos serveurs haute sécurité. Il restera modifiable à
              tout moment depuis votre espace personnel.
            </p>
          </section>

          <Button
            type="secondary"
            label="Retour aux informations légales"
            href={`/gifts/${numericGiftId}/confirmations`}
            fullWidth
          />
        </aside>
      </div>
    </section>
  );
}
