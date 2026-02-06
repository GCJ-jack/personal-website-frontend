export type Project = {
  id: string;
  name: string;
  summary: string;
  stack: string[];
  cover?: string;
  highlights?: string[];
  date: string;
  links?: {
    label: string;
    href: string;
  }[];
};

export const projects: Project[] = [
  {
    id: "project-01",
    name: "Graduation Project",
    summary: "Brief summary of what this project does and why it matters.",
    stack: ["Java", "Spring", "MySQL"],
    cover: "/projects/project-01.jpg",
    highlights: [
      "Designed core modules and REST APIs.",
      "Implemented caching and messaging for performance.",
    ],
    date: "2024",
    links: [
      { label: "GitHub", href: "https://github.com/yourname/project" },
      { label: "Docs", href: "https://your-docs-link" },
    ],
  },
  {
    id: "project-02",
    name: "Mindmap Manager",
    summary: "Manage and publish study mindmaps with search and tags.",
    stack: ["React", "Vite", "TypeScript"],
    cover: "/projects/project-02.jpg",
    highlights: ["Fast search", "Responsive UI", "Export to PDF"],
    date: "2023",
  },
];
