import {
  CalendarDays,
  Check,
  Download,
  Hash,
  LayoutDashboard,
  Pencil,
  ReceiptText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import {
  downloadGiftPaymentConfirmationPdf,
  getGiftPaymentConfirmations,
  validateGiftPayment,
  type GiftPaymentConfirmation,
} from "./api/gifts";
import Button from "./components/Button/Button";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftActivatedPage.css";

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function GiftActivatedPage() {
  const { giftId } = useParams();
  const [searchParams] = useSearchParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);
  const paymentStatus = searchParams.get("payment");
  const checkoutSessionId = searchParams.get("session_id");

  const [confirmation, setConfirmation] =
    useState<GiftPaymentConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadActivatedGift() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        if (paymentStatus === "success" && checkoutSessionId) {
          await validateGiftPayment(token, numericGiftId, checkoutSessionId);
        }

        const response = await getGiftPaymentConfirmations(token);
        const currentConfirmation = response.confirmations.find(
          (item) => item.giftId === numericGiftId,
        );

        if (!currentConfirmation) {
          setErrorMessage("Confirmation de paiement introuvable");
          return;
        }

        setConfirmation(currentConfirmation);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadActivatedGift();
  }, [token, numericGiftId, paymentStatus, checkoutSessionId]);

  async function handleDownloadPdf() {
    if (!token || !confirmation) {
      return;
    }

    try {
      setIsPdfLoading(true);
      const pdf = await downloadGiftPaymentConfirmationPdf(
        token,
        confirmation.giftId,
      );
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");

      link.href = url;
      link.download = `confirmation-paiement-${confirmation.reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPdfLoading(false);
    }
  }

  return (
    <section className="gift-activated-page">
      <div className="gift-activated-page__content">
        <span className="gift-activated-page__icon" aria-hidden="true">
          <Check size={34} />
        </span>

        <header className="gift-activated-page__header">
          <h1>Félicitations, votre Gift est prêt pour le futur</h1>
          <p>
            Merci de nous confier ce témoignage précieux. Nous sommes honorés
            de garantir la protection et la transmission de vos mots à ceux qui
            comptent pour vous.
          </p>
        </header>

        {isLoading ? (
          <p className="gift-activated-page__status">Chargement...</p>
        ) : null}

        {errorMessage ? (
          <p className="gift-activated-page__error">{errorMessage}</p>
        ) : null}

        {confirmation ? (
          <>
            <dl className="gift-activated-page__summary">
              <div>
                <dt>
                  <CalendarDays size={16} />
                  Date d'activation
                </dt>
                <dd>{formatDate(confirmation.paidAt)}</dd>
              </div>
              <div>
                <dt>
                  <Hash size={16} />
                  Référence
                </dt>
                <dd>{confirmation.reference}</dd>
              </div>
              <div>
                <dt>
                  <ReceiptText size={16} />
                  Montant réglé
                </dt>
                <dd>{confirmation.amountPaid}</dd>
              </div>
            </dl>

            <div className="gift-activated-page__actions">
              <Button
                type="primary"
                label="Modifier mon gift"
                href={`/gifts/${numericGiftId}/composition`}
                fullWidth
                icon={<Pencil size={17} />}
                iconPosition="left"
              />
              <div className="gift-activated-page__secondary-actions">
                <Button
                  type="secondary"
                  label={isPdfLoading ? "Téléchargement..." : "Confirmation PDF"}
                  disabled={isPdfLoading}
                  fullWidth
                  icon={<Download size={17} />}
                  iconPosition="left"
                  onClick={handleDownloadPdf}
                />
                <Button
                  type="secondary"
                  label="Tableau de bord"
                  href="/dashboard"
                  fullWidth
                  icon={<LayoutDashboard size={17} />}
                  iconPosition="left"
                />
              </div>
            </div>

            <aside className="gift-activated-page__notice">
              <strong>Un doute sur la suite ?</strong>
              <span>
                Redécouvrez à tout moment le fonctionnement détaillé de votre
                transmission sécurisée sur la page "Comprendre le
                fonctionnement".
              </span>
            </aside>
          </>
        ) : null}
      </div>
    </section>
  );
}
