import { CalendarClock, CircleCheckBig } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { confirmCheckIn } from "./api/checkIns";
import PublicActionConfirmation from "./components/PublicActionConfirmation/PublicActionConfirmation";
import { getErrorMessage } from "./helpers/helpers";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function CheckInConfirmationPage() {
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [nextCheckInDue, setNextCheckInDue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function submitCheckIn() {
      if (!token) {
        setErrorMessage("Lien de check-in invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await confirmCheckIn(token);
        setNextCheckInDue(response.nextCheckInDue);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    submitCheckIn();
  }, [token]);

  const formattedDate = formatDate(nextCheckInDue);
  const isConfirmed = Boolean(nextCheckInDue) && !errorMessage;

  return (
    <PublicActionConfirmation
      icon={
        isConfirmed ? <CircleCheckBig size={34} /> : <CalendarClock size={34} />
      }
      title={
        isConfirmed
          ? "Check-in validé"
          : "Validation de votre check-in"
      }
      message={
        isConfirmed
          ? "Votre réponse a bien été prise en compte."
          : "Nous vérifions votre lien de check-in."
      }
      statusMessage={isLoading ? "Validation du check-in..." : undefined}
      errorMessage={errorMessage}
      notice={
        formattedDate
          ? `La prochaine échéance de check-in est repoussée au ${formattedDate}.`
          : "La prochaine échéance de check-in est repoussée."
      }
    />
  );
}
