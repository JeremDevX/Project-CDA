export function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Une erreur est survenue. Veuillez réessayer.";
  }
  return error.message;
}

export async function getApiErrorMessage(
  response: Response,
  fallbackMessage = "Une erreur est survenue. Veuillez réessayer.",
): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function getDraftExpirationMessage(
  draftExpiresAt: string | null,
): string {
  if (!draftExpiresAt) {
    return "";
  }

  const expirationDate = new Date(draftExpiresAt);

  if (Number.isNaN(expirationDate.getTime())) {
    return "";
  }

  const today = new Date();
  const diffInMs = expirationDate.getTime() - today.getTime();
  const remainingDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  const formattedDate = expirationDate.toLocaleDateString("fr-FR");

  if (remainingDays < 0) {
    return `Ce gift a expiré le ${formattedDate}.`;
  }

  if (remainingDays === 0) {
    return `Ce gift expire aujourd'hui (${formattedDate}).`;
  }

  return `Ce gift expirera dans ${remainingDays} jour${remainingDays > 1 ? "s" : ""}.`;
}
