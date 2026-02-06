import { Page } from "../../components/shared/Page";

export function StudyPage() {
  return (
    <Page
      title="Study Notes"
      subtitle="Learning Resources"
      intro="A curated place to organize notes, references, and useful materials."
    >
      <section>
        <div className="card stack">
          <h2>Categories</h2>
          <div className="small">Java · JVM · Concurrency · Databases · Redis · MQ · Spring</div>
        </div>
      </section>
      <section>
        <div className="card stack">
          <h2>Latest Additions</h2>
          <p className="small">Add your latest notes and links here.</p>
        </div>
      </section>
    </Page>
  );
}
