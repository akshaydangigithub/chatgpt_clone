"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/auth-store";

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
