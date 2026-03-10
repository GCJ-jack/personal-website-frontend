import { useCallback, useEffect, useState } from "react";
import { Page } from "../../components/shared/Page";
import { createLogger } from "../../lib/logger";

type PublicBlogPost = {
  id: string;
  slug?: string;
  title: string;
  date?: string | null;
  coverUrl?: string;
  cover?: string;
  excerpt?: string;
  content?: string[];
  tags?: string[];
  status?: string;
};

type PublicBlogListResponse = {
  ok: boolean;
  data?: PublicBlogPost[];
  error?: string | null;
  message?: string | null;
};

type PublicComment = {
  id: string | number;
  postId: string | number;
  parentId?: string | number | null;
  name: string;
  websiteUrl?: string | null;
  message: string;
  createdAt: string | null;
  adminReply?: boolean;
  replies?: PublicComment[];
};

type PublicCommentListResponse = {
  ok: boolean;
  data?: PublicComment[];
  error?: string | null;
  message?: string | null;
};

type SubscribeCreateResponse = {
  ok: boolean;
  id?: string;
  numericId?: number;
  createdAt?: string | null;
  error?: string | null;
  message?: string | null;
};

type PublicCommentCreateResponse = {
  ok: boolean;
  id?: string;
  numericId?: number;
  createdAt?: string | null;
  error?: string | null;
  message?: string | null;
};

type CommentSubmitState = "idle" | "submitting" | "success" | "error";

function resolveSubscriberId(payload: SubscribeCreateResponse) {
  if (payload.id) {
    return payload.id;
  }
  if (typeof payload.numericId === "number") {
    return `subscriber-${payload.numericId}`;
  }
  return null;
}

function normalizePosts(payload: PublicBlogListResponse | PublicBlogPost[]) {
  return Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : []);
}

function normalizeComment(comment: PublicComment): PublicComment {
  return {
    ...comment,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map((reply) => normalizeComment(reply))
      : [],
  };
}

function normalizeComments(payload: PublicCommentListResponse | PublicComment[]) {
  const list = Array.isArray(payload) ? payload : payload.data;
  return Array.isArray(list) ? list.map((comment) => normalizeComment(comment)) : [];
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

function ensureApiOk(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object" || !("ok" in payload)) {
    return;
  }
  const value = payload as { ok?: unknown };
  if (value.ok === false) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }
}

