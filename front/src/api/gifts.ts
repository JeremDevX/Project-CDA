import { getApiErrorMessage } from "../helpers/helpers";
import type { OfferPlanId } from "../data/offerPlans";
import type { CreationModeId } from "../data/creationModes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type Gift = {
  id: number;
  title?: string;
  message?: string;
  status: string;
  offer?: OfferPlanId | null;
  creationMode?: CreationModeId | null;
  lastEditionStep?: GiftEditionStep | null;
  draftExpiresAt?: string | null;
  finalConfirmationsAt?: string | null;
  paidAt?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  recipientCount?: number;
  imageCount?: number;
  videoCount?: number;
};

type GiftResponse = {
  gift: Gift;
};

type StripeCheckoutResponse = {
  url: string;
};

export type GiftPaymentConfirmation = {
  id: number;
  reference: string;
  giftId: number;
  giftTitle: string;
  offer: string;
  amountCents: number;
  amountPaid: string;
  currency: string;
  status: string;
  paidAt: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  isSandbox: boolean;
  createdAt: string;
};

type UpdateGiftPayload = {
  offer?: OfferPlanId;
  creationMode?: CreationModeId;
  lastEditionStep?: GiftEditionStep;
  title?: string;
  message?: string;
};

export type GiftEditionStep =
  | "creation-mode"
  | "composition"
  | "images"
  | "preview"
  | "recipients"
  | "trusted-thirds"
  | "confirmations"
  | "summary";

type ConfirmGiftPayload = {
  finalConfirmationsAccepted: boolean;
};

export async function createGift(token: string, title?: string) {
  const response = await fetch(`${API_BASE_URL}/gifts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
  return response.json() as Promise<GiftResponse>;
}

export async function getGifts(token: string) {
  const response = await fetch(`${API_BASE_URL}/gifts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Impossible de récupérer les gifts"),
    );
  }
  return response.json() as Promise<{ gifts: Gift[] }>;
}

export async function updateGift(
  token: string,
  giftId: number,
  payload: UpdateGiftPayload,
) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Impossible d'enregistrer le gift"),
    );
  }

  return response.json() as Promise<GiftResponse>;
}

export async function getGiftById(token: string, giftId: number) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Impossible de récupérer le gift"),
    );
  }

  return response.json() as Promise<GiftResponse>;
}

export async function confirmGift(
  token: string,
  giftId: number,
  payload: ConfirmGiftPayload,
) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/confirmations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible d'enregistrer les confirmations",
      ),
    );
  }

  return response.json() as Promise<GiftResponse>;
}

export async function createGiftCheckoutSession(token: string, giftId: number) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/checkout-session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de lancer le paiement Stripe",
      ),
    );
  }

  return response.json() as Promise<StripeCheckoutResponse>;
}

export async function validateGiftPayment(
  token: string,
  giftId: number,
  sessionId: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/gifts/${giftId}/payment-confirmation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Impossible de valider le paiement"),
    );
  }

  return response.json() as Promise<GiftResponse>;
}

export async function getGiftPaymentConfirmations(token: string) {
  const response = await fetch(`${API_BASE_URL}/gifts/payment-confirmations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de récupérer les confirmations de paiement",
      ),
    );
  }

  return response.json() as Promise<{
    confirmations: GiftPaymentConfirmation[];
  }>;
}

export async function downloadGiftPaymentConfirmationPdf(
  token: string,
  giftId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/gifts/${giftId}/payment-confirmation/pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de télécharger la confirmation de paiement",
      ),
    );
  }

  return response.blob();
}
