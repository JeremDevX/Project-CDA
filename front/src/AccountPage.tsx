import { CalendarDays, CreditCard, Download, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import "./AccountPage.css";
import {
  downloadGiftPaymentConfirmationPdf,
  getGiftPaymentConfirmations,
  type GiftPaymentConfirmation,
} from "./api/gifts";
import Button from "./components/Button/Button";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AccountPage() {
  const user = useUserState((state) => state.user);
  const token = useUserState((state) => state.token);
  const [confirmations, setConfirmations] = useState<
    GiftPaymentConfirmation[]
  >([]);
  const [isLoadingConfirmations, setIsLoadingConfirmations] = useState(true);
  const [downloadedConfirmationId, setDownloadedConfirmationId] = useState<
    number | null
  >(null);
  const [confirmationsError, setConfirmationsError] = useState("");

  useEffect(() => {
    async function loadConfirmations() {
      if (!token) {
        setIsLoadingConfirmations(false);
        return;
      }

      try {
        setIsLoadingConfirmations(true);
        setConfirmationsError("");
        const response = await getGiftPaymentConfirmations(token);

        setConfirmations(response.confirmations);
      } catch (error) {
        setConfirmationsError(getErrorMessage(error));
      } finally {
        setIsLoadingConfirmations(false);
      }
    }

    loadConfirmations();
  }, [token]);

  async function handleDownloadConfirmation(
    confirmation: GiftPaymentConfirmation,
  ) {
    if (!token) {
      return;
    }

    try {
      setDownloadedConfirmationId(confirmation.id);
      setConfirmationsError("");
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
      setConfirmationsError(getErrorMessage(error));
    } finally {
      setDownloadedConfirmationId(null);
    }
  }

  return (
    <section className="account" aria-labelledby="account_eyebrow">
      <article className="account__panel">
        <header className="account__header">
          <p className="account__eyebrow" id="account_eyebrow">
            Mon compte
          </p>
          <p className="account__subtitle">
            Consultez les informations associées a votre session.
          </p>
        </header>

        {!user ? (
          <p className="account__feedback">
            Aucune information de compte n'est disponible.
          </p>
        ) : null}

        {user ? (
          <dl className="account__details" aria-label="Details du compte">
            <div className="account__item">
              <dt className="account__term">Nom d'utilisateur</dt>
              <dd className="account__value">{user.username}</dd>
            </div>
            <div className="account__item">
              <dt className="account__term">Email</dt>
              <dd className="account__value">{user.email}</dd>
            </div>
            <div className="account__item">
              <dt className="account__term">Compte créé le</dt>
              <dd className="account__value">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        ) : null}

        <section className="account__payments">
          <header className="account__payments-header">
            <div>
              <h2>
                <ReceiptText size={18} />
                Confirmations de paiement
              </h2>
              <p>
                Merci de nous confier vos Gifts. Retrouvez ici vos preuves de
                transaction, liées à vos gifts activés.
              </p>
            </div>
          </header>

          {isLoadingConfirmations ? (
            <p className="account__feedback">Chargement des confirmations...</p>
          ) : null}

          {confirmationsError ? (
            <p className="account__feedback account__feedback--error">
              {confirmationsError}
            </p>
          ) : null}

          {!isLoadingConfirmations && confirmations.length === 0 ? (
            <p className="account__feedback">
              Aucune confirmation de paiement disponible.
            </p>
          ) : null}

          {confirmations.length > 0 ? (
            <div className="account__payment-list">
              {confirmations.map((confirmation) => (
                <article className="account__payment" key={confirmation.id}>
                  <header className="account__payment-top">
                    <span className="account__payment-icon" aria-hidden="true">
                      <ReceiptText size={20} />
                    </span>
                    <div className="account__payment-title">
                      <strong>{confirmation.giftTitle}</strong>
                      <span>{confirmation.reference}</span>
                    </div>
                    <p className="account__payment-amount">
                      {confirmation.amountPaid}
                    </p>
                  </header>

                  <dl className="account__payment-details">
                    <div>
                      <dt>
                        <ReceiptText size={14} />
                        Offre choisie
                      </dt>
                      <dd>{confirmation.offer}</dd>
                    </div>
                    <div>
                      <dt>
                        <CreditCard size={14} />
                        Devise
                      </dt>
                      <dd>{confirmation.currency}</dd>
                    </div>
                    <div>
                      <dt>Statut</dt>
                      <dd>{confirmation.status}</dd>
                    </div>
                    <div>
                      <dt>
                        <CalendarDays size={14} />
                        Date du paiement
                      </dt>
                      <dd>
                        {formatDate(confirmation.paidAt)}
                      </dd>
                    </div>
                    <div>
                      <dt>Stripe</dt>
                      <dd>
                        {confirmation.stripePaymentIntentId ??
                          confirmation.stripeSessionId ??
                          "Non disponible"}
                      </dd>
                    </div>
                  </dl>

                  <div className="account__payment-footer">
                    <p>
                      Confirmation interne de paiement. À conserver comme
                      preuve de transaction.
                    </p>
                    <Button
                      type="secondary"
                      label={
                        downloadedConfirmationId === confirmation.id
                          ? "Téléchargement..."
                          : "Télécharger PDF"
                      }
                      icon={<Download size={17} />}
                      iconPosition="left"
                      disabled={downloadedConfirmationId === confirmation.id}
                      onClick={() => handleDownloadConfirmation(confirmation)}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </article>
    </section>
  );
}
