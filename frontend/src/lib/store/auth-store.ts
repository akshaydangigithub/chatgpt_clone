import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AUTH_COOKIE_KEY, AUTH_STORAGE_KEY } from "@/lib/constants";
import type { User } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;

  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHydrated: () => void;
}

function writeAuthCookie(authed: boolean) {
  if (typeof document === "undefined") return;
  if (authed) {
    document.cookie = `${AUTH_COOKIE_KEY}=1; path=/; max-age=2592000; samesite=lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,

      setToken: (token) => {
        writeAuthCookie(true);
        set({ token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        writeAuthCookie(false);
        set({ token: null, user: null });
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        if (state?.token) writeAuthCookie(true);
      },
    },
  ),
);

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export function clearAuth() {
  useAuthStore.getState().logout();
}
