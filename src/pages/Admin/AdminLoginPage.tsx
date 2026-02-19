import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../app/admin/auth/useAdminAuth";

type LocationState = {
  from?: string;
};

export function AdminLoginPage() {
  const { login, status, error, isConfigured } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = useMemo(() => state?.from ?? "/admin", [state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const ok = await login({ email, password });
    if (ok) {
      navigate(redirectTo, { replace: true });
    } else {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const statusMessage = error || message;

  return (
    <div className="admin-auth">
      <div className="admin-auth-card">
        <div className="admin-auth-title">Admin Login</div>
        <div className="admin-auth-subtitle">
          Sign in to manage content and settings.
        </div>

        {!isConfigured ? (
          <div className="admin-auth-note">
            Admin auth API is not configured. Set
            <span className="admin-auth-env"> VITE_ADMIN_API_URL </span>
            in your <code>.env</code>.
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={!isConfigured || status === "loading"}
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={!isConfigured || status === "loading"}
            />
          </label>
          {statusMessage ? (
            <div className="form-status error">{statusMessage}</div>
          ) : null}
          <div className="admin-auth-actions">
            <button
              className="button"
              type="submit"
              disabled={!isConfigured || status === "loading"}
            >
              {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="admin-auth-footer">
          Need access? Contact the site owner to enable your account.
        </div>
      </div>
    </div>
  );
}
