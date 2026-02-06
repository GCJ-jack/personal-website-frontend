import { site } from "../../data/site";

type FooterProps = {
  title?: string;
};

export function Footer({ title }: FooterProps) {
  const siteTitle = title ?? site.title;

  return (
    <footer className="container" style={{ padding: "var(--space-6) var(--space-5)" }}>
      <div
        className="small"
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "var(--space-4)",
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <span>© {new Date().getFullYear()} {siteTitle}</span>
        <span>{site.footer}</span>
      </div>
    </footer>
  );
}
