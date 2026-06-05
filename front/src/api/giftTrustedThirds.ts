import { getApiErrorMessage } from "../helpers/helpers";
import { authFetch } from "./client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type GiftTrustedThird = {
  id: number;
  giftId: number;
  fullName: string;
  email: string;
  phone: string;
  relation: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateGiftTrustedThirdPayload = {
  fullName: string;
  email: string;
  phone: string;
  relation: string;
};

export async function getGiftTrustedThirds(token: string, giftId: number) {
  const response = await authFetch(
    `${API_BASE_URL}/gifts/${giftId}/trusted-thirds`,
    token,
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de recuperer les tiers de confiance",
      ),
    );
  }

  return response.json() as Promise<{ trustedThirds: GiftTrustedThird[] }>;
}

export async function createGiftTrustedThird(
  token: string,
  giftId: number,
  payload: CreateGiftTrustedThirdPayload,
) {
  const response = await authFetch(
    `${API_BASE_URL}/gifts/${giftId}/trusted-thirds`,
    token,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible d'ajouter le tiers de confiance",
      ),
    );
  }

  return response.json() as Promise<{ trustedThird: GiftTrustedThird }>;
}

export async function deleteGiftTrustedThird(
  token: string,
  giftId: number,
  trustedThirdId: number,
) {
  const response = await authFetch(
    `${API_BASE_URL}/gifts/${giftId}/trusted-thirds/${trustedThirdId}`,
    token,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de supprimer le tiers de confiance",
      ),
    );
  }
}

export async function validateGiftTrustedThirds(token: string, giftId: number) {
  const response = await authFetch(
    `${API_BASE_URL}/gifts/${giftId}/trusted-thirds/validate`,
    token,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de valider les tiers de confiance",
      ),
    );
  }

  return response.json() as Promise<{ canContinue: boolean }>;
}
