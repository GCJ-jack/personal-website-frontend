import { useEffect, useMemo, useState } from "react";
import { createAdminContentApi, type AdminBlogPost } from "../../app/admin/data/adminContentApi";
import { useAdminAuth } from "../../app/admin/auth/useAdminAuth";
import type { LiveVideo } from "../../data/liveVideos";
import type { Mindmap } from "../../data/mindmaps";
import type { Project } from "../../data/projects";

type LoadState = "idle" | "loading" | "ready" | "error";
type FormErrors = string[];
type ContentPanel = "all" | "projects" | "live" | "mindmaps" | "blog";
type UploadTarget = "projectCover" | "liveCover" | "liveFile" | "mindmapFile" | "blogCover";
type UploadState = "idle" | "uploading" | "success" | "error";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyProject(): Project {
  return {
    id: "",
    name: "",
    summary: "",
    stack: [],
    date: getTodayDate(),
  };
}

function createEmptyLiveVideo(): LiveVideo {
  return {
    id: "",
    title: "",
    date: getTodayDate(),
    file: "",
  };
}

function createEmptyMindmap(): Mindmap {
  return {
    id: "",
    title: "",
    file: "",
    updatedAt: getTodayDate(),
  };
}

function createEmptyBlogPost(): AdminBlogPost {
  return {
    id: "",
    title: "",
    date: getTodayDate(),
    content: [],
  };
}

function parseCsv(input: string) {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseLines(input: string) {
  return input
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isValidDate(value: string) {
  return /^\\d{4}(-\\d{2}-\\d{2})?$/.test(value);
}

function isValidUrl(value: string) {
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
}

function buildErrors(errors: string[]) {
  return errors.filter(Boolean);
}

function extractUploadUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const data = typeof root.data === "object" && root.data !== null
    ? root.data as Record<string, unknown>
    : null;

  const candidates = [
    root.url,
    root.fileUrl,
    root.path,
    root.location,
    data?.url,
    data?.fileUrl,
    data?.path,
    data?.location,
  ];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) {
      return item.trim();
    }
  }

  return null;
}

function resolveUploadDir(target: UploadTarget): string {
  if (target === "projectCover") {
    return "projects";
  }
  if (target === "mindmapFile") {
    return "mindmaps";
  }
  return "live";
}

