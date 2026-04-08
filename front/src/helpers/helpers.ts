export function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Une erreur est survenue. Veuillez réessayer.";
  }
  return error.message;
}
