import { useEffect, useState } from "react";
import { Page } from "../../components/shared/Page";
import { projects as seedProjects, type Project } from "../../data/projects";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(seedProjects);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_PROJECTS_API_URL as string | undefined;
    if (!apiUrl) {
      return;
    }

    const controller = new AbortController();

    fetch(apiUrl, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: Project[]) => {
        if (Array.isArray(data) && data.length) {
          setProjects(data);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <Page
      title="Projects"
      subtitle="Selected work"
      intro="A curated list of technical projects and experiments."
    >
      <section>
        <div className="grid-2">
          {projects.map((project) => (
            <div key={project.id} className="card stack">
              {project.cover ? (
                <img
                  src={project.cover}
                  alt={`${project.name} cover`}
                  className="project-cover"
                />
              ) : null}
              <div className="stack">
                <div className="small">{project.date}</div>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
              </div>
              <div className="tags">
                {project.stack.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
              {project.highlights && project.highlights.length ? (
                <ul className="list">
                  {project.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
              {project.links && project.links.length ? (
                <div className="card-actions">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      className="button ghost"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
