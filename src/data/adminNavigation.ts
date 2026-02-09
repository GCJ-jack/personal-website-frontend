export type AdminNavItem = {
  label: string;
  href: string;
  description?: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    description: "Snapshots, quick actions, and system status.",
  },
  {
    label: "Content",
    href: "/admin/content",
    description: "Projects, posts, live videos, and study resources.",
  },
  {
    label: "Media",
    href: "/admin/media",
    description: "Uploads, asset library, and file organization.",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    description: "Site config, users, roles, and permissions.",
  },
];
