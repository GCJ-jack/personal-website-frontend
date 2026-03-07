import { createContext } from "react";
import type { AdminUser } from "./adminAuthApi";

export type AdminAuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error";

export type AdminAuthContextValue = {
  status: AdminAuthStatus;
  user: AdminUser | null;
  token: string | null;
  error: string | null;
  isConfigured: boolean;
  login: (payload: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
