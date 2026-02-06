import type { PropsWithChildren } from "react";

type RootLayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

export function RootLayout({
  title = "Personal Site",
  description = "",
  children,
}: RootLayoutProps) {
  return (
    <div>
      <header className="container" style={{ paddingTop: "var(--space-6)" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>{title}</div>
            {description ? (
              <div className="small" style={{ marginTop: "var(--space-2)" }}>
                {description}
              </div>
            ) : null}
          </div>
          <nav className="small" style={{ display: "flex", gap: "var(--space-4)" }}>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/live">Live</a>
            <a href="/projects">Projects</a>
            <a href="/blog">Blog</a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="container" style={{ padding: "var(--space-6) var(--space-5)" }}>
        <div className="small" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
          © {new Date().getFullYear()} {title}
        </div>
      </footer>
    </div>
  );
}
