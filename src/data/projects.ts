export type Project = {
  id?: number;
  slug?: string;
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

export const projects: Project[] = [];
