import { useEffect, useMemo, useRef, useState } from "react";
import { Page } from "../../components/shared/Page";
import { liveVideos, topRecords, type LiveVideo } from "../../data/liveVideos";
import { createLogger } from "../../lib/logger";

const logger = createLogger("LivePage");

function getApiOrigin(apiUrl?: string) {
  if (!apiUrl) {
    return null;
  }
  try {
    return new URL(apiUrl).origin;
  } catch {
    return null;
  }
}

function resolveStreamApiBase(
  apiBaseEnv: string | undefined,
  apiOrigin: string | null,
  fallbackPath: string,
) {
  const value = apiBaseEnv?.trim();
  if (!value) {
    return apiOrigin ? `${apiOrigin}${fallbackPath}` : fallbackPath;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return apiOrigin ? `${apiOrigin}${value}` : value;
  }
  return value;
}

function buildStreamUrl(source: string | undefined, streamApiBase: string) {
  if (!source) {
    return null;
  }
  const trimmed = source.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const resolvedSource = new URL(trimmed, window.location.href).toString();
    const endpoint = new URL(streamApiBase, window.location.origin);
    endpoint.searchParams.set("key", resolvedSource);
    return endpoint.toString();
  } catch {
    const joiner = streamApiBase.includes("?") ? "&" : "?";
    return `${streamApiBase}${joiner}key=${encodeURIComponent(trimmed)}`;
  }
}

export function LivePage() {
  const liveApiUrl = import.meta.env.VITE_LIVE_API_URL as string | undefined;
  const liveApiOrigin = useMemo(() => getApiOrigin(liveApiUrl), [liveApiUrl]);
  const streamApiBaseEnv = import.meta.env.VITE_FILE_STREAM_API_URL as string | undefined;
  const streamApiBase = useMemo(() => {
    return resolveStreamApiBase(streamApiBaseEnv, liveApiOrigin, "/api/files/stream");
  }, [liveApiOrigin, streamApiBaseEnv]);
  const [videos, setVideos] = useState<LiveVideo[]>(liveVideos);
  const [activeId, setActiveId] = useState(liveVideos[0]?.id ?? "");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const apiUrl = liveApiUrl;
    if (!apiUrl) {
      logger.debug("Using seed live videos (no API URL)");
      return;
    }

    const controller = new AbortController();
    logger.info("Loading live videos from API", { apiUrl });

    fetch(apiUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: LiveVideo[]) => {
        if (Array.isArray(data) && data.length) {
          setVideos(data);
          setActiveId(data[0].id);
          logger.info("Loaded live videos from API", { count: data.length });
        }
      })
      .catch((err) => {
        logger.warn("Failed to load live videos from API; using seed", err);
      });

    return () => controller.abort();
  }, [liveApiUrl]);

  const activeVideo = useMemo<LiveVideo | undefined>(() => {
    return videos.find((video) => video.id === activeId) ?? videos[0];
  }, [activeId, videos]);
  const activeStreamUrl = useMemo(
    () => buildStreamUrl(activeVideo?.file, streamApiBase),
    [activeVideo?.file, streamApiBase],
  );

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
                    key={activeStreamUrl ?? activeVideo.file}
                    src={activeStreamUrl ?? undefined}
                    controls
                    preload="metadata"
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
