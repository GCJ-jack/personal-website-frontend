import { createAdminHttpClient } from "../http/adminHttp";
import type { LiveVideo } from "../../../data/liveVideos";
import type { Mindmap } from "../../../data/mindmaps";
import type { Project } from "../../../data/projects";

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  date: string | null;
  coverUrl?: string;
  excerpt?: string;
  status?: "published" | "draft";
  content: string[];
  tags?: string[];
};

export type AdminComment = {
  id: string;
  postId: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type AdminListResponse<T> = {
  ok: true;
  data: T[];
};

type AdminEntityResponse<T> = {
  ok: true;
  data: T;
};

type AdminCreateInput<T extends { id: string }> = Omit<T, "id"> & { id?: string };

function normalizeList<T>(payload: AdminListResponse<T> | T[]) {
  return Array.isArray(payload) ? payload : payload.data;
}

function normalizeEntity<T>(payload: AdminEntityResponse<T> | T) {
  return "data" in (payload as AdminEntityResponse<T>)
    ? (payload as AdminEntityResponse<T>).data
    : (payload as T);
}

function normalizeBlogPost(payload: AdminBlogPost): AdminBlogPost {
  return {
    ...payload,
    slug: payload.slug ?? "",
    coverUrl: payload.coverUrl ?? (payload as unknown as { cover?: string }).cover,
    status: payload.status ?? "published",
    date: payload.date ?? "",
  };
}

export function createAdminContentApi(baseUrl: string) {
  const http = createAdminHttpClient(baseUrl);

  return {
    async listProjects(token?: string | null) {
      const payload = await http.request<AdminListResponse<Project> | Project[]>(
        "/projects",
        { token },
      );
      return normalizeList(payload);
    },
    async createProject(input: AdminCreateInput<Project>, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<Project> | Project>(
        "/projects",
        { method: "POST", body: input, token },
      );
      return normalizeEntity(payload);
    },
    async updateProject(id: string, input: Project, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<Project> | Project>(
        `/projects/${id}`,
        { method: "PUT", body: input, token },
      );
      return normalizeEntity(payload);
    },
    async deleteProject(id: string, token?: string | null) {
      return http.request<{ ok: true }>(`/projects/${id}`, {
        method: "DELETE",
        token,
      });
    },

    async listLiveVideos(token?: string | null) {
      const payload = await http.request<AdminListResponse<LiveVideo> | LiveVideo[]>(
        "/live-videos",
        { token },
      );
      return normalizeList(payload);
    },
    async createLiveVideo(input: AdminCreateInput<LiveVideo>, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<LiveVideo> | LiveVideo>(
        "/live-videos",
        { method: "POST", body: input, token },
      );
      return normalizeEntity(payload);
    },
    async updateLiveVideo(id: string, input: LiveVideo, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<LiveVideo> | LiveVideo>(
        `/live-videos/${id}`,
        { method: "PUT", body: input, token },
      );
      return normalizeEntity(payload);
    },
    async deleteLiveVideo(id: string, token?: string | null) {
      return http.request<{ ok: true }>(`/live-videos/${id}`, {
        method: "DELETE",
        token,
      });
    },

    async listMindmaps(token?: string | null) {
      const payload = await http.request<AdminListResponse<Mindmap> | Mindmap[]>(
        "/mindmaps",
        { token },
      );
      return normalizeList(payload);
    },
    async createMindmap(input: AdminCreateInput<Mindmap>, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<Mindmap> | Mindmap>(
        "/mindmaps",
        { method: "POST", body: input, token },
      );
      return normalizeEntity(payload);
    },
    async updateMindmap(id: string, input: Mindmap, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<Mindmap> | Mindmap>(
        `/mindmaps/${id}`,
        { method: "PUT", body: input, token },
      );
      return normalizeEntity(payload);
    },
    async deleteMindmap(id: string, token?: string | null) {
      return http.request<{ ok: true }>(`/mindmaps/${id}`, {
        method: "DELETE",
        token,
      });
    },

    async listBlogPosts(token?: string | null) {
      const payload = await http.request<AdminListResponse<AdminBlogPost> | AdminBlogPost[]>(
        "/blog-posts",
        { token },
      );
      return normalizeList(payload).map(normalizeBlogPost);
    },
    async createBlogPost(input: AdminCreateInput<AdminBlogPost>, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<AdminBlogPost> | AdminBlogPost>(
        "/blog-posts",
        { method: "POST", body: input, token },
      );
      return normalizeBlogPost(normalizeEntity(payload));
    },
    async updateBlogPost(id: string, input: AdminBlogPost, token?: string | null) {
      const payload = await http.request<AdminEntityResponse<AdminBlogPost> | AdminBlogPost>(
        `/blog-posts/${id}`,
        { method: "PUT", body: input, token },
      );
      return normalizeBlogPost(normalizeEntity(payload));
    },
    async deleteBlogPost(id: string, token?: string | null) {
      return http.request<{ ok: true }>(`/blog-posts/${id}`, {
        method: "DELETE",
        token,
      });
    },

    async listComments(token?: string | null) {
      const payload = await http.request<AdminListResponse<AdminComment> | AdminComment[]>(
        "/comments",
        { token },
      );
      return normalizeList(payload);
    },
  };
}
