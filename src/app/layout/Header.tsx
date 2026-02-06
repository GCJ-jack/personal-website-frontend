import { NavLink } from "react-router-dom";
import { navItems } from "../../data/navigation";

type HeaderProps = {
  title: string;
  description?: string;
};

export function Header({ title, description = "" }: HeaderProps) {
  return (
    <header className="container" style={{ paddingTop: "var(--space-6)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>{title}</div>
          {description ? (
            <div className="small" style={{ marginTop: "var(--space-2)" }}>
              {description}
            </div>
          ) : null}
        </div>
        <nav className="small" style={{ display: "flex", gap: "var(--space-4)" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
