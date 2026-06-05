// @vitest-environment node

import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  expireAuthSession,
  isAuthTokenExpired,
} from "../../src/helpers/authSession";

const storage = new Map<string, string>();
const eventTarget = new EventTarget();

Object.defineProperty(globalThis, "localStorage", {
  value: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  },
});

Object.defineProperty(globalThis, "window", {
  value: eventTarget,
});

function encodeBase64Url(value: object) {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createToken(exp: number) {
  return [
    encodeBase64Url({ alg: "none" }),
    encodeBase64Url({ exp }),
    "signature",
  ].join(".");
}

describe("authSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("detecte un token expire", () => {
    const token = createToken(Math.floor(Date.now() / 1000) - 60);

    expect(isAuthTokenExpired(token)).toBe(true);
  });

  it("garde un token encore valide", () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 60);

    expect(isAuthTokenExpired(token)).toBe(false);
  });

  it("supprime session locale et notifie expiration", () => {
    const listener = vi.fn();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "token");
    localStorage.setItem(AUTH_USER_STORAGE_KEY, "{}");

    expireAuthSession();

    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_STORAGE_KEY)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
  });
});
