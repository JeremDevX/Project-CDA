import { expireAuthSession, isAuthTokenExpired } from "../helpers/authSession";

export async function authFetch(
  url: string,
  token: string,
  init: RequestInit = {},
) {
  if (isAuthTokenExpired(token)) {
    expireAuthSession();
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    expireAuthSession();
  }

  return response;
}
