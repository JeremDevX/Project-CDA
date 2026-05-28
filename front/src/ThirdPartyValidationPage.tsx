import { HeartHandshake, Info, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { answerThirdPartyValidation } from "./api/thirdPartyValidations";
import { getErrorMessage } from "./helpers/helpers";
import "./ThirdPartyValidationPage.css";

type ValidationKind = "confirm-death" | "confirm-alive";

function getValidationContent(kind: ValidationKind) {
  if (kind === "confirm-death") {
    return {
      icon: <HeartHandshake size={34} />,
      title: "Merci, votre réponse a bien été prise en compte",
      message:
        "Nous vous adressons nos sincères condoléances. Cette confirmation va nous aider à traiter la suite du présent laissé.",
      notice:
        "Nous espérons que les derniers mots confiés à LegacyGift pourront, le moment venu, apporter un peu de présence aux personnes concernées.",
    };
  }

  return {
    icon: <ShieldCheck size={34} />,
    title: "Merci, votre information a bien été prise en compte",
    message:
      "Votre réponse indique que la personne concernée est vivante. Le déclenchement du gift ne sera pas validé sur cette base.",
    notice:
      "Il est possible qu'elle n'ait plus accès à ses emails ou qu'elle ne reçoive plus nos messages. Ce n'est pas obligatoire, mais vous pouvez lui faire remonter l'information si cela vous semble utile.",
  };
}

export default function ThirdPartyValidationPage() {
  const { token, answer } = useParams();
  const validationKind = answer as ValidationKind | undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const content = useMemo(() => {
    if (
      validationKind === "confirm-death" ||
      validationKind === "confirm-alive"
    ) {
      return getValidationContent(validationKind);
    }

    return null;
  }, [validationKind]);

  useEffect(() => {
    async function submitAnswer() {
      if (!token || !content || !validationKind) {
        setErrorMessage("Lien de validation invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsSubmitted(false);
        setErrorMessage("");
        await answerThirdPartyValidation(token, validationKind);
        setIsSubmitted(true);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    submitAnswer();
  }, [token, content, validationKind]);

  return (
    <section className="third-party-validation-page">
      <div className="third-party-validation-page__content">
        <span className="third-party-validation-page__icon" aria-hidden="true">
          {isSubmitted && content ? content.icon : <Info size={34} />}
        </span>

        <header className="third-party-validation-page__header">
          <h1>
            {isSubmitted && content
              ? content.title
              : "Validation de votre réponse"}
          </h1>
          <p>
            {isSubmitted && content
              ? content.message
              : "Nous avons enregistré votre réponse et nous vous en remercions."}
          </p>
        </header>

        {isLoading ? (
          <p className="third-party-validation-page__status">
            Enregistrement de votre réponse...
          </p>
        ) : null}

        {errorMessage ? (
          <p className="third-party-validation-page__error">{errorMessage}</p>
        ) : null}

        {isSubmitted && content && !errorMessage && !isLoading ? (
          <aside className="third-party-validation-page__notice">
            {content.notice}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