function buildCommentsUrl(baseUrl: string, postId: string | number) {
  const delimiter = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${delimiter}postId=${encodeURIComponent(String(postId))}`;
}

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

function PublicCommentItem({
  postId,
  comment,
  depth = 0,
  parentId,
  parentName,
  onReply,
}: {
  postId: string;
  comment: PublicComment;
  depth?: number;
  parentId?: string | number | null;
  parentName?: string;
  onReply: (postId: string, parentId: string | number, parentName: string) => void;
}) {
  const replies = comment.replies ?? [];
  const safeWebsiteUrl = toSafeHttpUrl(comment.websiteUrl);

  return (
    <div className="stack" style={{ marginLeft: `${depth * 16}px` }}>
      <article id={`comment-${String(comment.id)}`} className="card stack">
        <div className="small">
          {safeWebsiteUrl ? (
            <a href={safeWebsiteUrl} target="_blank" rel="noreferrer">
              {comment.name}
            </a>
          ) : (
            comment.name
          )}
          {comment.adminReply ? " · Admin Reply" : ""}
          {comment.createdAt ? ` · ${formatDateTime(comment.createdAt)}` : ""}
        </div>
        {parentId !== null && parentId !== undefined && parentName ? (
          <div className="small">
            Replying to{" "}
            <a href={`#comment-${String(parentId)}`}>
              @{parentName}
            </a>
          </div>
        ) : null}
        <p>{comment.message}</p>
        <div>
          <button
            className="button ghost"
            type="button"
            onClick={() => onReply(postId, comment.id, comment.name)}
          >
            Reply
          </button>
        </div>
      </article>
      {replies.map((reply) => (
        <PublicCommentItem
          key={String(reply.id)}
          postId={postId}
          comment={reply}
          depth={depth + 1}
          parentId={comment.id}
          parentName={comment.name}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

const logger = createLogger("BlogPage");

export function BlogPage() {
  const [postsState, setPostsState] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [commentsState, setCommentsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, PublicComment[]>>({});
  const [commentSubmitStateByPostId, setCommentSubmitStateByPostId] = useState<Record<string, CommentSubmitState>>({});
  const [commentSubmitMessageByPostId, setCommentSubmitMessageByPostId] = useState<Record<string, string>>({});
  const [replyTargetByPostId, setReplyTargetByPostId] = useState<
    Record<string, { parentId: string | number; parentName: string } | null>
  >({});
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");
  const [lastSubscriberId, setLastSubscriberId] = useState<string | null>(null);
  const commentsApiUrl = (import.meta.env.VITE_COMMENTS_API_URL as string | undefined) ?? "/api/comments";

  const fetchCommentsForPost = useCallback(async (postId: string | number) => {
    const response = await fetch(buildCommentsUrl(commentsApiUrl, postId), { method: "GET" });
    if (!response.ok) {
      throw new Error(`Failed comments request for post ${String(postId)}: ${response.status}`);
    }
    const payload = (await response.json().catch(() => null)) as PublicCommentListResponse | PublicComment[] | null;
    if (!payload) {
      throw new Error("Failed to load comments.");
    }
    ensureApiOk(payload, "Failed to load comments.");
    return normalizeComments(payload);
  }, [commentsApiUrl]);

  useEffect(() => {
    const apiUrl = (import.meta.env.VITE_BLOG_API_URL as string | undefined) ?? "/api/blog-posts";
    logger.info("Loading public blog posts", { apiUrl });

    fetch(apiUrl, { method: "GET" })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((payload: PublicBlogListResponse | PublicBlogPost[]) => {
        ensureApiOk(payload, "Failed to load posts.");
        const data = normalizePosts(payload);
        setPosts(Array.isArray(data) ? data : []);
        setPostsState("ready");
        logger.info("Loaded public blog posts", { count: Array.isArray(data) ? data.length : 0 });
      })
      .catch((err) => {
        setPostsState("error");
        logger.warn("Failed to load public blog posts", err);
      });
  }, []);

  useEffect(() => {
    if (postsState !== "ready") {
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) {
        return;
      }

      if (posts.length === 0) {
        setCommentsByPostId({});
        setCommentsError(null);
        setCommentsState("ready");
        return;
      }

      setCommentsState("loading");
      setCommentsError(null);
      logger.info("Loading public comments", { apiUrl: commentsApiUrl, postCount: posts.length });

      Promise.allSettled(
        posts.map(async (post) => {
          return {
            postId: String(post.id),
            comments: await fetchCommentsForPost(post.id),
          };
        }),
      )
        .then((results) => {
          if (!active) {
            return;
          }

          const next: Record<string, PublicComment[]> = {};
          let failedCount = 0;

          results.forEach((result) => {
            if (result.status === "fulfilled") {
              next[result.value.postId] = result.value.comments;
              return;
            }
            failedCount += 1;
            logger.warn("Failed to load comments for one post", result.reason);
          });

          setCommentsByPostId(next);
          if (failedCount > 0) {
            setCommentsError(`Failed to load comments for ${failedCount} post(s).`);
            setCommentsState(Object.keys(next).length > 0 ? "ready" : "error");
            return;
          }

          setCommentsState("ready");
          logger.info("Loaded public comments", { postCount: Object.keys(next).length });
        })
        .catch((err) => {
          if (!active) {
            return;
          }
          setCommentsState("error");
          setCommentsError("Failed to load comments.");
          logger.error("Failed to load public comments", err);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [posts, postsState, commentsApiUrl, fetchCommentsForPost]);

  const handleStartReply = useCallback((postId: string, parentId: string | number, parentName: string) => {
    setReplyTargetByPostId((prev) => ({
      ...prev,
      [postId]: { parentId, parentName },
    }));
  }, []);

  const handleCancelReply = useCallback((postId: string) => {
    setReplyTargetByPostId((prev) => ({
      ...prev,
      [postId]: null,
    }));
  }, []);

  const handleCommentSubmit = async (postId: string, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const notifyReply = formData.get("notifyReply") === "on";
    const replyTarget = replyTargetByPostId[postId] ?? null;

    if (!name || !message) {
      setCommentSubmitStateByPostId((prev) => ({ ...prev, [postId]: "error" }));
      setCommentSubmitMessageByPostId((prev) => ({ ...prev, [postId]: "Name and message are required." }));
      return;
    }

    setCommentSubmitStateByPostId((prev) => ({ ...prev, [postId]: "submitting" }));
    setCommentSubmitMessageByPostId((prev) => ({ ...prev, [postId]: "" }));

    try {
      const response = await fetch(commentsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          parentId: replyTarget ? replyTarget.parentId : null,
          name,
          email: email || undefined,
          websiteUrl: websiteUrl || undefined,
          message,
          notifyReply,
        }),
      });

      if (!response.ok) {
        setCommentSubmitStateByPostId((prev) => ({ ...prev, [postId]: "error" }));
        setCommentSubmitMessageByPostId((prev) => ({ ...prev, [postId]: "Failed to submit comment." }));
        logger.warn("Submit comment failed", { postId, status: response.status });
        return;
      }

      const createdPayload = (await response.json().catch(() => null)) as PublicCommentCreateResponse | null;
      ensureApiOk(createdPayload, "Failed to submit comment.");
      if (createdPayload?.numericId !== undefined) {
        logger.info("Comment created with numericId", { postId, numericId: createdPayload.numericId });
      }

      const comments = await fetchCommentsForPost(postId);
      setCommentsByPostId((prev) => ({ ...prev, [postId]: comments }));
      setCommentSubmitStateByPostId((prev) => ({ ...prev, [postId]: "success" }));
      setCommentSubmitMessageByPostId((prev) => ({ ...prev, [postId]: "Comment submitted." }));
      setReplyTargetByPostId((prev) => ({ ...prev, [postId]: null }));
      form.reset();
      logger.info("Submit comment succeeded", { postId });
    } catch (err) {
      const errorMessage = err instanceof Error && err.message ? err.message : "Failed to submit comment.";
      setCommentSubmitStateByPostId((prev) => ({ ...prev, [postId]: "error" }));
      setCommentSubmitMessageByPostId((prev) => ({ ...prev, [postId]: errorMessage }));
      logger.error("Submit comment exception", { postId, err });
    }
  };

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribeStatus("idle");
    setLastSubscriberId(null);

    const form = event.currentTarget;
    const emailInput = form.querySelector<HTMLInputElement>("input[name=\"email\"]");
    const email = emailInput?.value ?? "";

    const apiUrl = import.meta.env.VITE_SUBSCRIBE_API_URL as string | undefined;
    if (!apiUrl) {
      setSubscribeStatus("error");
      logger.warn("Subscribe API URL is not configured");
      return;
    }

    try {
      logger.info("Submitting subscribe request");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: "blog" }),
      });

      if (response.ok) {
        const payload = (await response.json().catch(() => null)) as SubscribeCreateResponse | null;
        ensureApiOk(payload, "Subscription failed. Try again.");
        if (payload?.ok) {
          setLastSubscriberId(resolveSubscriberId(payload));
        }
        setSubscribeStatus("success");
        form.reset();
        logger.info("Subscribe request succeeded");
      } else {
        setSubscribeStatus("error");
        logger.warn("Subscribe request failed", { status: response.status });
      }
    } catch (err) {
      setSubscribeStatus("error");
      logger.error("Subscribe request exception", err);
    }
  };

  return (
    <Page
      title="Blog"
      subtitle="Diary & reflections"
      intro="Personal notes, memories, and small moments."
    >
      <section>
        <div className="card stack">
          <h2>Posts</h2>
          {postsState === "loading" ? <p className="small">Loading posts...</p> : null}
          {postsState === "error" ? (
            <p className="form-status error">Failed to load posts.</p>
          ) : null}
          {postsState === "ready" && posts.length === 0 ? (
            <p className="small">No posts yet.</p>
          ) : null}
          {posts.map((post) => (
            <article key={post.id} className="card stack">
              {post.coverUrl || post.cover ? (
                <img
                  src={post.coverUrl ?? post.cover}
                  alt={`${post.title} cover`}
                  className="blog-post-cover"
                />
              ) : null}
              <div className="small">{post.date ?? ""}</div>
              <h3>{post.title}</h3>
              {post.excerpt ? (
                <p>{post.excerpt}</p>
              ) : post.content?.length ? (
                <p>{post.content[0]}</p>
              ) : null}
              {post.tags?.length ? (
                <div className="tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <section className="comment-box stack">
                <h4>Comments</h4>
                {commentsState === "loading" ? <p className="small">Loading comments...</p> : null}
                {commentsState === "error" ? (
                  <p className="form-status error">Failed to load comments.</p>
                ) : null}
                {commentsError && commentsState === "ready" ? (
                  <p className="small">{commentsError}</p>
                ) : null}
                {commentsState === "ready" && (commentsByPostId[String(post.id)] ?? []).length === 0 ? (
                  <p className="small">No comments yet.</p>
                ) : null}
                {(commentsByPostId[String(post.id)] ?? []).map((comment) => (
                  <PublicCommentItem
                    key={String(comment.id)}
                    postId={String(post.id)}
                    comment={comment}
                    onReply={handleStartReply}
                  />
                ))}
                <form className="form" onSubmit={(event) => void handleCommentSubmit(String(post.id), event)}>
                  {replyTargetByPostId[String(post.id)] ? (
                    <div className="card" style={{ marginBottom: "8px" }}>
                      <div className="small">
                        Replying to @{replyTargetByPostId[String(post.id)]?.parentName}
                      </div>
                      <div style={{ marginTop: "8px" }}>
                        <button
                          className="button ghost"
                          type="button"
                          onClick={() => handleCancelReply(String(post.id))}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <label className="form-field">
                    <span>Name</span>
                    <input name="name" type="text" placeholder="Your name" required />
                  </label>
                  <label className="form-field">
                    <span>Email (optional)</span>
                    <input name="email" type="email" placeholder="you@example.com" />
                  </label>
                  <label className="form-field">
                    <span>Website (optional)</span>
                    <input name="websiteUrl" type="url" placeholder="https://example.com" />
                  </label>
                  <label className="form-field">
                    <span>Message</span>
                    <textarea name="message" rows={4} placeholder="Write your comment..." required />
                  </label>
                  <label className="small">
                    <input name="notifyReply" type="checkbox" /> Notify me about replies
                  </label>
                  <button
                    className="button"
                    type="submit"
                    disabled={commentSubmitStateByPostId[String(post.id)] === "submitting"}
                  >
                    {commentSubmitStateByPostId[String(post.id)] === "submitting" ? "Submitting..." : "Leave Comment"}
                  </button>
                  {commentSubmitStateByPostId[String(post.id)] === "success" ? (
                    <div className="form-status success">
                      {commentSubmitMessageByPostId[String(post.id)] || "Comment submitted."}
                    </div>
                  ) : null}
                  {commentSubmitStateByPostId[String(post.id)] === "error" ? (
                    <div className="form-status error">
                      {commentSubmitMessageByPostId[String(post.id)] || "Failed to submit comment."}
                    </div>
                  ) : null}
                </form>
              </section>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="card stack">
          <h2>Subscribe</h2>
          <p className="small">Get updates when new posts are published.</p>
          <form
            className="form"
            onSubmit={handleSubscribe}
          >
            <label className="form-field">
              <span>Email</span>
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>
            <button className="button" type="submit">Subscribe</button>
            {subscribeStatus === "success" ? (
              <div className="form-status success">
                Subscribed successfully.
                {lastSubscriberId ? ` ID: ${lastSubscriberId}` : ""}
              </div>
            ) : null}
            {subscribeStatus === "error" ? (
              <div className="form-status error">Subscription failed. Try again.</div>
            ) : null}
          </form>
        </div>
      </section>
    </Page>
  );
}
