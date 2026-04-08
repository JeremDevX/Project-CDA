import "./AccountPage.css";
import { useUserState } from "./store/useAppStore";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AccountPage() {
  const user = useUserState((state) => state.user);

  return (
    <section className="account" aria-labelledby="account_eyebrow">
      <article className="account__panel">
        <header className="account__header">
          <p className="account__eyebrow">Mon compte</p>
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
      </article>
    </section>
  );
}
