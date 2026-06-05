export const AUTH_TOKEN_STORAGE_KEY = "auth_token";
export const AUTH_USER_STORAGE_KEY = "auth_user";
export const AUTH_SESSION_EXPIRED_EVENT = "auth-session-expired";

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  return atob(`${base64}${padding}`);
}

export function isAuthTokenExpired(token: string) {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1] ?? "")) as {
      exp?: unknown;
    };

    if (typeof payload.exp !== "number") {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function clearStoredAuthData() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function expireAuthSession() {
  clearStoredAuthData();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}
