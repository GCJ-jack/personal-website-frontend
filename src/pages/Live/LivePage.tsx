import { useMemo, useState } from "react";
import { Page } from "../../components/shared/Page";
import { liveVideos, type LiveVideo } from "../../data/liveVideos";

export function LivePage() {
  const [activeId, setActiveId] = useState(liveVideos[0]?.id ?? "");

  const activeVideo = useMemo<LiveVideo | undefined>(() => {
    return liveVideos.find((video) => video.id === activeId) ?? liveVideos[0];
  }, [activeId]);

  return (
    <Page
      title="Live"
      subtitle="Shows & concerts"
      intro="A collection of performances and live moments."
    >
      <section>
        <div className="live-grid">
          <div className="card stack">
            {activeVideo ? (
              <>
                <div className="video-frame">
                  <video
                    key={activeVideo.file}
                    src={activeVideo.file}
                    controls
                    muted
                    className="video-player"
                  />
                </div>
                <div className="stack">
                  <div className="small">{activeVideo.date}</div>
                  <h2>{activeVideo.title}</h2>
                  {activeVideo.description ? <p>{activeVideo.description}</p> : null}
                </div>
              </>
            ) : (
              <p className="small">Add live videos to begin.</p>
            )}
          </div>

          <div className="card stack">
            <h3>Playlist</h3>
            <div className="live-list">
              {liveVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className={`live-item ${video.id === activeId ? "is-active" : ""}`}
                  onClick={() => setActiveId(video.id)}
                >
                  <div className="live-item-title">{video.title}</div>
                  <div className="small">{video.date}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
