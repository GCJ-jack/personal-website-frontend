import { NavLink } from "react-router-dom";
import { adminNavItems } from "../../data/adminNavigation";

export function AdminHomePage() {
  return (
    <div className="admin-grid">
      <section className="admin-panel">
        <div className="admin-panel-title">Today</div>
        <div className="admin-panel-body">
          <div className="admin-metric">
            <div className="admin-metric-label">Queued drafts</div>
            <div className="admin-metric-value">3</div>
          </div>
          <div className="admin-metric">
            <div className="admin-metric-label">Pending reviews</div>
            <div className="admin-metric-value">2</div>
          </div>
          <div className="admin-metric">
            <div className="admin-metric-label">New uploads</div>
            <div className="admin-metric-value">5</div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-title">Quick Links</div>
        <div className="admin-panel-body admin-quick-links">
          {adminNavItems.map((item) => (
            <NavLink key={item.href} to={item.href} className="admin-quick-card">
              <div className="admin-quick-title">{item.label}</div>
              <div className="admin-quick-desc">{item.description}</div>
            </NavLink>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-title">Activity</div>
        <div className="admin-panel-body admin-activity">
          <div className="admin-activity-item">
            <div className="admin-activity-title">Blog post scheduled</div>
            <div className="admin-activity-meta">Draft "Spring Sprint" ready</div>
          </div>
          <div className="admin-activity-item">
            <div className="admin-activity-title">Live video updated</div>
            <div className="admin-activity-meta">"Studio Session 12" replaced cover</div>
          </div>
          <div className="admin-activity-item">
            <div className="admin-activity-title">Study map approved</div>
            <div className="admin-activity-meta">"Frontend Architecture" published</div>
          </div>
        </div>
      </section>
    </div>
  );
}
