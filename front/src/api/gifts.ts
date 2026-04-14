import { getApiErrorMessage } from "../helpers/helpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type Gift = {
  id: number;
  title: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type CreateGiftResponse = {
  gift: Gift;
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
  return response.json() as Promise<CreateGiftResponse>;
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
