import { apiClient } from "./client";
import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
} from "@/types/api";

export const authApi = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/register", payload);
    return data;
  },

  /**
   * The backend login route expects OAuth2 form-encoded credentials
   * (`application/x-www-form-urlencoded`), not JSON.
   */
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const form = new URLSearchParams();
    form.append("username", payload.username);
    form.append("password", payload.password);

    const { data } = await apiClient.post<TokenResponse>("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
