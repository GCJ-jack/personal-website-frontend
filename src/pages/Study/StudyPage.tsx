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

type PreviewKind = "pdf" | "image" | "unsupported";

function getPreviewKind(fileUrl: string | null): PreviewKind {
  if (!fileUrl) {
    return "unsupported";
  }
  const pathname = fileUrl.split("#")[0].split("?")[0].toLowerCase();
  if (pathname.endsWith(".pdf")) {
    return "pdf";
  }
  if (/\.(png|jpe?g|webp|gif|bmp|svg|avif)$/.test(pathname)) {
    return "image";
  }
  return "unsupported";
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

export function StudyPage() {
  const studyApiUrl = import.meta.env.VITE_STUDY_API_URL as string | undefined;
  const assetBaseUrlEnv = import.meta.env.VITE_ASSET_BASE_URL as string | undefined;
  const apiOrigin = useMemo(() => getApiOrigin(studyApiUrl), [studyApiUrl]);
  const previewApiBaseEnv = import.meta.env.VITE_FILE_PREVIEW_API_URL as string | undefined;
  const previewApiBase = useMemo(() => {
    if (previewApiBaseEnv?.trim()) {
      return previewApiBaseEnv.trim();
    }
    return apiOrigin ? `${apiOrigin}/api/files/preview` : "/api/files/preview";
  }, [apiOrigin, previewApiBaseEnv]);
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

  const activeFileUrl = useMemo(
    () => resolveAssetUrl(activeMindmap?.file, apiOrigin, assetBaseUrl),
    [activeMindmap?.file, apiOrigin, assetBaseUrl],
  );
  const activePreviewSourceUrl = useMemo(
    () => resolveAssetUrl(activeMindmap?.previewUrl ?? activeMindmap?.file, apiOrigin, assetBaseUrl),
    [activeMindmap?.previewUrl, activeMindmap?.file, apiOrigin, assetBaseUrl],
  );
  const activeOpenUrl = useMemo(
    () => buildPreviewUrl(activePreviewSourceUrl, previewApiBase),
    [activePreviewSourceUrl, previewApiBase],
  );
  const activeCoverUrl = useMemo(
    () => resolveAssetUrl(activeMindmap?.cover, apiOrigin, assetBaseUrl),
    [activeMindmap?.cover, apiOrigin, assetBaseUrl],
  );
  const activePreviewKind = useMemo(
    () => getPreviewKind(activePreviewSourceUrl),
    [activePreviewSourceUrl],
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
            <p className="small">Browse, preview, and download study mindmaps.</p>
          </div>
          <div className="grid-3">
            {maps.map((map) => {
              const fileUrl = resolveAssetUrl(map.file, apiOrigin, assetBaseUrl);
              const previewSourceUrl = resolveAssetUrl(map.previewUrl ?? map.file, apiOrigin, assetBaseUrl);
              const openUrl = buildPreviewUrl(previewSourceUrl, previewApiBase);
              const coverUrl = resolveAssetUrl(map.cover, apiOrigin, assetBaseUrl);
              const canOpen = Boolean(openUrl);

              return (
                <div key={map.id} className="card stack">
                  {coverUrl ? (
                    <img src={coverUrl} alt={`${map.title} cover`} className="mindmap-cover" />
                  ) : null}
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
                    {!canOpen ? (
                      <div className="small">File URL is not available for this record.</div>
                    ) : null}
                  </div>
                  <div className="card-actions">
                    <button
                      className="button"
                      type="button"
                      onClick={() => setActiveMindmap(map)}
                      disabled={!canOpen}
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
            ) : null}
            {activePreviewKind === "pdf" && activeOpenUrl ? (
              <div className="pdf-preview-shell stack">
                <iframe
                  src={activeOpenUrl}
                  title={`${activeMindmap.title} PDF preview`}
                  className="pdf-preview"
                />
                <p className="small pdf-preview-tip">
                  This preview is served via the app preview API to force inline display.
                </p>
              </div>
            ) : null}
            {activePreviewKind === "image" && activeOpenUrl ? (
              <img
                src={activeOpenUrl}
                alt={`${activeMindmap.title} preview`}
                className="mindmap-preview-image"
              />
            ) : null}
            {activePreviewKind === "unsupported" ? (
              <p className="small">
                This file cannot be previewed inline. Use Open to view it in a new tab.
              </p>
            ) : null}
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
