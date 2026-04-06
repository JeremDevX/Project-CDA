import { create } from "zustand";
import type { AuthUser } from "../api/auth";

export type UserState = {
  token: string | null;
  user: AuthUser | null;
  setAuthData: (token: string, user: AuthUser) => void;
  clearAuthData: () => void;
};

export const useUserState = create<UserState>((set) => ({
  token: null,
  user: null,
  setAuthData: (token, user) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },
  clearAuthData: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    set({ token: null, user: null });
  },
}));
