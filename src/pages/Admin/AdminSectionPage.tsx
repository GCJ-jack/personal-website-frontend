type AdminSectionPageProps = {
  title: string;
  summary: string;
  bullets: string[];
};

export function AdminSectionPage({ title, summary, bullets }: AdminSectionPageProps) {
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">{title}</div>
          <div className="admin-section-summary">{summary}</div>
        </div>
        <button className="button" type="button">
          New {title}
        </button>
      </div>
      <div className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Focus</div>
        <ul className="admin-section-list">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
