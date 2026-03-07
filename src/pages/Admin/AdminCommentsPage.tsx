import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdminContentApi, type AdminComment } from "../../app/admin/data/adminContentApi";
import { useAdminAuth } from "../../app/admin/auth/useAdminAuth";
import type { AdminApiError } from "../../app/admin/http/adminHttp";
import { createLogger } from "../../lib/logger";

type LoadState = "idle" | "loading" | "ready" | "error";
type ReplySubmitState = "idle" | "submitting" | "success" | "error";
const logger = createLogger("AdminCommentsPage");

function formatDateTime(value?: string | null) {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function toSafeHttpUrl(value?: string | null) {
  const candidate = String(value ?? "").trim();
  if (!candidate) {
    return null;
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function normalizeAdminComment(comment: AdminComment): AdminComment {
  return {
    ...comment,
    createdAt: comment.createdAt ?? null,
    adminReply: comment.adminReply ?? comment.isAdminReply ?? false,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map((reply) => normalizeAdminComment(reply))
      : [],
  };
}

function appendReplyToTree(
  comments: AdminComment[],
  targetId: string | number,
  reply: AdminComment,
): { next: AdminComment[]; inserted: boolean } {
  let inserted = false;
  const next = comments.map((item) => {
    if (String(item.id) === String(targetId)) {
      inserted = true;
      return {
        ...item,
        replies: [...(item.replies ?? []), reply],
      };
    }

    const childResult = appendReplyToTree(item.replies ?? [], targetId, reply);
    if (childResult.inserted) {
      inserted = true;
      return {
        ...item,
        replies: childResult.next,
      };
    }

    return item;
  });

  return { next: inserted ? next : comments, inserted };
}

function getRequestErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "details" in err) {
    const details = (err as { details?: AdminApiError }).details;
    if (details?.message) {
      return details.message;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

function getRequestStatus(err: unknown): number | null {
  if (!err || typeof err !== "object" || !("details" in err)) {
    return null;
  }
  const details = (err as { details?: AdminApiError }).details;
  return typeof details?.status === "number" ? details.status : null;
}

function AdminReplyComposer({
  value,
  submitState,
  error,
  onChange,
  onCancel,
  onSubmit,
}: {
  value: string;
  submitState: ReplySubmitState;
  error: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="stack card" style={{ marginTop: "8px" }}>
      <label className="form-field">
        <span>Reply Message</span>
        <textarea
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write your admin reply..."
          disabled={submitState === "submitting"}
        />
      </label>
      <div className="card-actions">
        <button
          className="button ghost"
          type="button"
          onClick={onCancel}
          disabled={submitState === "submitting"}
        >
          Cancel
        </button>
        <button
          className="button"
          type="button"
          onClick={onSubmit}
          disabled={submitState === "submitting"}
        >
          {submitState === "submitting" ? "Submitting..." : "Submit Reply"}
        </button>
      </div>
      {submitState === "error" && error ? (
        <div className="form-status error">{error}</div>
      ) : null}
      {submitState === "success" ? (
        <div className="form-status success">Reply submitted.</div>
      ) : null}
    </div>
  );
}

type AdminCommentItemProps = {
  comment: AdminComment;
  depth?: number;
  activeReplyId: string | null;
  replyDraftById: Record<string, string>;
  replySubmitStateById: Record<string, ReplySubmitState>;
  replyErrorById: Record<string, string>;
  onStartReply: (id: string | number) => void;
  onCancelReply: () => void;
  onChangeReply: (id: string | number, value: string) => void;
  onSubmitReply: (id: string | number) => void;
};

function AdminCommentItem({
  comment,
  depth = 0,
  activeReplyId,
  replyDraftById,
  replySubmitStateById,
  replyErrorById,
  onStartReply,
  onCancelReply,
  onChangeReply,
  onSubmitReply,
}: AdminCommentItemProps) {
  const replies = comment.replies ?? [];
  const safeWebsiteUrl = toSafeHttpUrl(comment.websiteUrl);
  const commentId = String(comment.id);
  const isReplying = activeReplyId === commentId;
  const submitState = replySubmitStateById[commentId] ?? "idle";
  const replyDraft = replyDraftById[commentId] ?? "";
  const replyError = replyErrorById[commentId] ?? "";

  return (
    <div className="stack" style={{ marginLeft: `${depth * 16}px` }}>
      <div className="admin-row">
        <div>
          <div className="admin-row-title">
            {comment.name}
            {comment.email ? ` (${comment.email})` : ""}
            {comment.adminReply ? " · Admin Reply" : ""}
          </div>
          <div className="small">Post: {String(comment.postId)}</div>
          {comment.parentId !== null && comment.parentId !== undefined ? (
            <div className="small">Parent: {String(comment.parentId)}</div>
          ) : null}
          {comment.status ? <div className="small">Status: {comment.status}</div> : null}
          {typeof comment.notifyReply === "boolean" ? (
            <div className="small">Notify Reply: {comment.notifyReply ? "Yes" : "No"}</div>
          ) : null}
          {comment.websiteUrl ? (
            <div className="small">
              Website:{" "}
              {safeWebsiteUrl ? (
                <a href={safeWebsiteUrl} target="_blank" rel="noreferrer">
                  {comment.websiteUrl}
                </a>
              ) : (
                "Invalid URL"
              )}
            </div>
          ) : null}
          <div className="small">Created: {formatDateTime(comment.createdAt) || "-"}</div>
          {comment.repliedAt ? (
            <div className="small">Replied: {formatDateTime(comment.repliedAt)}</div>
          ) : null}
          <div>{comment.message}</div>
          <div className="admin-row-actions" style={{ marginTop: "8px" }}>
            {isReplying ? (
              <button
                className="button ghost"
                type="button"
                onClick={onCancelReply}
                disabled={submitState === "submitting"}
              >
                Hide Reply Box
              </button>
            ) : (
              <button
                className="button ghost"
                type="button"
                onClick={() => onStartReply(comment.id)}
              >
                Reply
              </button>
            )}
          </div>
          {isReplying ? (
            <AdminReplyComposer
              value={replyDraft}
              submitState={submitState}
              error={replyError}
              onChange={(value) => onChangeReply(comment.id, value)}
              onCancel={onCancelReply}
              onSubmit={() => onSubmitReply(comment.id)}
            />
          ) : null}
        </div>
      </div>
      {replies.map((reply) => (
        <AdminCommentItem
          key={String(reply.id)}
          comment={reply}
          depth={depth + 1}
          activeReplyId={activeReplyId}
          replyDraftById={replyDraftById}
          replySubmitStateById={replySubmitStateById}
          replyErrorById={replyErrorById}
          onStartReply={onStartReply}
          onCancelReply={onCancelReply}
          onChangeReply={onChangeReply}
          onSubmitReply={onSubmitReply}
        />
      ))}
    </div>
  );
}

export function AdminCommentsPage() {
  const { token, isConfigured, logout } = useAdminAuth();
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  const api = useMemo(() => (apiUrl ? createAdminContentApi(apiUrl) : null), [apiUrl]);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyDraftById, setReplyDraftById] = useState<Record<string, string>>({});
  const [replySubmitStateById, setReplySubmitStateById] = useState<Record<string, ReplySubmitState>>({});
  const [replyErrorById, setReplyErrorById] = useState<Record<string, string>>({});

  const loadComments = useCallback(async () => {
    if (!api || !isConfigured) {
      return;
    }

    setState("loading");
    setError(null);
    logger.info("Loading admin comments");

    try {
      const data = await api.listComments(token);
      setComments(data.map((item) => normalizeAdminComment(item)));
      setState("ready");
      logger.info("Loaded admin comments", { count: data.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments.");
      setState("error");
      logger.error("Failed to load admin comments", err);
    }
  }, [api, isConfigured, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadComments();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadComments]);

  const handleSubmitReply = async (id: string | number) => {
    if (!api) {
      return;
    }

    const key = String(id);
    const message = (replyDraftById[key] ?? "").trim();

    if (!message) {
      setReplySubmitStateById((prev) => ({ ...prev, [key]: "error" }));
      setReplyErrorById((prev) => ({ ...prev, [key]: "reply message is required" }));
      return;
    }

    setReplySubmitStateById((prev) => ({ ...prev, [key]: "submitting" }));
    setReplyErrorById((prev) => ({ ...prev, [key]: "" }));

    try {
      const createdReply = normalizeAdminComment(
        await api.replyComment(id, { message }, token),
      );

      setComments((prev) => {
        const result = appendReplyToTree(prev, id, createdReply);
        return result.inserted ? result.next : prev;
      });
      setReplySubmitStateById((prev) => ({ ...prev, [key]: "success" }));
      setReplyDraftById((prev) => ({ ...prev, [key]: "" }));
      setActiveReplyId(null);
      logger.info("Reply submitted", { id });
    } catch (err) {
      const status = getRequestStatus(err);
      const messageText = getRequestErrorMessage(err, "Failed to submit reply.");
      setReplySubmitStateById((prev) => ({ ...prev, [key]: "error" }));
      setReplyErrorById((prev) => ({ ...prev, [key]: messageText }));
      logger.error("Reply failed", { id, status, message: messageText });

      if (status === 401) {
        await logout();
        return;
      }

      if (status === 400 && messageText.toLowerCase().includes("comment not found")) {
        await loadComments();
      }
    }
  };

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
              <AdminCommentItem
                key={String(comment.id)}
                comment={comment}
                activeReplyId={activeReplyId}
                replyDraftById={replyDraftById}
                replySubmitStateById={replySubmitStateById}
                replyErrorById={replyErrorById}
                onStartReply={(id) => {
                  const key = String(id);
                  setActiveReplyId(key);
                  setReplyErrorById((prev) => ({ ...prev, [key]: "" }));
                }}
                onCancelReply={() => setActiveReplyId(null)}
                onChangeReply={(id, value) => {
                  const key = String(id);
                  setReplyDraftById((prev) => ({ ...prev, [key]: value }));
                  if (replySubmitStateById[key] === "error") {
                    setReplySubmitStateById((prev) => ({ ...prev, [key]: "idle" }));
                    setReplyErrorById((prev) => ({ ...prev, [key]: "" }));
                  }
                }}
                onSubmitReply={(id) => {
                  void handleSubmitReply(id);
                }}
              />
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
