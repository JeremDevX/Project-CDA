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
  draftExpiresAt?: string | null;
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

type UpdateGiftPayload = {
  offer?: OfferPlanId;
  creationMode?: CreationModeId;
  title?: string;
  message?: string;
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
