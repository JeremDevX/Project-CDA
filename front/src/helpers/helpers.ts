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
