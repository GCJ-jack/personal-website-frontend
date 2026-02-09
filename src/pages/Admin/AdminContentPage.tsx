import { useEffect, useMemo, useState } from "react";
import { createAdminContentApi, type AdminBlogPost } from "../../app/admin/data/adminContentApi";
import { useAdminAuth } from "../../app/admin/auth/useAdminAuth";
import type { LiveVideo } from "../../data/liveVideos";
import type { Mindmap } from "../../data/mindmaps";
import type { Project } from "../../data/projects";

type LoadState = "idle" | "loading" | "ready" | "error";
type FormErrors = string[];

const emptyProject: Project = {
  id: "",
  name: "",
  summary: "",
  stack: [],
  date: "",
};

const emptyLiveVideo: LiveVideo = {
  id: "",
  title: "",
  date: "",
  file: "",
};

const emptyMindmap: Mindmap = {
  id: "",
  title: "",
  file: "",
  updatedAt: "",
};

const emptyBlogPost: AdminBlogPost = {
  id: "",
  title: "",
  date: "",
  content: [],
};

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

function isValidId(value: string) {
  return /^[a-z0-9-]+$/.test(value);
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

export function AdminContentPage() {
  const { token, isConfigured } = useAdminAuth();
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  const api = useMemo(() => (apiUrl ? createAdminContentApi(apiUrl) : null), [apiUrl]);

  const [projectState, setProjectState] = useState<LoadState>("idle");
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState<Project>(emptyProject);
  const [projectEditingId, setProjectEditingId] = useState<string | null>(null);
  const [projectFormErrors, setProjectFormErrors] = useState<FormErrors>([]);

  const [liveState, setLiveState] = useState<LoadState>("idle");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveVideos, setLiveVideos] = useState<LiveVideo[]>([]);
  const [liveForm, setLiveForm] = useState<LiveVideo>(emptyLiveVideo);
  const [liveEditingId, setLiveEditingId] = useState<string | null>(null);
  const [liveFormErrors, setLiveFormErrors] = useState<FormErrors>([]);

  const [mindmapState, setMindmapState] = useState<LoadState>("idle");
  const [mindmapError, setMindmapError] = useState<string | null>(null);
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [mindmapForm, setMindmapForm] = useState<Mindmap>(emptyMindmap);
  const [mindmapEditingId, setMindmapEditingId] = useState<string | null>(null);
  const [mindmapFormErrors, setMindmapFormErrors] = useState<FormErrors>([]);

  const [blogState, setBlogState] = useState<LoadState>("idle");
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<AdminBlogPost>(emptyBlogPost);
  const [blogEditingId, setBlogEditingId] = useState<string | null>(null);
  const [blogFormErrors, setBlogFormErrors] = useState<FormErrors>([]);

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
      projectForm.id ? "" : "Project ID is required.",
      projectForm.id && !isValidId(projectForm.id) ? "Project ID must be lowercase letters, numbers, or hyphens." : "",
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
      liveForm.id ? "" : "Video ID is required.",
      liveForm.id && !isValidId(liveForm.id) ? "Video ID must be lowercase letters, numbers, or hyphens." : "",
      liveForm.title ? "" : "Video title is required.",
      liveForm.date ? "" : "Video date is required.",
      liveForm.date && !isValidDate(liveForm.date) ? "Video date must be YYYY or YYYY-MM-DD." : "",
      liveForm.file ? "" : "Video file URL is required.",
      liveForm.file && !isValidUrl(liveForm.file) ? "Video file must be a URL or /path." : "",
      liveCoverInput && !isValidUrl(liveCoverInput) ? "Cover must be a URL or /path." : "",
    ]);
    setLiveFormErrors(errors);
    return errors.length === 0;
  };

  const validateMindmap = () => {
    const errors = buildErrors([
      mindmapForm.id ? "" : "Mindmap ID is required.",
      mindmapForm.id && !isValidId(mindmapForm.id) ? "Mindmap ID must be lowercase letters, numbers, or hyphens." : "",
      mindmapForm.title ? "" : "Mindmap title is required.",
      mindmapForm.file ? "" : "Mindmap file URL is required.",
      mindmapForm.file && !isValidUrl(mindmapForm.file) ? "Mindmap file must be a URL or /path." : "",
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
      blogForm.id ? "" : "Post ID is required.",
      blogForm.id && !isValidId(blogForm.id) ? "Post ID must be lowercase letters, numbers, or hyphens." : "",
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
      const created = await api.createProject(payload, token);
      setProjects((prev) => [created, ...prev]);
    }

    setProjectForm(emptyProject);
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
      const created = await api.createLiveVideo(payload, token);
      setLiveVideos((prev) => [created, ...prev]);
    }

    setLiveForm(emptyLiveVideo);
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
      const created = await api.createMindmap(payload, token);
      setMindmaps((prev) => [created, ...prev]);
    }

    setMindmapForm(emptyMindmap);
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
      const created = await api.createBlogPost(payload, token);
      setBlogPosts((prev) => [created, ...prev]);
    }

    setBlogForm(emptyBlogPost);
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
        </div>
      </div>

      <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Projects</div>
        <div className="admin-panel-body">
          {projectState === "loading" ? <div className="small">Loading...</div> : null}
          {projectState === "error" && projectError ? (
            <div className="form-status error">{projectError}</div>
          ) : null}
          <form className="form" onSubmit={handleProjectSubmit}>
            <label className="form-field">
              <span>ID</span>
              <input
                value={projectForm.id}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, id: event.target.value }))
                }
                required
              />
            </label>
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
              <span>Cover URL</span>
              <input
                value={projectForm.cover ?? ""}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, cover: event.target.value }))
                }
              />
            </label>
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
                    setProjectForm(emptyProject);
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

      <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Live Videos</div>
        <div className="admin-panel-body">
          {liveState === "loading" ? <div className="small">Loading...</div> : null}
          {liveState === "error" && liveError ? (
            <div className="form-status error">{liveError}</div>
          ) : null}
          <form className="form" onSubmit={handleLiveSubmit}>
            <label className="form-field">
              <span>ID</span>
              <input
                value={liveForm.id}
                onChange={(event) =>
                  setLiveForm((prev) => ({ ...prev, id: event.target.value }))
                }
                required
              />
            </label>
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
              <span>Video File URL</span>
              <input
                value={liveForm.file}
                onChange={(event) =>
                  setLiveForm((prev) => ({ ...prev, file: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Cover URL</span>
              <input
                value={liveCoverInput}
                onChange={(event) =>
                  setLiveForm((prev) => ({ ...prev, cover: event.target.value }))
                }
              />
            </label>
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
                    setLiveForm(emptyLiveVideo);
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

      <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Mindmaps</div>
        <div className="admin-panel-body">
          {mindmapState === "loading" ? <div className="small">Loading...</div> : null}
          {mindmapState === "error" && mindmapError ? (
            <div className="form-status error">{mindmapError}</div>
          ) : null}
          <form className="form" onSubmit={handleMindmapSubmit}>
            <label className="form-field">
              <span>ID</span>
              <input
                value={mindmapForm.id}
                onChange={(event) =>
                  setMindmapForm((prev) => ({ ...prev, id: event.target.value }))
                }
                required
              />
            </label>
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
              <span>File URL</span>
              <input
                value={mindmapForm.file}
                onChange={(event) =>
                  setMindmapForm((prev) => ({ ...prev, file: event.target.value }))
                }
                required
              />
            </label>
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
                    setMindmapForm(emptyMindmap);
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

      <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">Blog Posts</div>
        <div className="admin-panel-body">
          {blogState === "loading" ? <div className="small">Loading...</div> : null}
          {blogState === "error" && blogError ? (
            <div className="form-status error">{blogError}</div>
          ) : null}
          <form className="form" onSubmit={handleBlogSubmit}>
            <label className="form-field">
              <span>ID</span>
              <input
                value={blogForm.id}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, id: event.target.value }))
                }
                required
              />
            </label>
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
                value={blogForm.date}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Cover URL</span>
              <input
                value={blogForm.cover ?? ""}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, cover: event.target.value }))
                }
              />
            </label>
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
                    setBlogForm(emptyBlogPost);
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
    </div>
  );
}
