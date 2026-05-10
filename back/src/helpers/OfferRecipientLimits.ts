const offerRecipientLimits: Record<string, number | null> = {
  essentiel: 1,
  standard: 5,
  premium: null,
};

export function getRecipientLimit(offer: string | null | undefined) {
  return offer ? offerRecipientLimits[offer] : undefined;
}
