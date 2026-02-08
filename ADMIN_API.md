# Admin API & Data Contracts

This document describes the optional backend APIs used to drive page data.
If an API URL is not provided, the site falls back to local `src/data/*.ts`.

## Environment Variables

Create a `.env` file (or `.env.local`) in the project root:

```
VITE_PROJECTS_API_URL=https://your-domain.com/api/projects
VITE_STUDY_API_URL=https://your-domain.com/api/mindmaps
VITE_LIVE_API_URL=https://your-domain.com/api/live-videos
VITE_BLOG_API_URL=https://your-domain.com/api/blog-posts
VITE_COMMENTS_API_URL=https://your-domain.com/api/comments
VITE_SUBSCRIBE_API_URL=https://your-domain.com/api/subscribers
```

## Projects Page

**Endpoint**: `GET /api/projects`

**Response (JSON)**
```
[
  {
    "id": "project-01",
    "name": "Project Name",
    "summary": "One-line summary.",
    "stack": ["Java", "Spring", "MySQL"],
    "cover": "/projects/project-01.jpg",
    "highlights": ["Highlight 1", "Highlight 2"],
    "date": "2024",
    "links": [
      { "label": "GitHub", "href": "https://github.com/yourname/project" },
      { "label": "Docs", "href": "https://your-docs-link" }
    ]
  }
]
```

## Study Notes Page (Mindmaps)

**Endpoint**: `GET /api/mindmaps`

**Response (JSON)**
```
[
  {
    "id": "java-concurrency",
    "title": "Java Concurrency",
    "summary": "Thread model, JUC, locks, and patterns.",
    "tags": ["Java", "JUC"],
    "file": "/mindmaps/java-concurrency.pdf",
    "updatedAt": "2025-12-01"
  }
]
```

## Live Page (Videos)

**Endpoint**: `GET /api/live-videos`

**Response (JSON)**
```
[
  {
    "id": "live-01",
    "title": "Live Show Title",
    "date": "2024-06-18",
    "description": "Show notes or location.",
    "file": "/live/01.mp4",
    "cover": "/live/01.jpg"
  }
]
```

## Blog Page (Diary Posts)

**Endpoint**: `GET /api/blog-posts`

**Response (JSON)**
```
[
  {
    "id": "blog-01",
    "title": "关于我在这个网页的第一个 blog",
    "date": "2024-06-18",
    "cover": "/blog/diary-01.jpg",
    "content": [
      "这是我在这个平台上写下的第一篇博客。",
      "我总觉得心有不甘似乎在自己的大学生涯里没有尝试什么新东西。",
      "今天的记录都到此为止。"
    ],
    "tags": ["Diary"]
  }
]
```

## Blog Comments (Per Post)

**Endpoint**: `POST /api/comments`

**Request (JSON)**
```
{
  "postId": "blog-01",
  "name": "Your Name",
  "email": "you@example.com",
  "message": "Your message here."
}
```

**Response (JSON)**
```
{
  "ok": true,
  "id": "comment-123",
  "createdAt": "2026-02-08T12:00:00Z"
}
```

**Error (JSON)**
```
{
  "ok": false,
  "error": "ValidationError",
  "message": "Email is invalid."
}
```

## Email Subscription

**Endpoint**: `POST /api/subscribers`

**Request (JSON)**
```
{
  "email": "you@example.com",
  "source": "blog"
}
```

**Response (JSON)**
```
{
  "ok": true,
  "id": "subscriber-456",
  "createdAt": "2026-02-08T12:00:00Z"
}
```

**Error (JSON)**
```
{
  "ok": false,
  "error": "AlreadySubscribed",
  "message": "Email already subscribed."
}
```

## Notes

- `cover` and `file` paths can be served from your backend or a CDN.
- If you host assets in `public/`, use absolute paths like `/live/01.mp4`.
- The frontend expects an array. If your API returns `{ data: [...] }`,
  you will need to adjust the fetch logic accordingly.
