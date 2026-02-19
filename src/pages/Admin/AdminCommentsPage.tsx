import { useEffect, useMemo, useState } from "react";
import { createAdminContentApi, type AdminComment } from "../../app/admin/data/adminContentApi";
import { useAdminAuth } from "../../app/admin/auth/useAdminAuth";

type LoadState = "idle" | "loading" | "ready" | "error";

export function AdminCommentsPage() {
  const { token, isConfigured } = useAdminAuth();
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  const api = useMemo(() => (apiUrl ? createAdminContentApi(apiUrl) : null), [apiUrl]);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<AdminComment[]>([]);

  useEffect(() => {
    if (!api || !isConfigured) {
      return;
    }

    setState("loading");
    api
      .listComments(token)
      .then((data) => {
        setComments(data);
        setState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load comments.");
        setState("error");
      });
  }, [api, isConfigured, token]);

  if (!isConfigured) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-title">Admin API not configured</div>
        <div className="admin-panel-body">
          <p className="small">
            Set <code>VITE_ADMIN_API_URL</code> to enable admin comments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Comments</div>
          <div className="admin-section-summary">
            Read all public blog comments from the admin interface.
          </div>
        </div>
      </div>

      <section className="admin-panel admin-section-panel">
        <div className="admin-panel-title">All Comments</div>
        <div className="admin-panel-body">
          {state === "loading" ? <div className="small">Loading...</div> : null}
          {state === "error" && error ? <div className="form-status error">{error}</div> : null}

          <div className="admin-table">
            {comments.map((comment) => (
              <div key={comment.id} className="admin-row">
                <div>
                  <div className="admin-row-title">{comment.name} ({comment.email})</div>
                  <div className="small">Post: {comment.postId}</div>
                  <div className="small">At: {comment.createdAt}</div>
                  <div>{comment.message}</div>
                </div>
              </div>
            ))}
            {comments.length === 0 && state === "ready" ? (
              <div className="small">No comments yet.</div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
