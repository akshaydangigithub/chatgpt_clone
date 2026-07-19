import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AUTH_COOKIE_KEY, AUTH_STORAGE_KEY } from "@/lib/constants";
import type { User } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  /** Becomes true once the persisted state has rehydrated on the client. */
  hydrated: boolean;

  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHydrated: () => void;
}

/**
 * A lightweight, non-httpOnly auth hint cookie. It carries no secret — it only
 * lets us know client-side whether a session likely exists so redirects don't
 * flash. The real credential is the bearer token in localStorage.
 */
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

/** Read the current bearer token outside of React (e.g. axios interceptors). */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

/** Clear the session outside of React (e.g. on a 401). */
export function clearAuth() {
  useAuthStore.getState().logout();
}
