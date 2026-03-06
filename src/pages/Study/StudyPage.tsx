import { useEffect, useMemo, useState } from "react";
import { Page } from "../../components/shared/Page";
import { mindmaps as seedMindmaps, type Mindmap } from "../../data/mindmaps";
import { createLogger } from "../../lib/logger";

const logger = createLogger("StudyPage");
type MindmapApi = Mindmap & {
  coverUrl?: string;
  fileUrl?: string;
  preview_url?: string;
};
type MindmapListResponse = MindmapApi[] | { data?: MindmapApi[] };

function normalizeMindmapsPayload(payload: MindmapListResponse): Mindmap[] {
  const list = Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : []);
  return list.map((item) => ({
    ...item,
    file: item.file ?? item.fileUrl ?? "",
    cover: item.cover ?? item.coverUrl,
    previewUrl: item.previewUrl ?? item.preview_url,
  }));
}

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

function normalizeBaseUrl(value?: string) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function resolveAssetUrl(
  value: string | undefined,
  apiOrigin: string | null,
  assetBaseUrl: string | null,
) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    if (assetBaseUrl) {
      return `${assetBaseUrl}${trimmed}`;
    }
    return apiOrigin ? `${apiOrigin}${trimmed}` : trimmed;
  }
  if (assetBaseUrl) {
    return `${assetBaseUrl}/${trimmed.replace(/^\.?\//, "")}`;
  }
  if (apiOrigin) {
    return `${apiOrigin}/${trimmed.replace(/^\.?\//, "")}`;
  }
  return trimmed;
}

function buildPreviewUrl(sourceUrl: string | null, previewApiBase: string) {
  if (!sourceUrl) {
    return null;
  }
  try {
    const resolvedSource = new URL(sourceUrl, window.location.href).toString();
    const endpoint = new URL(previewApiBase, window.location.origin);
    endpoint.searchParams.set("key", resolvedSource);
    return endpoint.toString();
  } catch {
    const joiner = previewApiBase.includes("?") ? "&" : "?";
    return `${previewApiBase}${joiner}key=${encodeURIComponent(sourceUrl)}`;
  }
}

function resolvePreviewApiBase(
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

export function StudyPage() {
  const studyApiUrl = import.meta.env.VITE_STUDY_API_URL as string | undefined;
  const assetBaseUrlEnv = import.meta.env.VITE_ASSET_BASE_URL as string | undefined;
  const previewApiBaseEnv = import.meta.env.VITE_FILE_PREVIEW_API_URL as string | undefined;
  const apiOrigin = useMemo(() => getApiOrigin(studyApiUrl), [studyApiUrl]);
  const previewApiBase = useMemo(
    () => resolvePreviewApiBase(previewApiBaseEnv, apiOrigin, "/api/files/preview"),
    [apiOrigin, previewApiBaseEnv],
  );
  const assetBaseUrl = useMemo(() => normalizeBaseUrl(assetBaseUrlEnv), [assetBaseUrlEnv]);
  const [activeMindmap, setActiveMindmap] = useState<Mindmap | null>(null);
  const [maps, setMaps] = useState<Mindmap[]>(seedMindmaps);

  useEffect(() => {
    const apiUrl = studyApiUrl;
    if (!apiUrl) {
      logger.debug("Using seed mindmaps (no API URL)");
      return;
    }

    const controller = new AbortController();
    logger.info("Loading mindmaps from API", { apiUrl });

    fetch(apiUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((payload: MindmapListResponse) => {
        const data = normalizeMindmapsPayload(payload);
        setMaps(data);
        logger.info("Loaded mindmaps from API", { count: data.length });
      })
      .catch((err) => {
        logger.warn("Failed to load mindmaps from API; using seed", err);
      });

    return () => controller.abort();
  }, [studyApiUrl]);

  const activeCoverUrl = useMemo(
    () => resolveAssetUrl(activeMindmap?.cover, apiOrigin, assetBaseUrl),
    [activeMindmap?.cover, apiOrigin, assetBaseUrl],
  );
  const activeFileUrl = useMemo(
    () => resolveAssetUrl(activeMindmap?.file, apiOrigin, assetBaseUrl),
    [activeMindmap?.file, apiOrigin, assetBaseUrl],
  );
  const activeOpenUrl = useMemo(
    () => buildPreviewUrl(
      resolveAssetUrl(activeMindmap?.previewUrl ?? activeMindmap?.file, apiOrigin, assetBaseUrl),
      previewApiBase,
    ),
    [activeMindmap?.previewUrl, activeMindmap?.file, apiOrigin, assetBaseUrl, previewApiBase],
  );

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
            <p className="small">Cover gallery for study mindmaps.</p>
          </div>
          <div className="grid-3">
            {maps.map((map) => {
              const coverUrl = resolveAssetUrl(map.cover, apiOrigin, assetBaseUrl);
              const fileUrl = resolveAssetUrl(map.file, apiOrigin, assetBaseUrl);
              const openUrl = buildPreviewUrl(
                resolveAssetUrl(map.previewUrl ?? map.file, apiOrigin, assetBaseUrl),
                previewApiBase,
              );

              return (
                <div key={map.id} className="card stack">
                  {coverUrl ? (
                    <img src={coverUrl} alt={`${map.title} cover`} className="mindmap-cover" />
                  ) : (
                    <div className="small">No cover image</div>
                  )}
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
                      Review
                    </button>
                    {openUrl ? (
                      <a
                        className="button ghost"
                        href={openUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                    ) : (
                      <button className="button ghost" type="button" disabled>
                        Open
                      </button>
                    )}
                    {fileUrl ? (
                      <a className="button ghost" href={fileUrl} download>
                        Download
                      </a>
                    ) : (
                      <button className="button ghost" type="button" disabled>
                        Download
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {activeMindmap ? (
        <dialog open className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div className="small">Review</div>
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
            {activeCoverUrl ? (
              <img
                src={activeCoverUrl}
                alt={`${activeMindmap.title} cover`}
                className="mindmap-cover modal-mindmap-cover"
              />
            ) : (
              <p className="small">No cover image for this mindmap.</p>
            )}
            <div className="card-actions">
              {activeOpenUrl ? (
                <a
                  className="button ghost"
                  href={activeOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              ) : (
                <button className="button ghost" type="button" disabled>
                  Open
                </button>
              )}
              {activeFileUrl ? (
                <a className="button ghost" href={activeFileUrl} download>
                  Download
                </a>
              ) : (
                <button className="button ghost" type="button" disabled>
                  Download
                </button>
              )}
            </div>
          </div>
        </dialog>
      ) : null}
    </Page>
  );
}
