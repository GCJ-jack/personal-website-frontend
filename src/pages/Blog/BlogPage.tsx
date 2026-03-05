import { useEffect, useState } from "react";
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
  ok: true;
  data: PublicBlogPost[];
};

type SubscribeCreateResponse = {
  ok: true;
  id?: string;
  numericId?: number;
  createdAt: string;
};

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
  return Array.isArray(payload) ? payload : payload.data;
}

const logger = createLogger("BlogPage");

export function BlogPage() {
  const [postsState, setPostsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");
  const [lastSubscriberId, setLastSubscriberId] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = (import.meta.env.VITE_BLOG_API_URL as string | undefined) ?? "/api/blog-posts";
    logger.info("Loading public blog posts", { apiUrl });
    setPostsState("loading");

    fetch(apiUrl, { method: "GET" })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((payload: PublicBlogListResponse | PublicBlogPost[]) => {
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
