import { getApiErrorMessage } from "../helpers/helpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type GiftMediaType = "image" | "video";

export type GiftMedia = {
  id: number;
  type: GiftMediaType;
  url: string | null;
  originalName?: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type GiftMediaLibraryImage = GiftMedia & {
  isAlreadyLinked: boolean;
};

export async function getGiftMedias(token: string, giftId: number) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return response.json() as Promise<{ medias: GiftMedia[] }>;
}

export async function getGiftMediaLibrary(token: string, giftId: number) {
  const response = await fetch(
    `${API_BASE_URL}/gifts/${giftId}/media/library`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return response.json() as Promise<{ images: GiftMediaLibraryImage[] }>;
}

export async function uploadGiftMedia(
  token: string,
  giftId: number,
  type: GiftMediaType,
  file: File,
) {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return response.json() as Promise<{ media: GiftMedia }>;
}

export async function reuseGiftMedia(
  token: string,
  giftId: number,
  sourceMediaId: number,
) {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/media/reuse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourceMediaId }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return response.json() as Promise<{ media: GiftMedia }>;
}

export async function deleteGiftMedia(
  token: string,
  giftId: number,
  mediaId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/gifts/${giftId}/media/${mediaId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
}

export async function deleteGiftMediaAsset(
  token: string,
  giftId: number,
  mediaAssetId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/gifts/${giftId}/media/library/${mediaAssetId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
}
