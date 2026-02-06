export type Mindmap = {
  id: string;
  title: string;
  summary?: string;
  tags?: string[];
  file: string;
  updatedAt: string;
};

export const mindmaps: Mindmap[] = [
  {
    id: "java-concurrency",
    title: "Java Concurrency",
    summary: "Thread model, JUC, locks, and common patterns.",
    tags: ["Java", "JUC", "Concurrency"],
    file: "/mindmaps/java-concurrency.pdf",
    updatedAt: "2025-12-01",
  },
  {
    id: "mysql-index",
    title: "MySQL Index & MVCC",
    summary: "Indexing, isolation levels, and MVCC basics.",
    tags: ["MySQL", "Database"],
    file: "/mindmaps/mysql-index-mvcc.pdf",
    updatedAt: "2025-11-20",
  },
  {
    id: "spring-core",
    title: "Spring Core",
    summary: "IoC, AOP, transactions, and MVC essentials.",
    tags: ["Spring", "Backend"],
    file: "/mindmaps/spring-core.pdf",
    updatedAt: "2025-10-18",
  },
];
