const STORAGE_KEY = "admin_auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (!token) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function clearStoredToken() {
  setStoredToken(null);
}

