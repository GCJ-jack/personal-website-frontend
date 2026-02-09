import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createAdminAuthApi, type AdminAuthSession, type AdminUser } from "./adminAuthApi";
import { clearStoredToken, getStoredToken, setStoredToken } from "./adminAuthStorage";

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
      setUser(null);
      setToken(null);
      setStoredToken(null);
      setStatus(err ? "error" : "unauthenticated");
      setError(err ?? null);
      return;
    }

    const normalized = normalizeSession(session, token);
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
    try {
      const session = await api.session(token);
      setSessionState(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load session.";
      setSessionState(null, message);
    }
  }, [api, isConfigured, setSessionState, token]);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    if (!api || !isConfigured) {
      setSessionState(null, "Admin auth API not configured.");
      return false;
    }

    setStatus("loading");
    try {
      const session = await api.login(payload, token);
      setSessionState(session);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setSessionState(null, message);
      return false;
    }
  }, [api, isConfigured, setSessionState, token]);

  const logout = useCallback(async () => {
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
  }, [api, isConfigured, token]);

  useEffect(() => {
    if (!isConfigured) {
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
