import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import "./AuthForm.css";
import { useUserState, type UserState } from "../../store/useAppStore";
import { loginUser, registerUser } from "../../api/auth";
import { getErrorMessage } from "../../helpers/helpers";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useUserState((state: UserState) => state.setAuthData);

  const activeTab = location.pathname === "/register" ? "register" : "login";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegisterSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("Tous les champs sont obligatoires.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("L'adresse email n'est pas valide.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await registerUser({
        username,
        email,
        password,
        confirmPassword,
      });

      setAuth(response.token, response.user);

      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Une erreur est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLoginSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Tous les champs sont obligatoires.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("L'adresse email n'est pas valide.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await loginUser({ email, password });

      setAuth(response.token, response.user);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${activeTab === "login" ? "auth-tab-active" : ""}`}
          onClick={() => navigate("/login")}
        >
          Connexion
        </button>
        <button
          type="button"
          className={`auth-tab ${activeTab === "register" ? "auth-tab-active" : ""}`}
          onClick={() => navigate("/register")}
        >
          Inscription
        </button>
      </div>

      {activeTab === "register" ? (
        <>
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-subtitle">
            Créez votre espace personnel pour accéder à l'application.
          </p>

          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <label className="auth-field">
              <span>Nom d'utilisateur</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Confirmer le mot de passe</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>

            {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="auth-title">Se connecter</h1>
          <p className="auth-subtitle">
            Connectez-vous pour accéder à votre espace personnel.
          </p>

          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion en cours..." : "Me connecter"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
