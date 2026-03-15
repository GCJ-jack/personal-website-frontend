import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../../app/admin/auth/useAdminAuth";
import { createAdminContentApi } from "../../app/admin/data/adminContentApi";
import { createTodo, deleteTodo, fetchTodos, updateTodo, type TodoItem, type TodoPriority } from "../../api/todoApi";
import { adminNavItems } from "../../data/adminNavigation";
import { createLogger } from "../../lib/logger";

type LoadState = "idle" | "ready" | "error";
type TodoLoadState = "loading" | "ready" | "error";
type TodoFilter = "all" | "active" | "done";

type OverviewMetrics = {
  projectsCount: number;
  liveVideosCount: number;
  mindmapsCount: number;
  blogPostsCount: number;
  commentsCount: number;
  recentAdded7d: number | null;
};

const initialMetrics: OverviewMetrics = {
  projectsCount: 0,
  liveVideosCount: 0,
  mindmapsCount: 0,
  blogPostsCount: 0,
  commentsCount: 0,
  recentAdded7d: null,
};

const logger = createLogger("AdminHomePage");

const priorityLabel: Record<TodoPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function countRecentCreated(items: unknown[], days: number) {
  const now = Date.now();
  const threshold = now - days * 24 * 60 * 60 * 1000;
  let count = 0;

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const createdAt = (item as { createdAt?: unknown }).createdAt;
    if (typeof createdAt !== "string") {
      continue;
    }

    const timestamp = Date.parse(createdAt);
    if (Number.isNaN(timestamp)) {
      continue;
    }

    if (timestamp >= threshold && timestamp <= now) {
      count += 1;
    }
  }

  return count;
}

function getPriorityRank(priority: TodoPriority) {
  if (priority === "high") {
    return 0;
  }
  if (priority === "medium") {
    return 1;
  }
  return 2;
}

