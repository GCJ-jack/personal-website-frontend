import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "./useAdminAuth";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === "idle" || status === "loading") {
    return (
      <div className="admin-auth">
        <div className="admin-auth-card">
          <div className="admin-auth-title">Checking session</div>
          <div className="admin-auth-subtitle">Verifying admin access…</div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
