"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/store/auth-store";
import type { LoginPayload, RegisterPayload } from "@/types/api";

/** The authenticated user, fetched lazily once a token exists. */
export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const user = await authApi.me();
      setUser(user);
      return user;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data) => {
      setToken(data.access_token);
      // Prime the current user before navigating so the UI has it immediately.
      try {
        const user = await authApi.me();
        useAuthStore.getState().setUser(user);
        queryClient.setQueryData(queryKeys.auth.me, user);
      } catch {
        /* non-fatal — useMe will retry */
      }
      toast.success("Welcome back!");
      router.replace(ROUTES.home);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRegister() {
  const login = useLogin();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await authApi.register(payload);
      return payload;
    },
    onSuccess: (payload) => {
      // Auto sign-in right after a successful registration.
      login.mutate({ username: payload.username, password: payload.password });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    toast.success("Signed out");
    router.replace(ROUTES.login);
  };
}
