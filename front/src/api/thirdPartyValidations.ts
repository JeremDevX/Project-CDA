import { getApiErrorMessage } from "../helpers/helpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ThirdPartyValidationAnswer = "confirm-death" | "confirm-alive";

export async function answerThirdPartyValidation(
  token: string,
  answer: ThirdPartyValidationAnswer,
) {
  const response = await fetch(
    `${API_BASE_URL}/third-party-validations/${token}/${answer}`,
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Impossible d'enregistrer la réponse"),
    );
  }

  return response.json() as Promise<{ message: string }>;
}
