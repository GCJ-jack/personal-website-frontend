export type TodoPriority = "high" | "medium" | "low";

export type TodoItem = {
  id: number;
  title: string;
  priority: TodoPriority;
  dueDate: string | null;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type TodoListResponse = {
  ok: boolean;
  data?: TodoItem[];
  error?: string | null;
  message?: string | null;
};

type TodoEntityResponse = {
  ok: boolean;
  data?: TodoItem;
  error?: string | null;
  message?: string | null;
};

type TodoCreateInput = {
  title: string;
  priority: TodoPriority;
  dueDate?: string | null;
};

type TodoPatchInput = {
  title?: string;
  priority?: TodoPriority;
  dueDate?: string | null;
  done?: boolean;
};

function getBaseUrl() {
  const value = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  if (!value) {
    throw new Error("VITE_ADMIN_API_URL is not configured.");
  }
  return value;
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

function getApiErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const value = payload as { message?: unknown; error?: unknown };
  if (typeof value.message === "string" && value.message.trim()) {
    return value.message;
  }
  if (typeof value.error === "string" && value.error.trim()) {
    return value.error;
  }
  return fallback;
}

function normalizeTodo(item: TodoItem): TodoItem {
  return {
    ...item,
    dueDate: item.dueDate ?? null,
  };
}

function normalizeTodoList(payload: TodoListResponse | TodoItem[]) {
  const list = Array.isArray(payload) ? payload : payload.data;
  return Array.isArray(list) ? list.map((item) => normalizeTodo(item)) : [];
}

function normalizeTodoEntity(payload: TodoEntityResponse | TodoItem) {
  if (payload && typeof payload === "object" && "ok" in payload) {
    const wrapped = payload as TodoEntityResponse;
    if (wrapped.data) {
      return normalizeTodo(wrapped.data);
    }
  }
  return normalizeTodo(payload as TodoItem);
}

async function request<T>(path: string, options: RequestInit, fallback: string): Promise<T> {
  const response = await fetch(joinUrl(getBaseUrl(), path), {
    credentials: "include",
    ...options,
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }
  if (payload && typeof payload === "object" && "ok" in payload) {
    const wrapped = payload as { ok?: unknown };
    if (wrapped.ok === false) {
      throw new Error(getApiErrorMessage(payload, fallback));
    }
  }
  return payload as T;
}

export async function fetchTodos(): Promise<TodoItem[]> {
  const payload = await request<TodoListResponse | TodoItem[]>(
    "/todos",
    { method: "GET" },
    "Failed to load todos.",
  );
  return normalizeTodoList(payload);
}

export async function createTodo(input: TodoCreateInput): Promise<TodoItem> {
  const payload = await request<TodoEntityResponse | TodoItem>(
    "/todos",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "Failed to create todo.",
  );
  return normalizeTodoEntity(payload);
}

export async function updateTodo(id: number, input: TodoPatchInput): Promise<TodoItem> {
  const payload = await request<TodoEntityResponse | TodoItem>(
    `/todos/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "Failed to update todo.",
  );
  return normalizeTodoEntity(payload);
}

export async function deleteTodo(id: number): Promise<void> {
  await request<{ ok?: boolean } | null>(
    `/todos/${id}`,
    { method: "DELETE" },
    "Failed to delete todo.",
  );
}
