type MediaType = "image" | "video";

type MediaLimit = {
  image: number | null;
  video: number | null;
};

const offerMediaLimits: Record<string, MediaLimit> = {
  essentiel: { image: 0, video: 0 },
  standard: { image: 10, video: 0 },
  premium: { image: null, video: 1 },
};

export function getMediaLimit(
  offer: string | null | undefined,
  type: MediaType,
) {
  return offer ? offerMediaLimits[offer]?.[type] : undefined;
}

export function isMediaType(value: unknown): value is MediaType {
  return value === "image" || value === "video";
}
