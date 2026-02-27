export type AdminApiError = {
  ok: false;
  error: string;
  message?: string;
  status?: number;
  requestId?: string;
};

type AdminHttpRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

type AdminHttpClient = {
  request<T>(path: string, options?: AdminHttpRequestOptions): Promise<T>;
};

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

function buildUrl(baseUrl: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${baseUrl}${path}`;
}

function normalizeError(data: unknown, status?: number): AdminApiError {
  if (data && typeof data === "object" && "error" in data) {
    const payload = data as AdminApiError & { requestId?: unknown };
    return {
      ok: false,
      error: payload.error || "RequestError",
      message: typeof payload.message === "string" ? payload.message : undefined,
      status,
      requestId: typeof payload.requestId === "string" ? payload.requestId : undefined,
    };
  }

  return {
    ok: false,
    error: "RequestError",
    message: "Request failed.",
    status,
  };
}

export function createAdminHttpClient(baseUrl: string): AdminHttpClient {
  return {
    async request<T>(path: string, options: AdminHttpRequestOptions = {}) {
      const response = await fetch(buildUrl(baseUrl, path), {
        method: options.method ?? "GET",
        credentials: "include",
        headers: {
          ...JSON_HEADERS,
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...(options.headers ?? {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.ok === false) {
        const error = normalizeError(data, response.status);
        throw Object.assign(new Error(error.message ?? "Request failed."), {
          details: error,
        });
      }

      return data as T;
    },
  };
}
