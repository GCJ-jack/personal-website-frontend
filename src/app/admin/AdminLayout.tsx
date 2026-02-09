import { NavLink, Outlet } from "react-router-dom";
import { adminNavItems } from "../../data/adminNavigation";
import { useAdminAuth } from "./auth/useAdminAuth";

export function AdminLayout() {
  const { user, logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-title">Admin Console</div>
          <div className="admin-brand-subtitle">Personal Site</div>
        </div>
        <nav className="admin-nav">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/admin"}
              className={({ isActive }) =>
                ["admin-nav-link", isActive ? "is-active" : ""]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              <span>{item.label}</span>
              {item.description ? (
                <span className="admin-nav-desc">{item.description}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-topbar-title">Administration</div>
            <div className="admin-topbar-subtitle">
              Manage content, assets, and system settings.
            </div>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-user">
              <div className="admin-user-label">Signed in</div>
              <div className="admin-user-name">
                {user?.name ?? user?.email ?? "Admin"}
              </div>
            </div>
            <button className="button ghost" type="button" onClick={() => logout()}>
              Sign out
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
