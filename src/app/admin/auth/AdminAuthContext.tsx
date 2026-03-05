import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createAdminAuthApi, type AdminAuthSession, type AdminUser } from "./adminAuthApi";
import { clearStoredToken, getStoredToken, setStoredToken } from "./adminAuthStorage";
import { createLogger } from "../../../lib/logger";

type AdminAuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error";

type AdminAuthContextValue = {
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
const logger = createLogger("AdminAuth");

type AdminAuthProviderProps = {
  children: ReactNode;
};

function normalizeSession(session: AdminAuthSession, fallbackToken: string | null) {
  const token = session.token ?? fallbackToken ?? null;
  return {
    user: session.user,
    token,
    expiresAt: session.expiresAt ?? null,
  };
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  const isConfigured = Boolean(apiUrl);
  const api = useMemo(() => (apiUrl ? createAdminAuthApi(apiUrl) : null), [apiUrl]);

  const [status, setStatus] = useState<AdminAuthStatus>("idle");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [error, setError] = useState<string | null>(null);

  const setSessionState = useCallback((session: AdminAuthSession | null, err?: string) => {
    if (!session) {
      logger.warn("Session unauthenticated", { error: err });
      setUser(null);
      setToken(null);
      setStoredToken(null);
      setStatus(err ? "error" : "unauthenticated");
      setError(err ?? null);
      return;
    }

    const normalized = normalizeSession(session, token);
    logger.info("Session authenticated", { userId: normalized.user.id, email: normalized.user.email });
    setUser(normalized.user);
    setToken(normalized.token);
    setStoredToken(normalized.token);
    setStatus("authenticated");
    setError(null);
  }, [token]);

  const refresh = useCallback(async () => {
    if (!api || !isConfigured) {
      setSessionState(null);
      return;
    }

    setStatus("loading");
    logger.debug("Refreshing admin session");
    try {
      const session = await api.session(token);
      setSessionState(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load session.";
      logger.error("Refresh session failed", { message });
      setSessionState(null, message);
    }
  }, [api, isConfigured, setSessionState, token]);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    if (!api || !isConfigured) {
      setSessionState(null, "Admin auth API not configured.");
      return false;
    }

    setStatus("loading");
    logger.info("Login requested", { email: payload.email });
    try {
      const session = await api.login(payload, token);
      setSessionState(session);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      logger.warn("Login failed", { email: payload.email, message });
      setSessionState(null, message);
      return false;
    }
  }, [api, isConfigured, setSessionState, token]);

  const logout = useCallback(async () => {
    logger.info("Logout requested");
    if (api && isConfigured) {
      try {
        await api.logout(token);
      } catch {
        // ignore server logout failures
      }
    }
    clearStoredToken();
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
    setError(null);
    logger.info("Logout finished");
  }, [api, isConfigured, token]);

  useEffect(() => {
    if (!isConfigured) {
      logger.warn("Admin auth API not configured");
      setStatus("unauthenticated");
      return;
    }
    void refresh();
  }, [isConfigured, refresh]);

  const value = useMemo<AdminAuthContextValue>(() => ({
    status,
    user,
    token,
    error,
    isConfigured,
    login,
    logout,
    refresh,
  }), [status, user, token, error, isConfigured, login, logout, refresh]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
