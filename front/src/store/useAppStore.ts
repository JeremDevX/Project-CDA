import { create } from "zustand";

export type AppStoreState = Record<string, never>;

export const useAppStore = create<AppStoreState>(() => ({}));
