"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Ensures the persisted auth store is flagged as hydrated even in the edge
 * case where zustand's `onRehydrateStorage` doesn't fire (e.g. no stored
 * state). Renders nothing.
 */
export function AuthHydration() {
  useEffect(() => {
    if (!useAuthStore.getState().hydrated) {
      useAuthStore.getState().setHydrated();
    }
  }, []);
  return null;
}
