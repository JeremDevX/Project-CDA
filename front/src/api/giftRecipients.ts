import { getApiErrorMessage } from "../helpers/helpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type GiftRecipient = {
  id: number;
  giftId: number;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateGiftRecipientPayload = {
  fullName: string;
  email: string;
  phone: string;
};

export async function getGiftRecipients(token: string, giftId: number) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/recipients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de recuperer les destinataires",
      ),
    );
  }

  return response.json() as Promise<{ recipients: GiftRecipient[] }>;
}

export async function createGiftRecipient(
  token: string,
  giftId: number,
  payload: CreateGiftRecipientPayload,
) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/recipients`, {
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
        "Impossible d'ajouter le destinataire",
      ),
    );
  }

  return response.json() as Promise<{ recipient: GiftRecipient }>;
}

export async function deleteGiftRecipient(
  token: string,
  giftId: number,
  recipientId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/gifts/${giftId}/recipients/${recipientId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Impossible de supprimer le destinataire",
      ),
    );
  }
}
