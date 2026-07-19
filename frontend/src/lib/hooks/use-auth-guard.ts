"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Client-side route protection. Because the bearer token lives in
 * localStorage (not an httpOnly cookie), gating happens on the client once the
 * persisted store has rehydrated.
 *
 * @param mode "protected" redirects unauthenticated users to /login;
 *             "guest" redirects authenticated users away from auth pages.
 */
export function useAuthGuard(mode: "protected" | "guest") {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (mode === "protected" && !token) {
      router.replace(ROUTES.login);
    } else if (mode === "guest" && token) {
      router.replace(ROUTES.home);
    }
  }, [hydrated, token, mode, router]);

  const authorized =
    hydrated && (mode === "protected" ? Boolean(token) : !token);

  return { authorized, hydrated };
}