export function AdminHomePage() {
  const { token, isConfigured } = useAdminAuth();
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  const api = useMemo(() => (apiUrl ? createAdminContentApi(apiUrl) : null), [apiUrl]);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<OverviewMetrics>(initialMetrics);

  const [todoTitle, setTodoTitle] = useState("");
  const [todoPriority, setTodoPriority] = useState<TodoPriority>("medium");
  const [todoDueDate, setTodoDueDate] = useState("");
  const [todoFilter, setTodoFilter] = useState<TodoFilter>("all");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoState, setTodoState] = useState<TodoLoadState>("loading");
  const [todoError, setTodoError] = useState<string | null>(null);
  const [todoSubmitting, setTodoSubmitting] = useState(false);
  const [todoUpdatingId, setTodoUpdatingId] = useState<number | null>(null);
  const [todoDeletingId, setTodoDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!api || !isConfigured) {
      return;
    }

    logger.info("Loading admin overview metrics");

    Promise
      .all([
        api.listProjects(token),
        api.listLiveVideos(token),
        api.listMindmaps(token),
        api.listBlogPosts(token),
        api.listComments(token),
      ])
      .then(([projects, liveVideos, mindmaps, blogPosts, comments]) => {
        const recentProjectsCount = countRecentCreated(projects as unknown[], 7);
        const recentLiveVideosCount = countRecentCreated(liveVideos as unknown[], 7);
        const recentMindmapsCount = countRecentCreated(mindmaps as unknown[], 7);
        const recentBlogPostsCount = countRecentCreated(blogPosts as unknown[], 7);
        const totalRecent7d = recentProjectsCount + recentLiveVideosCount + recentMindmapsCount + recentBlogPostsCount;
        const hasCreatedAt = totalRecent7d > 0
          || projects.some((item) => Boolean((item as { createdAt?: string }).createdAt))
          || liveVideos.some((item) => Boolean((item as { createdAt?: string }).createdAt))
          || mindmaps.some((item) => Boolean((item as { createdAt?: string }).createdAt))
          || blogPosts.some((item) => Boolean((item as { createdAt?: string }).createdAt));

        setMetrics({
          projectsCount: projects.length,
          liveVideosCount: liveVideos.length,
          mindmapsCount: mindmaps.length,
          blogPostsCount: blogPosts.length,
          commentsCount: comments.length,
          recentAdded7d: hasCreatedAt ? totalRecent7d : null,
        });
        setError(null);
        setState("ready");
        logger.info("Loaded admin overview metrics", {
          projects: projects.length,
          liveVideos: liveVideos.length,
          mindmaps: mindmaps.length,
          blogPosts: blogPosts.length,
          comments: comments.length,
          recentAdded7d: hasCreatedAt ? totalRecent7d : null,
        });
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load overview metrics.";
        setError(message);
        setState("error");
        logger.error("Failed to load admin overview metrics", err);
      });
  }, [api, isConfigured, token]);

  useEffect(() => {
    if (!isConfigured) {
      setTodos([]);
      setTodoState("ready");
      setTodoError(null);
      return;
    }

    setTodoState("loading");
    setTodoError(null);
    logger.info("Loading admin todos");
    fetchTodos()
      .then((data) => {
        setTodos(data);
        setTodoState("ready");
        logger.info("Loaded admin todos", { count: data.length });
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load todos.";
        setTodoError(message);
        setTodoState("error");
        logger.error("Failed to load admin todos", err);
      });
  }, [isConfigured]);

  const filteredTodos = useMemo(() => {
    const base = todos.filter((todo) => {
      if (todoFilter === "all") {
        return true;
      }
      if (todoFilter === "active") {
        return !todo.done;
      }
      return todo.done;
    });

    return [...base].sort((a, b) => {
      if (a.done !== b.done) {
        return a.done ? 1 : -1;
      }

      const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const aCreatedAt = a.createdAt ? Date.parse(a.createdAt) : NaN;
      const bCreatedAt = b.createdAt ? Date.parse(b.createdAt) : NaN;
      if (!Number.isNaN(aCreatedAt) && !Number.isNaN(bCreatedAt)) {
        return bCreatedAt - aCreatedAt;
      }

      return b.id - a.id;
    });
  }, [todos, todoFilter]);

  const todoStats = useMemo(() => ({
    total: todos.length,
    active: todos.filter((todo) => !todo.done).length,
    done: todos.filter((todo) => todo.done).length,
  }), [todos]);

  const handleAddTodo = async () => {
    const title = todoTitle.trim();
    if (!title) {
      return;
    }

    setTodoSubmitting(true);
    setTodoError(null);
    try {
      const created = await createTodo({
        title,
        priority: todoPriority,
        dueDate: todoDueDate || null,
      });
      setTodos((prev) => [created, ...prev]);
      setTodoTitle("");
      setTodoPriority("medium");
      setTodoDueDate("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create todo.";
      setTodoError(message);
      logger.error("Failed to create todo", err);
    } finally {
      setTodoSubmitting(false);
    }
  };

  const toggleTodo = async (id: number) => {
    const target = todos.find((todo) => todo.id === id);
    if (!target) {
      return;
    }
    const nextDone = !target.done;
    setTodoError(null);
    setTodoUpdatingId(id);
    setTodos((prev) => prev.map((todo) => (
      todo.id === id ? { ...todo, done: nextDone } : todo
    )));
    try {
      const updated = await updateTodo(id, { done: nextDone });
      setTodos((prev) => prev.map((todo) => (
        todo.id === id ? { ...todo, ...updated } : todo
      )));
    } catch (err) {
      setTodos((prev) => prev.map((todo) => (
        todo.id === id ? { ...todo, done: target.done } : todo
      )));
      const message = err instanceof Error ? err.message : "Failed to update todo.";
      setTodoError(message);
      logger.error("Failed to update todo", err);
    } finally {
      setTodoUpdatingId(null);
    }
  };

  const removeTodo = async (id: number) => {
    const snapshot = todos;
    setTodoError(null);
    setTodoDeletingId(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    try {
      await deleteTodo(id);
    } catch (err) {
      setTodos(snapshot);
      const message = err instanceof Error ? err.message : "Failed to delete todo.";
      setTodoError(message);
      logger.error("Failed to delete todo", err);
    } finally {
      setTodoDeletingId(null);
    }
  };

  const contentTotal = metrics.projectsCount + metrics.liveVideosCount + metrics.mindmapsCount + metrics.blogPostsCount;

  return (
    <div className="admin-grid">
      <section className="admin-panel">
        <div className="admin-panel-title">Today</div>
        <div className="admin-panel-body">
          {!isConfigured ? (
            <div className="small">
              Set <code>VITE_ADMIN_API_URL</code> to load live metrics.
            </div>
          ) : null}
          {state === "error" && error ? <div className="form-status error">{error}</div> : null}

          <NavLink to="/admin/content" className="admin-metric admin-metric-link">
            <div className="admin-metric-label">Projects</div>
            <div className="admin-metric-value">{metrics.projectsCount}</div>
          </NavLink>

          <NavLink to="/admin/content" className="admin-metric admin-metric-link">
            <div className="admin-metric-label">Live Videos</div>
            <div className="admin-metric-value">{metrics.liveVideosCount}</div>
          </NavLink>

          <NavLink to="/admin/content" className="admin-metric admin-metric-link">
            <div className="admin-metric-label">Mindmaps</div>
            <div className="admin-metric-value">{metrics.mindmapsCount}</div>
          </NavLink>

          <NavLink to="/admin/content" className="admin-metric admin-metric-link">
            <div className="admin-metric-label">Blog Posts</div>
            <div className="admin-metric-value">{metrics.blogPostsCount}</div>
          </NavLink>

          <NavLink to="/admin/comments" className="admin-metric admin-metric-link">
            <div className="admin-metric-label">Comments</div>
            <div className="admin-metric-value">{metrics.commentsCount}</div>
          </NavLink>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-title">Quick Links</div>
        <div className="admin-panel-body admin-quick-links">
          {adminNavItems.map((item) => (
            <NavLink key={item.href} to={item.href} className="admin-quick-card">
              <div className="admin-quick-title">{item.label}</div>
              <div className="admin-quick-desc">{item.description}</div>
            </NavLink>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-title">Recent</div>
        <div className="admin-panel-body">
          <NavLink to="/admin/content?sort=latest" className="admin-metric admin-metric-link">
            <div>
              <div className="admin-metric-label">New content in last 7 days</div>
              <div className="admin-metric-hint">Calculated from content `createdAt` fields.</div>
            </div>
            <div className="admin-metric-value">
              {metrics.recentAdded7d === null ? "N/A" : metrics.recentAdded7d}
            </div>
          </NavLink>
          {metrics.recentAdded7d === null ? (
            <div className="small">
              Add `createdAt` to projects/live videos/mindmaps/blog posts records to enable this metric.
            </div>
          ) : null}
          <div className="admin-metric admin-metric-static">
            <div className="admin-metric-label">Total content items</div>
            <div className="admin-metric-value">{contentTotal}</div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-title">My Todo</div>
        <div className="admin-panel-body admin-todo-body">
          <div className="admin-todo-form">
            <input
              className="input"
              type="text"
              value={todoTitle}
              placeholder="Add a task..."
              onChange={(event) => setTodoTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddTodo();
                }
              }}
            />
            <select
              className="input"
              value={todoPriority}
              onChange={(event) => setTodoPriority(event.target.value as TodoPriority)}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              className="input"
              type="date"
              value={todoDueDate}
              onChange={(event) => setTodoDueDate(event.target.value)}
            />
            <button type="button" className="button" onClick={handleAddTodo}>Add</button>
          </div>
          {todoState === "loading" ? <div className="small">Loading todos...</div> : null}
          {todoState === "error" && todoError ? <div className="form-status error">{todoError}</div> : null}
          {todoError && todoState !== "error" ? <div className="form-status error">{todoError}</div> : null}

          <div className="admin-todo-filters">
            <button
              type="button"
              className={["button", "ghost", todoFilter === "all" ? "is-active" : ""].filter(Boolean).join(" ")}
              onClick={() => setTodoFilter("all")}
            >
              All ({todoStats.total})
            </button>
            <button
              type="button"
              className={["button", "ghost", todoFilter === "active" ? "is-active" : ""].filter(Boolean).join(" ")}
              onClick={() => setTodoFilter("active")}
            >
              Active ({todoStats.active})
            </button>
            <button
              type="button"
              className={["button", "ghost", todoFilter === "done" ? "is-active" : ""].filter(Boolean).join(" ")}
              onClick={() => setTodoFilter("done")}
            >
              Done ({todoStats.done})
            </button>
          </div>

          <div className="admin-todo-list">
            {filteredTodos.map((todo) => (
              <div key={todo.id} className={["admin-todo-item", todo.done ? "is-done" : ""].filter(Boolean).join(" ")}>
                <label className="admin-todo-main">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    disabled={todoUpdatingId === todo.id}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span>{todo.title}</span>
                </label>
                <div className="admin-todo-meta">
                  <span className={["admin-todo-priority", `is-${todo.priority}`].join(" ")}>
                    {priorityLabel[todo.priority]}
                  </span>
                  {todo.dueDate ? <span className="small">Due {todo.dueDate}</span> : null}
                </div>
                <button
                  type="button"
                  className="button ghost"
                  disabled={todoDeletingId === todo.id || todoSubmitting}
                  onClick={() => removeTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))}
            {filteredTodos.length === 0 ? (
              <div className="small">No tasks in this view.</div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
