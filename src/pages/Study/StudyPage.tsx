import { useEffect, useState } from "react";
import { Page } from "../../components/shared/Page";
import { mindmaps as seedMindmaps, type Mindmap } from "../../data/mindmaps";

export function StudyPage() {
  const [activeMindmap, setActiveMindmap] = useState<Mindmap | null>(null);
  const [maps, setMaps] = useState<Mindmap[]>(seedMindmaps);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_STUDY_API_URL as string | undefined;
    if (!apiUrl) {
      return;
    }

    const controller = new AbortController();

    fetch(apiUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: Mindmap[]) => {
        if (Array.isArray(data) && data.length) {
          setMaps(data);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <Page
      title="Study Notes"
      subtitle="Technical notes & mindmaps"
      intro="Organized learning materials, references, and visual maps."
    >
      <section>
        <div className="card stack">
          <h2>Categories</h2>
          <div className="small">
            Java · JVM · Concurrency · Databases · Redis · MQ · Spring
          </div>
        </div>
      </section>

      <section>
        <div className="stack">
          <div className="stack">
            <h2>Mindmaps</h2>
            <p className="small">Browse, preview, and download study mindmaps.</p>
          </div>
          <div className="grid-3">
            {maps.map((map) => (
              <div key={map.id} className="card stack">
                <div className="stack">
                  <h3>{map.title}</h3>
                  {map.summary ? <p>{map.summary}</p> : null}
                  {map.tags && map.tags.length ? (
                    <div className="tags">
                      {map.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="small">Updated {map.updatedAt}</div>
                </div>
                <div className="card-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => setActiveMindmap(map)}
                  >
                    Preview
                  </button>
                  <a className="button ghost" href={map.file} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <a className="button ghost" href={map.file} download>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeMindmap ? (
        <dialog open className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div className="small">Preview</div>
                <h3>{activeMindmap.title}</h3>
              </div>
              <button
                className="button ghost"
                type="button"
                onClick={() => setActiveMindmap(null)}
              >
                Close
              </button>
            </div>
            <object
              data={activeMindmap.file}
              type="application/pdf"
              className="pdf-preview"
            >
              <p className="small">
                Your browser cannot preview PDFs. Use Open or Download instead.
              </p>
            </object>
          </div>
        </dialog>
      ) : null}
    </Page>
  );
}
