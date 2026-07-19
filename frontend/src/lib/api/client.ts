import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { ROUTES } from "@/lib/constants";
import { clearAuth, getAuthToken } from "@/lib/store/auth-store";
import type { ApiErrorBody } from "@/types/api";

/** A normalised error surfaced to the UI layer. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

/** Attach the bearer token to every outgoing request. */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Normalise errors and transparently handle expired/invalid sessions. */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const message =
      body?.detail ||
      body?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    // A 401 means the session is gone: clear it and bounce to login, but never
    // redirect while the user is *already* on an auth page.
    if (status === 401 && typeof window !== "undefined") {
      clearAuth();
      const path = window.location.pathname;
      if (path !== ROUTES.login && path !== ROUTES.register) {
        window.location.href = ROUTES.login;
      }
    }

    return Promise.reject(new ApiError(message, status));
  },
);

/** Human-readable message extraction for any thrown error. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
