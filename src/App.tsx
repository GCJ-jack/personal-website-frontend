import { RootLayout } from "./app/layout/RootLayout";
import { Page } from "./components/shared/Page";

function App() {
  return (
    <RootLayout
      title="Guochao Jun"
      description="Frontend Engineer · Minimal interfaces"
    >
      <Page
        title="Hello"
        subtitle="Minimal, professional, and calm."
        intro="I design and build clean interfaces for thoughtful products."
      >
        <section>
          <div className="card">
            <h2>Focus</h2>
            <p>
              I specialize in modern web UI, design systems, and performance
              tuning. I value clarity, constraint, and quiet confidence in
              product experiences.
            </p>
          </div>
        </section>
        <section>
          <div className="card">
            <h2>Now</h2>
            <p>
              Currently building a personal site that highlights projects, live
              shows, and technical writing.
            </p>
          </div>
        </section>
      </Page>
    </RootLayout>
  );
}

export default App;
