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

async function parseApiError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || "Une erreur est survenue. Veuillez réessayer.";
  } catch {
    return "Une erreur est survenue. Veuillez réessayer.";
  }
}

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
    throw new Error(await parseApiError(response));
  }
  return response.json() as Promise<CreateGiftResponse>;
}
