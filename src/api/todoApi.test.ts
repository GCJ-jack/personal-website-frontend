import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTodo, deleteTodo, fetchTodos, updateTodo } from "./todoApi";

type MockPayload = unknown;

function mockJsonResponse(status: number, payload: MockPayload): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

function mockJsonRejected(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockRejectedValue(new Error("invalid json")),
  } as unknown as Response;
}

describe("todoApi integration", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_ADMIN_API_URL", "/api/admin");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fetchTodos should request GET /todos with credentials and parse wrapped payload", async () => {
    const todos = [
      { id: 1, title: "A", priority: "high", dueDate: null, done: false },
      { id: 2, title: "B", priority: "low", done: true },
    ];
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(200, { ok: true, data: todos }));

    const result = await fetchTodos();

    expect(fetch).toHaveBeenCalledWith("/api/admin/todos", expect.objectContaining({
      method: "GET",
      credentials: "include",
    }));
    expect(result).toEqual([
      { id: 1, title: "A", priority: "high", dueDate: null, done: false },
      { id: 2, title: "B", priority: "low", dueDate: null, done: true },
    ]);
  });

  it("fetchTodos should parse plain array payload", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockJsonResponse(200, [{ id: 9, title: "X", priority: "medium", dueDate: null, done: false }]),
    );

    const result = await fetchTodos();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(9);
  });

  it("createTodo should POST /todos with body and return created entity", async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(200, {
      ok: true,
      data: { id: 10, title: "Create", priority: "medium", dueDate: "2026-03-20", done: false },
    }));

    const created = await createTodo({
      title: "Create",
      priority: "medium",
      dueDate: "2026-03-20",
    });

    expect(fetch).toHaveBeenCalledWith("/api/admin/todos", expect.objectContaining({
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Create",
        priority: "medium",
        dueDate: "2026-03-20",
      }),
    }));
    expect(created).toEqual({
      id: 10,
      title: "Create",
      priority: "medium",
      dueDate: "2026-03-20",
      done: false,
    });
  });

  it("updateTodo should PATCH /todos/{id} and return updated entity", async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(200, {
      ok: true,
      data: { id: 11, title: "Patch", priority: "high", dueDate: null, done: true },
    }));

    const updated = await updateTodo(11, { done: true });

    expect(fetch).toHaveBeenCalledWith("/api/admin/todos/11", expect.objectContaining({
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    }));
    expect(updated.done).toBe(true);
  });

  it("deleteTodo should DELETE /todos/{id}", async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(200, { ok: true }));

    await deleteTodo(12);

    expect(fetch).toHaveBeenCalledWith("/api/admin/todos/12", expect.objectContaining({
      method: "DELETE",
      credentials: "include",
    }));
  });

  it("should throw backend message when response is non-2xx", async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(400, {
      ok: false,
      error: "ValidationError",
      message: "title is required",
    }));

    await expect(createTodo({
      title: "",
      priority: "medium",
      dueDate: null,
    })).rejects.toThrow("title is required");
  });

  it("should throw on ok:false even with HTTP 200", async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(200, {
      ok: false,
      error: "ValidationError",
      message: "priority invalid",
    }));

    await expect(updateTodo(1, { priority: "medium" })).rejects.toThrow("priority invalid");
  });

  it("should fallback message when json parsing fails on error response", async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonRejected(500));

    await expect(fetchTodos()).rejects.toThrow("Failed to load todos.");
  });
});
