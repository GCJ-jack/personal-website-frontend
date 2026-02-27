import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Page } from "../../components/shared/Page";
import { projects as seedProjects, type Project } from "../../data/projects";
import { createLogger } from "../../lib/logger";

const logger = createLogger("ProjectDetailPage");

type ProjectListPayload = Project[] | { data?: Project[] };
type ProjectLink = { label: string; href: string };

function normalizeExternalUrl(value: string | undefined) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function toProjectLink(input: unknown, index: number): ProjectLink | null {
  if (typeof input === "string") {
    const href = normalizeExternalUrl(input);
    return href ? { label: `Link ${index + 1}`, href } : null;
  }
  if (!input || typeof input !== "object") {
    return null;
  }

  const item = input as Record<string, unknown>;
  const rawHref = [item.href, item.url, item.link, item.value]
    .find((value) => typeof value === "string") as string | undefined;
  const href = normalizeExternalUrl(rawHref);
  if (!href) {
    return null;
  }

  const rawLabel = [item.label, item.name, item.title, item.type]
    .find((value) => typeof value === "string") as string | undefined;
  return { label: rawLabel?.trim() || `Link ${index + 1}`, href };
}

function extractLinksFromUnknown(input: unknown): ProjectLink[] {
  if (Array.isArray(input)) {
    return input
      .map((item, index) => toProjectLink(item, index))
      .filter(Boolean) as ProjectLink[];
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      return [];
    }
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return extractLinksFromUnknown(JSON.parse(trimmed));
      } catch {
        const href = normalizeExternalUrl(trimmed);
        return href ? [{ label: "Link 1", href }] : [];
      }
    }
    const href = normalizeExternalUrl(trimmed);
    return href ? [{ label: "Link 1", href }] : [];
  }

  if (input && typeof input === "object") {
    const objectLink = toProjectLink(input, 0);
    if (objectLink) {
      return [objectLink];
    }

    const mapLinks = Object.entries(input as Record<string, unknown>)
      .map(([key, value], index) => {
        if (typeof value === "string") {
          const href = normalizeExternalUrl(value);
          return href ? { label: key || `Link ${index + 1}`, href } : null;
        }

        const normalized = toProjectLink(value, index);
        if (!normalized) {
          return null;
        }
        return {
          label: normalized.label.startsWith("Link ") ? key || normalized.label : normalized.label,
          href: normalized.href,
        };
      })
      .filter(Boolean) as ProjectLink[];

    if (mapLinks.length) {
      return mapLinks;
    }
  }

  return [];
}

function extractProjectLinks(project: Project) {
  const p = project as unknown as Record<string, unknown>;
  const list: ProjectLink[] = [];

  const sources = [
    p.links,
    p.projectLinks,
    p.externalLinks,
    p.linkList,
    p.urls,
    (p.meta as Record<string, unknown> | undefined)?.links,
  ];

  for (const source of sources) {
    for (const link of extractLinksFromUnknown(source)) {
      if (!list.some((item) => item.href === link.href)) {
        list.push(link);
      }
    }
  }

  const fallbacks: Array<{ label: string; raw: unknown }> = [
    { label: "GitHub", raw: p.githubUrl ?? p.github ?? p.repoUrl ?? p.repo },
    { label: "Website", raw: p.website ?? p.url ?? p.link },
  ];

  for (const fallback of fallbacks) {
    if (typeof fallback.raw !== "string") {
      continue;
    }
    const href = normalizeExternalUrl(fallback.raw);
    if (href && !list.some((item) => item.href === href)) {
      list.push({ label: fallback.label, href });
    }
  }

  return list;
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projects, setProjects] = useState<Project[]>(seedProjects);

  function normalizeProjectListPayload(payload: ProjectListPayload): Project[] {
    if (Array.isArray(payload)) {
      return payload;
    }
    return Array.isArray(payload.data) ? payload.data : [];
  }

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_PROJECTS_API_URL as string | undefined;
    if (!apiUrl) {
      return;
    }

    const controller = new AbortController();
    fetch(apiUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((payload: ProjectListPayload) => {
        const data = normalizeProjectListPayload(payload);
        if (data.length) {
          setProjects(data);
        }
      })
      .catch((err) => {
        logger.warn("Failed to load project detail from API; using seed", err);
      });

    return () => controller.abort();
  }, []);

  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projects, projectId],
  );
  const links = useMemo(() => (project ? extractProjectLinks(project) : []), [project]);

  if (!project) {
    return (
      <Page title="Project" subtitle="Not found">
        <section className="card stack">
          <p>Project not found.</p>
          <div>
            <Link className="button ghost" to="/projects">Back to Projects</Link>
          </div>
        </section>
      </Page>
    );
  }

  return (
    <Page
      title={project.name}
      subtitle={project.date}
      intro={project.summary}
    >
      <section className="card stack">
        {project.cover ? (
          <img
            src={project.cover}
            alt={`${project.name} cover`}
            className="project-cover"
          />
        ) : null}
        <div className="tags">
          {project.stack.map((item) => (
            <span key={item} className="tag">{item}</span>
          ))}
        </div>
        {project.highlights?.length ? (
          <ul className="list">
            {project.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : null}
        <div className="card-actions">
          <Link className="button ghost" to="/projects">Back</Link>
          {links.map((link, index) => (
            <a key={`${project.id}-detail-link-${index}`} className="button" href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </Page>
  );
}
