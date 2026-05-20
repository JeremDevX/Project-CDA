export function normalizeTextInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmail(value: unknown) {
  return normalizeTextInput(value).toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
