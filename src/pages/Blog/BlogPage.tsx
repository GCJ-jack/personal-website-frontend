import { useState } from "react";
import { Page } from "../../components/shared/Page";
import diaryPhoto from "../../assets/自拍.jpeg";

export function BlogPage() {
  const [messageStatus, setMessageStatus] = useState<"idle" | "success" | "error">("idle");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");

  const handleMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessageStatus("idle");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const postId = String(formData.get("postId") ?? "");
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");

    const apiUrl = import.meta.env.VITE_COMMENTS_API_URL as string | undefined;
    if (!apiUrl) {
      setMessageStatus("error");
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, name, email, message }),
      });

      if (response.ok) {
        setMessageStatus("success");
        form.reset();
      } else {
        setMessageStatus("error");
      }
    } catch {
      setMessageStatus("error");
    }
  };

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribeStatus("idle");

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
        <div className="stack">
          <h2>Posts</h2>
          <div className="card stack">
            <img src={diaryPhoto} alt="Diary photo" />
            <div className="small">18 June 2024</div>
            <h3>关于我在这个网页的第一个 blog</h3>
            <p>
              这是我在这个平台上写下的第一篇博客。上面的照片是两周前我在
              Tesco 超市购物时，顺便对着自助购物机器的摄像头拍下的。当时正值暑假来临，
              我将在这个暑假完成我研究生生涯的最后任务——毕业设计。这也是我作为学生的最后几个月，
              我正在准备找工作。
            </p>
            <p>
              我总觉得心有不甘似乎在自己的大学生涯里没有尝试什么新东西，自己内心深处好像是那个
              18 岁的孩子，但是无论和我的同龄人还有比我年轻的人相处我都是感觉的浑身不自在，我总是想把
              自己流放到东南亚的某一个孤岛，但是又总觉得自己要直面很多事情，要承担更多责任，我只能趁我还年轻
              多学，多试着走出我的舒适区。
            </p>
            <p>今天的记录都到此为止。</p>
            <div className="comment-box">
              <h4>Leave a Message</h4>
              <p className="small">Your message will be sent to my email.</p>
              <form
                className="form"
                onSubmit={handleMessage}
              >
                <input type="hidden" name="postId" value="blog-01" />
                <label className="form-field">
                  <span>Name</span>
                  <input name="name" type="text" placeholder="Your name" required />
                </label>
                <label className="form-field">
                  <span>Email</span>
                  <input name="email" type="email" placeholder="you@example.com" required />
                </label>
                <label className="form-field">
                  <span>Message</span>
                  <textarea name="message" rows={4} placeholder="Say hi..." required />
                </label>
                <button className="button" type="submit">Send</button>
                {messageStatus === "success" ? (
                  <div className="form-status success">Message sent. Thank you!</div>
                ) : null}
                {messageStatus === "error" ? (
                  <div className="form-status error">Failed to send. Please try again.</div>
                ) : null}
              </form>
            </div>
          </div>
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
              <div className="form-status success">Subscribed successfully.</div>
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
