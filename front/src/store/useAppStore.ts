import { create } from "zustand";
import type { AuthUser } from "../api/auth";
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  clearStoredAuthData,
  isAuthTokenExpired,
} from "../helpers/authSession";

export type UserState = {
  token: string | null;
  user: AuthUser | null;
  setAuthData: (token: string, user: AuthUser) => void;
  clearAuthData: () => void;
};

function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch (error) {
    console.error("Failed to parse stored user data:", error);
    return null;
  }
}

function getStoredToken(): string | null {
  const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (!storedToken) {
    return null;
  }

  if (isAuthTokenExpired(storedToken)) {
    clearStoredAuthData();
    return null;
  }

  return storedToken;
}

const storedToken = getStoredToken();

export const useUserState = create<UserState>((set) => ({
  token: storedToken,
  user: storedToken ? getStoredUser() : null,
  setAuthData: (token, user) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    set({ token, user });
  },
  clearAuthData: () => {
    clearStoredAuthData();
    set({ token: null, user: null });
  },
}));
