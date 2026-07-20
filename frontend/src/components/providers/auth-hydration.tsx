"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/lib/store/auth-store";

export function AuthHydration() {
  useEffect(() => {
    if (!useAuthStore.getState().hydrated) {
      useAuthStore.getState().setHydrated();
    }
  }, []);
  return null;
}
