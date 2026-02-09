import { createAdminHttpClient } from "../http/adminHttp";

export type AdminUser = {
  id: string;
  name: string;
  email?: string;
  roles?: string[];
};

export type AdminAuthSession = {
  user: AdminUser;
  token?: string;
  expiresAt?: string;
};

export type AdminAuthResponse = AdminAuthSession & { ok: true };

type AdminAuthPayload = {
  email: string;
  password: string;
};

export function createAdminAuthApi(baseUrl: string) {
  const http = createAdminHttpClient(baseUrl);

  return {
    async login(payload: AdminAuthPayload, token?: string | null) {
      return http.request<AdminAuthResponse>("/auth/login", {
        method: "POST",
        body: payload,
        token,
      });
    },
    async session(token?: string | null) {
      return http.request<AdminAuthResponse>("/auth/session", {
        method: "GET",
        token,
      });
    },
    async logout(token?: string | null) {
      return http.request<{ ok: true }>("/auth/logout", {
        method: "POST",
        token,
      });
    },
  };
}
