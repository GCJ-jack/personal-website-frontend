import { useState } from "react";
import { Page } from "../../components/shared/Page";

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

export function BlogPage() {
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");
  const [lastSubscriberId, setLastSubscriberId] = useState<string | null>(null);

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
      return;
    }

    try {
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
      } else {
        setSubscribeStatus("error");
      }
    } catch {
      setSubscribeStatus("error");
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
          <p className="small">No posts yet.</p>
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
