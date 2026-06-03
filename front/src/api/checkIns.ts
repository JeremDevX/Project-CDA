import { getApiErrorMessage } from "../helpers/helpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function confirmCheckIn(token: string) {
  const response = await fetch(`${API_BASE_URL}/check-ins/${token}/confirm`);

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible d'enregistrer le check-in",
      ),
    );
  }

  return response.json() as Promise<{
    message: string;
    nextCheckInDue: string;
  }>;
}
