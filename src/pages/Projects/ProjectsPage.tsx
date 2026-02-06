import { Page } from "../../components/shared/Page";

export function ProjectsPage() {
  return (
    <Page
      title="Projects"
      subtitle="Selected work"
      intro="A curated list of technical projects and experiments."
    >
      <section>
        <div className="card stack">
          <p className="small">Add your projects here.</p>
        </div>
      </section>
    </Page>
  );
}
