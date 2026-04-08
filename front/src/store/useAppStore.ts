import { create } from "zustand";
import type { AuthUser } from "../api/auth";

export type UserState = {
  token: string | null;
  user: AuthUser | null;
  setAuthData: (token: string, user: AuthUser) => void;
  clearAuthData: () => void;
};

function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem("auth_user");

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

export const useUserState = create<UserState>((set) => ({
  token: localStorage.getItem("auth_token"),
  user: getStoredUser(),
  setAuthData: (token, user) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    set({ token, user });
  },
  clearAuthData: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    set({ token: null, user: null });
  },
}));
