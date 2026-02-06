import { useEffect, useMemo, useRef, useState } from "react";
import { Page } from "../../components/shared/Page";
import { liveVideos, topRecords, type LiveVideo } from "../../data/liveVideos";

export function LivePage() {
  const [videos, setVideos] = useState<LiveVideo[]>(liveVideos);
  const [activeId, setActiveId] = useState(liveVideos[0]?.id ?? "");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_LIVE_API_URL as string | undefined;
    if (!apiUrl) {
      return;
    }

    const controller = new AbortController();

    fetch(apiUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: LiveVideo[]) => {
        if (Array.isArray(data) && data.length) {
          setVideos(data);
          setActiveId(data[0].id);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const activeVideo = useMemo<LiveVideo | undefined>(() => {
    return videos.find((video) => video.id === activeId) ?? videos[0];
  }, [activeId, videos]);

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
                    poster={activeVideo.cover}
                    ref={videoRef}
                  />
                </div>
                <div className="stack">
                  <div className="small">{activeVideo.date}</div>
                  <h2>{activeVideo.title}</h2>
                  {activeVideo.description ? <p>{activeVideo.description}</p> : null}
                  <div className="card-actions">
                    <button
                      className="button"
                      type="button"
                      onClick={() => {
                        const target = videoRef.current;
                        if (!target) {
                          return;
                        }
                        if (document.fullscreenElement) {
                          document.exitFullscreen?.();
                          return;
                        }
                        target.requestFullscreen?.();
                      }}
                    >
                      Fullscreen
                    </button>
                    <a className="button ghost" href={activeVideo.file} download>
                      Download
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <p className="small">Add live videos to begin.</p>
            )}
          </div>

          <div className="card stack">
            <h3>Playlist</h3>
            <div className="live-list">
              {videos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className={`live-item ${video.id === activeId ? "is-active" : ""}`}
                  onClick={() => setActiveId(video.id)}
                >
                  {video.cover ? (
                    <img
                      src={video.cover}
                      alt={`${video.title} cover`}
                      className="live-item-cover"
                    />
                  ) : null}
                  <div className="live-item-content">
                    <div className="live-item-title">{video.title}</div>
                    <div className="small">{video.date}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="stack">
          <h2>Top 10 Records</h2>
          <div className="grid-5">
            {topRecords.map((record) => (
              <div key={record.id} className="card stack record-card">
                {record.cover ? (
                  <img src={record.cover} alt={`${record.title} cover`} />
                ) : null}
                <div className="stack">
                  <div className="record-title">{record.title}</div>
                  <div className="small">{record.artist}</div>
                  {record.year ? <div className="small">{record.year}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Page>
  );
}