export function AdminContentPage() {
  const { token, isConfigured } = useAdminAuth();
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  const uploadApiUrl = import.meta.env.VITE_ADMIN_UPLOAD_API_URL as string | undefined;
  const api = useMemo(() => (apiUrl ? createAdminContentApi(apiUrl) : null), [apiUrl]);

  const [projectState, setProjectState] = useState<LoadState>("idle");
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState<Project>(() => createEmptyProject());
  const [projectEditingId, setProjectEditingId] = useState<string | null>(null);
  const [projectFormErrors, setProjectFormErrors] = useState<FormErrors>([]);

  const [liveState, setLiveState] = useState<LoadState>("idle");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveVideos, setLiveVideos] = useState<LiveVideo[]>([]);
  const [liveForm, setLiveForm] = useState<LiveVideo>(() => createEmptyLiveVideo());
  const [liveEditingId, setLiveEditingId] = useState<string | null>(null);
  const [liveFormErrors, setLiveFormErrors] = useState<FormErrors>([]);

  const [mindmapState, setMindmapState] = useState<LoadState>("idle");
  const [mindmapError, setMindmapError] = useState<string | null>(null);
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [mindmapForm, setMindmapForm] = useState<Mindmap>(() => createEmptyMindmap());
  const [mindmapEditingId, setMindmapEditingId] = useState<string | null>(null);
  const [mindmapFormErrors, setMindmapFormErrors] = useState<FormErrors>([]);

  const [blogState, setBlogState] = useState<LoadState>("idle");
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<AdminBlogPost>(() => createEmptyBlogPost());
  const [blogEditingId, setBlogEditingId] = useState<string | null>(null);
  const [blogFormErrors, setBlogFormErrors] = useState<FormErrors>([]);
  const [activePanel, setActivePanel] = useState<ContentPanel>("all");
  const [uploadState, setUploadState] = useState<Record<UploadTarget, UploadState>>({
    projectCover: "idle",
    liveCover: "idle",
    liveFile: "idle",
    mindmapFile: "idle",
    blogCover: "idle",
  });
  const [uploadMessage, setUploadMessage] = useState<Record<UploadTarget, string>>({
    projectCover: "",
    liveCover: "",
    liveFile: "",
    mindmapFile: "",
    blogCover: "",
  });

  useEffect(() => {
    if (!api || !isConfigured) {
      return;
    }

    setProjectState("loading");
    api
      .listProjects(token)
      .then((data) => {
        setProjects(data);
        setProjectState("ready");
      })
      .catch((err) => {
        setProjectError(err instanceof Error ? err.message : "Failed to load projects.");
        setProjectState("error");
      });
  }, [api, isConfigured, token]);

  useEffect(() => {
    if (!api || !isConfigured) {
      return;
    }

    setLiveState("loading");
    api
      .listLiveVideos(token)
      .then((data) => {
        setLiveVideos(data);
        setLiveState("ready");
      })
      .catch((err) => {
        setLiveError(err instanceof Error ? err.message : "Failed to load live videos.");
        setLiveState("error");
      });
  }, [api, isConfigured, token]);

  useEffect(() => {
    if (!api || !isConfigured) {
      return;
    }

    setMindmapState("loading");
    api
      .listMindmaps(token)
      .then((data) => {
        setMindmaps(data);
        setMindmapState("ready");
      })
      .catch((err) => {
        setMindmapError(err instanceof Error ? err.message : "Failed to load mindmaps.");
        setMindmapState("error");
      });
  }, [api, isConfigured, token]);

  useEffect(() => {
    if (!api || !isConfigured) {
      return;
    }

    setBlogState("loading");
    api
      .listBlogPosts(token)
      .then((data) => {
        setBlogPosts(data);
        setBlogState("ready");
      })
      .catch((err) => {
        setBlogError(err instanceof Error ? err.message : "Failed to load blog posts.");
        setBlogState("error");
      });
  }, [api, isConfigured, token]);

  const projectStackInput = projectForm.stack?.join(", ") ?? "";
  const projectHighlightsInput = projectForm.highlights?.join(", ") ?? "";
  const projectLinksInput = projectForm.links
    ? projectForm.links.map((link) => `${link.label}|${link.href}`).join("\n")
    : "";

  const liveCoverInput = liveForm.cover ?? "";
  const mindmapTagsInput = mindmapForm.tags?.join(", ") ?? "";
  const blogContentInput = blogForm.content?.join("\n") ?? "";
  const blogTagsInput = blogForm.tags?.join(", ") ?? "";

  const validateProject = () => {
    const errors = buildErrors([
      projectForm.name ? "" : "Project name is required.",
      projectForm.summary ? "" : "Project summary is required.",
      projectForm.date ? "" : "Project date is required.",
      projectForm.date && !isValidDate(projectForm.date) ? "Project date must be YYYY or YYYY-MM-DD." : "",
      projectForm.cover && !isValidUrl(projectForm.cover) ? "Project cover must be a URL or /path." : "",
      projectLinksInput && parseLines(projectLinksInput).some((line) => !line.includes("|"))
        ? "Links must be in the format Label|URL."
        : "",
    ]);
    setProjectFormErrors(errors);
    return errors.length === 0;
  };

  const validateLiveVideo = () => {
    const errors = buildErrors([
      liveForm.title ? "" : "Video title is required.",
      liveForm.date ? "" : "Video date is required.",
      liveForm.date && !isValidDate(liveForm.date) ? "Video date must be YYYY or YYYY-MM-DD." : "",
      liveForm.file ? "" : "Video file is required. Please upload it first.",
      liveForm.file && !isValidUrl(liveForm.file) ? "Video file path is invalid." : "",
      liveCoverInput && !isValidUrl(liveCoverInput) ? "Cover must be a URL or /path." : "",
    ]);
    setLiveFormErrors(errors);
    return errors.length === 0;
  };

  const validateMindmap = () => {
    const errors = buildErrors([
      mindmapForm.title ? "" : "Mindmap title is required.",
      mindmapForm.file ? "" : "Mindmap file is required. Please upload it first.",
      mindmapForm.file && !isValidUrl(mindmapForm.file) ? "Mindmap file path is invalid." : "",
      mindmapForm.updatedAt ? "" : "Updated At is required.",
      mindmapForm.updatedAt && !isValidDate(mindmapForm.updatedAt)
        ? "Updated At must be YYYY or YYYY-MM-DD."
        : "",
    ]);
    setMindmapFormErrors(errors);
    return errors.length === 0;
  };

  const validateBlogPost = () => {
    const errors = buildErrors([
      blogForm.title ? "" : "Post title is required.",
      blogForm.date ? "" : "Post date is required.",
      blogForm.date && !isValidDate(blogForm.date) ? "Post date must be YYYY or YYYY-MM-DD." : "",
      blogForm.cover && !isValidUrl(blogForm.cover) ? "Cover must be a URL or /path." : "",
      blogContentInput ? "" : "Post content is required.",
    ]);
    setBlogFormErrors(errors);
    return errors.length === 0;
  };

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!api) {
      return;
    }
    if (!validateProject()) {
      return;
    }

    const payload: Project = {
      ...projectForm,
      stack: parseCsv(projectStackInput),
      highlights: parseCsv(projectHighlightsInput),
      links: parseLines(projectLinksInput).map((line) => {
        const [label, href] = line.split("|").map((value) => value.trim());
        return { label: label || "Link", href: href || "" };
      }),
    };

    if (projectEditingId) {
      const updated = await api.updateProject(projectEditingId, payload, token);
      setProjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const { id, ...createPayload } = payload;
      const created = await api.createProject(createPayload, token);
      setProjects((prev) => [created, ...prev]);
    }

    setProjectForm(createEmptyProject());
    setProjectEditingId(null);
    setProjectFormErrors([]);
  };

  const handleLiveSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!api) {
      return;
    }
    if (!validateLiveVideo()) {
      return;
    }

    const payload: LiveVideo = {
      ...liveForm,
      cover: liveCoverInput || undefined,
    };

    if (liveEditingId) {
      const updated = await api.updateLiveVideo(liveEditingId, payload, token);
      setLiveVideos((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const { id, ...createPayload } = payload;
      const created = await api.createLiveVideo(createPayload, token);
      setLiveVideos((prev) => [created, ...prev]);
    }

    setLiveForm(createEmptyLiveVideo());
    setLiveEditingId(null);
    setLiveFormErrors([]);
  };

  const handleMindmapSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!api) {
      return;
    }
    if (!validateMindmap()) {
      return;
    }

    const payload: Mindmap = {
      ...mindmapForm,
      tags: parseCsv(mindmapTagsInput),
    };

    if (mindmapEditingId) {
      const updated = await api.updateMindmap(mindmapEditingId, payload, token);
      setMindmaps((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const { id, ...createPayload } = payload;
      const created = await api.createMindmap(createPayload, token);
      setMindmaps((prev) => [created, ...prev]);
    }

    setMindmapForm(createEmptyMindmap());
    setMindmapEditingId(null);
    setMindmapFormErrors([]);
  };

  const handleBlogSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!api) {
      return;
    }
    if (!validateBlogPost()) {
      return;
    }

    const payload: AdminBlogPost = {
      ...blogForm,
      content: parseLines(blogContentInput),
      tags: parseCsv(blogTagsInput),
    };

    if (blogEditingId) {
      const updated = await api.updateBlogPost(blogEditingId, payload, token);
      setBlogPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const { id, ...createPayload } = payload;
      const created = await api.createBlogPost(createPayload, token);
      setBlogPosts((prev) => [created, ...prev]);
    }

    setBlogForm(createEmptyBlogPost());
    setBlogEditingId(null);
    setBlogFormErrors([]);
  };

  const deleteProject = async (id: string) => {
    if (!api) {
      return;
    }
    await api.deleteProject(id, token);
    setProjects((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteLiveVideo = async (id: string) => {
    if (!api) {
      return;
    }
    await api.deleteLiveVideo(id, token);
    setLiveVideos((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteMindmap = async (id: string) => {
    if (!api) {
      return;
    }
    await api.deleteMindmap(id, token);
    setMindmaps((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteBlogPost = async (id: string) => {
    if (!api) {
      return;
    }
    await api.deleteBlogPost(id, token);
    setBlogPosts((prev) => prev.filter((item) => item.id !== id));
  };

  const uploadImage = async (target: UploadTarget, file: File | null) => {
    if (!file) {
      return;
    }

    if (!uploadApiUrl) {
      setUploadState((prev) => ({ ...prev, [target]: "error" }));
      setUploadMessage((prev) => ({
        ...prev,
        [target]: "Upload API not configured. Set VITE_ADMIN_UPLOAD_API_URL.",
      }));
      return;
    }

    setUploadState((prev) => ({ ...prev, [target]: "uploading" }));
    setUploadMessage((prev) => ({ ...prev, [target]: "" }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dir", resolveUploadDir(target));

    try {
      const response = await fetch(uploadApiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || (payload && typeof payload === "object" && "ok" in payload && payload.ok === false)) {
        throw new Error("Upload failed.");
      }

      const url = extractUploadUrl(payload);
      if (!url) {
        throw new Error("Upload succeeded but response does not contain URL.");
      }

      if (target === "projectCover") {
        setProjectForm((prev) => ({ ...prev, cover: url }));
      } else if (target === "liveCover") {
        setLiveForm((prev) => ({ ...prev, cover: url }));
      } else if (target === "liveFile") {
        setLiveForm((prev) => ({ ...prev, file: url }));
      } else if (target === "mindmapFile") {
        setMindmapForm((prev) => ({ ...prev, file: url }));
      } else {
        setBlogForm((prev) => ({ ...prev, cover: url }));
      }

      setUploadState((prev) => ({ ...prev, [target]: "success" }));
      setUploadMessage((prev) => ({ ...prev, [target]: `Uploaded: ${url}` }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setUploadState((prev) => ({ ...prev, [target]: "error" }));
      setUploadMessage((prev) => ({ ...prev, [target]: message }));
    }
  };

  if (!isConfigured) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-title">Admin API not configured</div>
        <div className="admin-panel-body">
          <p className="small">
            Set <code>VITE_ADMIN_API_URL</code> to enable content management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Content</div>
          <div className="admin-section-summary">
            Manage projects, live videos, mindmaps, and blog posts.
          </div>
          {!uploadApiUrl ? (
            <div className="small">
              File upload disabled. Set <code>VITE_ADMIN_UPLOAD_API_URL</code> to enable upload.
            </div>
          ) : null}
        </div>
        <div className="admin-actions">
          <button
            className={`button ${activePanel === "all" ? "" : "ghost"}`}
            type="button"
            onClick={() => setActivePanel("all")}
          >
            All
          </button>
          <button
            className={`button ${activePanel === "projects" ? "" : "ghost"}`}
            type="button"
            onClick={() => setActivePanel("projects")}
          >
            Projects
          </button>
          <button
            className={`button ${activePanel === "live" ? "" : "ghost"}`}
            type="button"
            onClick={() => setActivePanel("live")}
          >
            Live
          </button>
          <button
            className={`button ${activePanel === "mindmaps" ? "" : "ghost"}`}
            type="button"
            onClick={() => setActivePanel("mindmaps")}
          >
            Mindmaps
          </button>
          <button
            className={`button ${activePanel === "blog" ? "" : "ghost"}`}
            type="button"
            onClick={() => setActivePanel("blog")}
          >
            Blog
          </button>
        </div>
      </div>

      {activePanel === "all" || activePanel === "projects" ? (
        <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Projects</div>
        <div className="admin-panel-body">
          {projectState === "loading" ? <div className="small">Loading...</div> : null}
          {projectState === "error" && projectError ? (
            <div className="form-status error">{projectError}</div>
          ) : null}
          <form className="form" onSubmit={handleProjectSubmit}>
            <label className="form-field">
              <span>Name</span>
              <input
                value={projectForm.name}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Summary</span>
              <textarea
                rows={2}
                value={projectForm.summary}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, summary: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Stack (comma separated)</span>
              <input
                value={projectStackInput}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, stack: parseCsv(event.target.value) }))
                }
              />
            </label>
            <label className="form-field">
              <span>Highlights (comma separated)</span>
              <input
                value={projectHighlightsInput}
                onChange={(event) =>
                  setProjectForm((prev) => ({
                    ...prev,
                    highlights: parseCsv(event.target.value),
                  }))
                }
              />
            </label>
            <label className="form-field">
              <span>Upload Cover Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  void uploadImage("projectCover", event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {uploadState.projectCover === "uploading" ? (
              <div className="small">Uploading project cover...</div>
            ) : null}
            {uploadState.projectCover === "success" && uploadMessage.projectCover ? (
              <div className="form-status success">{uploadMessage.projectCover}</div>
            ) : null}
            {uploadState.projectCover === "error" && uploadMessage.projectCover ? (
              <div className="form-status error">{uploadMessage.projectCover}</div>
            ) : null}
            <label className="form-field">
              <span>Date</span>
              <input
                value={projectForm.date}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Links (one per line: Label|URL)</span>
              <textarea
                rows={3}
                value={projectLinksInput}
                onChange={(event) =>
                  setProjectForm((prev) => ({
                    ...prev,
                    links: parseLines(event.target.value).map((line) => {
                      const [label, href] = line.split("|").map((value) => value.trim());
                      return { label: label || "Link", href: href || "" };
                    }),
                  }))
                }
              />
            </label>
            <div className="admin-actions">
              <button className="button" type="submit">
                {projectEditingId ? "Update Project" : "Create Project"}
              </button>
              {projectEditingId ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    setProjectEditingId(null);
                    setProjectForm(createEmptyProject());
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {projectFormErrors.length ? (
              <div className="form-status error">
                {projectFormErrors.join(" ")}
              </div>
            ) : null}
          </form>

          <div className="admin-table">
            {projects.map((project) => (
              <div key={project.id} className="admin-row">
                <div>
                  <div className="admin-row-title">{project.name}</div>
                  <div className="small">{project.summary}</div>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setProjectEditingId(project.id);
                      setProjectForm(project);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => deleteProject(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && projectState === "ready" ? (
              <div className="small">No projects yet.</div>
            ) : null}
          </div>
        </div>
        </section>
      ) : null}

      {activePanel === "all" || activePanel === "live" ? (
        <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Live Videos</div>
        <div className="admin-panel-body">
          {liveState === "loading" ? <div className="small">Loading...</div> : null}
          {liveState === "error" && liveError ? (
            <div className="form-status error">{liveError}</div>
          ) : null}
          <form className="form" onSubmit={handleLiveSubmit}>
            <label className="form-field">
              <span>Title</span>
              <input
                value={liveForm.title}
                onChange={(event) =>
                  setLiveForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Date</span>
              <input
                value={liveForm.date}
                onChange={(event) =>
                  setLiveForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Description</span>
              <textarea
                rows={2}
                value={liveForm.description ?? ""}
                onChange={(event) =>
                  setLiveForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>
            <label className="form-field">
              <span>Upload Video File</span>
              <input
                type="file"
                accept="video/*"
                onChange={(event) => {
                  void uploadImage("liveFile", event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {liveForm.file ? <div className="small">Video file: {liveForm.file}</div> : null}
            {uploadState.liveFile === "uploading" ? (
              <div className="small">Uploading live video...</div>
            ) : null}
            {uploadState.liveFile === "success" && uploadMessage.liveFile ? (
              <div className="form-status success">{uploadMessage.liveFile}</div>
            ) : null}
            {uploadState.liveFile === "error" && uploadMessage.liveFile ? (
              <div className="form-status error">{uploadMessage.liveFile}</div>
            ) : null}
            <label className="form-field">
              <span>Upload Cover Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  void uploadImage("liveCover", event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {uploadState.liveCover === "uploading" ? (
              <div className="small">Uploading live cover...</div>
            ) : null}
            {uploadState.liveCover === "success" && uploadMessage.liveCover ? (
              <div className="form-status success">{uploadMessage.liveCover}</div>
            ) : null}
            {uploadState.liveCover === "error" && uploadMessage.liveCover ? (
              <div className="form-status error">{uploadMessage.liveCover}</div>
            ) : null}
            <div className="admin-actions">
              <button className="button" type="submit">
                {liveEditingId ? "Update Video" : "Create Video"}
              </button>
              {liveEditingId ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    setLiveEditingId(null);
                    setLiveForm(createEmptyLiveVideo());
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {liveFormErrors.length ? (
              <div className="form-status error">
                {liveFormErrors.join(" ")}
              </div>
            ) : null}
          </form>

          <div className="admin-table">
            {liveVideos.map((video) => (
              <div key={video.id} className="admin-row">
                <div>
                  <div className="admin-row-title">{video.title}</div>
                  <div className="small">{video.date}</div>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setLiveEditingId(video.id);
                      setLiveForm(video);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => deleteLiveVideo(video.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {liveVideos.length === 0 && liveState === "ready" ? (
              <div className="small">No live videos yet.</div>
            ) : null}
          </div>
        </div>
        </section>
      ) : null}

      {activePanel === "all" || activePanel === "mindmaps" ? (
        <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Mindmaps</div>
        <div className="admin-panel-body">
          {mindmapState === "loading" ? <div className="small">Loading...</div> : null}
          {mindmapState === "error" && mindmapError ? (
            <div className="form-status error">{mindmapError}</div>
          ) : null}
          <form className="form" onSubmit={handleMindmapSubmit}>
            <label className="form-field">
              <span>Title</span>
              <input
                value={mindmapForm.title}
                onChange={(event) =>
                  setMindmapForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Summary</span>
              <textarea
                rows={2}
                value={mindmapForm.summary ?? ""}
                onChange={(event) =>
                  setMindmapForm((prev) => ({ ...prev, summary: event.target.value }))
                }
              />
            </label>
            <label className="form-field">
              <span>Tags (comma separated)</span>
              <input
                value={mindmapTagsInput}
                onChange={(event) =>
                  setMindmapForm((prev) => ({ ...prev, tags: parseCsv(event.target.value) }))
                }
              />
            </label>
            <label className="form-field">
              <span>Upload Mindmap File</span>
              <input
                type="file"
                accept=".pdf,application/pdf,image/*"
                onChange={(event) => {
                  void uploadImage("mindmapFile", event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {mindmapForm.file ? <div className="small">Mindmap file: {mindmapForm.file}</div> : null}
            {uploadState.mindmapFile === "uploading" ? (
              <div className="small">Uploading mindmap file...</div>
            ) : null}
            {uploadState.mindmapFile === "success" && uploadMessage.mindmapFile ? (
              <div className="form-status success">{uploadMessage.mindmapFile}</div>
            ) : null}
            {uploadState.mindmapFile === "error" && uploadMessage.mindmapFile ? (
              <div className="form-status error">{uploadMessage.mindmapFile}</div>
            ) : null}
            <label className="form-field">
              <span>Updated At</span>
              <input
                value={mindmapForm.updatedAt}
                onChange={(event) =>
                  setMindmapForm((prev) => ({ ...prev, updatedAt: event.target.value }))
                }
                required
              />
            </label>
            <div className="admin-actions">
              <button className="button" type="submit">
                {mindmapEditingId ? "Update Mindmap" : "Create Mindmap"}
              </button>
              {mindmapEditingId ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    setMindmapEditingId(null);
                    setMindmapForm(createEmptyMindmap());
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {mindmapFormErrors.length ? (
              <div className="form-status error">
                {mindmapFormErrors.join(" ")}
              </div>
            ) : null}
          </form>

          <div className="admin-table">
            {mindmaps.map((mindmap) => (
              <div key={mindmap.id} className="admin-row">
                <div>
                  <div className="admin-row-title">{mindmap.title}</div>
                  <div className="small">{mindmap.updatedAt}</div>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setMindmapEditingId(mindmap.id);
                      setMindmapForm(mindmap);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => deleteMindmap(mindmap.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {mindmaps.length === 0 && mindmapState === "ready" ? (
              <div className="small">No mindmaps yet.</div>
            ) : null}
          </div>
        </div>
        </section>
      ) : null}

      {activePanel === "all" || activePanel === "blog" ? (
        <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Blog Posts</div>
        <div className="admin-panel-body">
          {blogState === "loading" ? <div className="small">Loading...</div> : null}
          {blogState === "error" && blogError ? (
            <div className="form-status error">{blogError}</div>
          ) : null}
          <form className="form" onSubmit={handleBlogSubmit}>
            <label className="form-field">
              <span>Title</span>
              <input
                value={blogForm.title}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Date</span>
              <input
                value={blogForm.date ?? ""}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Upload Cover Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  void uploadImage("blogCover", event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {uploadState.blogCover === "uploading" ? (
              <div className="small">Uploading blog cover...</div>
            ) : null}
            {uploadState.blogCover === "success" && uploadMessage.blogCover ? (
              <div className="form-status success">{uploadMessage.blogCover}</div>
            ) : null}
            {uploadState.blogCover === "error" && uploadMessage.blogCover ? (
              <div className="form-status error">{uploadMessage.blogCover}</div>
            ) : null}
            <label className="form-field">
              <span>Content (one paragraph per line)</span>
              <textarea
                rows={4}
                value={blogContentInput}
                onChange={(event) =>
                  setBlogForm((prev) => ({
                    ...prev,
                    content: parseLines(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Tags (comma separated)</span>
              <input
                value={blogTagsInput}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, tags: parseCsv(event.target.value) }))
                }
              />
            </label>
            <div className="admin-actions">
              <button className="button" type="submit">
                {blogEditingId ? "Update Post" : "Create Post"}
              </button>
              {blogEditingId ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    setBlogEditingId(null);
                    setBlogForm(createEmptyBlogPost());
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {blogFormErrors.length ? (
              <div className="form-status error">
                {blogFormErrors.join(" ")}
              </div>
            ) : null}
          </form>

          <div className="admin-table">
            {blogPosts.map((post) => (
              <div key={post.id} className="admin-row">
                <div>
                  <div className="admin-row-title">{post.title}</div>
                  <div className="small">{post.date}</div>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setBlogEditingId(post.id);
                      setBlogForm(post);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => deleteBlogPost(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {blogPosts.length === 0 && blogState === "ready" ? (
              <div className="small">No blog posts yet.</div>
            ) : null}
          </div>
        </div>
        </section>
      ) : null}
    </div>
  );
}
