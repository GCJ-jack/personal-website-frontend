# Admin API & Data Contracts

This document describes the optional backend APIs used to drive page data.
If an API URL is not provided, the site falls back to local `src/data/*.ts`.
Note: `/projects` no longer ships built-in demo items; without `VITE_PROJECTS_API_URL`,
the page will render an empty list.

## Environment Variables

Create a `.env` file (or `.env.local`) in the project root:

```
VITE_ADMIN_API_URL=https://your-domain.com/api/admin
VITE_ADMIN_UPLOAD_API_URL=https://your-domain.com/api/admin/upload
VITE_PROJECTS_API_URL=https://your-domain.com/api/projects
VITE_STUDY_API_URL=https://your-domain.com/api/mindmaps
VITE_LIVE_API_URL=https://your-domain.com/api/live-videos
VITE_BLOG_API_URL=https://your-domain.com/api/blog-posts
VITE_COMMENTS_API_URL=https://your-domain.com/api/comments
VITE_SUBSCRIBE_API_URL=https://your-domain.com/api/subscribers
```

## Admin Auth

**Base URL**: `VITE_ADMIN_API_URL`

The frontend uses `credentials: "include"` and treats cookie session as the primary
auth mechanism.

### Admin API Conventions

All admin endpoints should return JSON. Error responses should follow:
```
{
  "ok": false,
  "error": "ErrorCode",
  "message": "Human readable detail"
}
```

### Login

**Endpoint**: `POST /api/admin/auth/login`

**Request (JSON)**
```
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response (JSON)**
```
{
  "ok": true,
  "user": {
    "id": "admin-01",
    "name": "Site Admin",
    "email": "admin@example.com",
    "roles": ["admin"]
  },
  "expiresAt": "2026-02-08T12:00:00Z"
}
```

**Error (JSON)**
```
{
  "ok": false,
  "error": "InvalidCredentials",
  "message": "Email or password is incorrect."
}
```

### Session Check

**Endpoint**: `GET /api/admin/auth/session`

**Response (JSON)** same as Login.

### Logout

**Endpoint**: `POST /api/admin/auth/logout`

**Response (JSON)**
```
{
  "ok": true,
  "data": null,
  "error": null,
  "message": null
}
```

## Admin Content APIs

All endpoints below require admin auth (cookie session).
Responses use `{ ok: true, data: ... }` for objects/arrays, and errors use the shared
error format in the Admin API Conventions section.

### Media Upload

**Endpoint**: `POST /api/admin/upload`

**Auth**: required (same as other admin endpoints)

**Request**: `multipart/form-data`
- field: `file`
- field: `dir` (recommended): `projects` | `mindmaps` | `live`
- field: `source` (optional): alias of `dir`

**Response (JSON)**: return a URL/path that frontend can store in `cover`/`file`.
The frontend accepts any of these fields (root or nested under `data`):
- `url`
- `fileUrl`
- `path`
- `location`

Example:
```
{
  "ok": true,
  "data": {
    "url": "/uploads/2026/asset-001.jpg",
    "dir": "projects"
  }
}
```

### Projects

**List**: `GET /api/admin/projects`

**Create**: `POST /api/admin/projects`

**Update**: `PUT /api/admin/projects/:id`

**Delete**: `DELETE /api/admin/projects/:id`

**Project (JSON)**
```
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
```

### Live Videos

**List**: `GET /api/admin/live-videos`

**Create**: `POST /api/admin/live-videos`

**Update**: `PUT /api/admin/live-videos/:id`

**Delete**: `DELETE /api/admin/live-videos/:id`

**LiveVideo (JSON)**
```
{
  "id": "live-01",
  "title": "Live Show Title",
  "date": "2024-06-18",
  "description": "Show notes or location.",
  "file": "/live/01.mp4",
  "cover": "/live/01.jpg"
}
```

### Mindmaps

**List**: `GET /api/admin/mindmaps`

**Create**: `POST /api/admin/mindmaps`

**Update**: `PUT /api/admin/mindmaps/:id`

**Delete**: `DELETE /api/admin/mindmaps/:id`

**Mindmap (JSON)**
```
{
  "id": "java-concurrency",
  "title": "Java Concurrency",
  "summary": "Thread model, JUC, locks, and patterns.",
  "tags": ["Java", "JUC"],
  "file": "/mindmaps/java-concurrency.pdf",
  "updatedAt": "2025-12-01"
}
```

### Blog Posts

**List**: `GET /api/admin/blog-posts`

**Create**: `POST /api/admin/blog-posts`

**Update**: `PUT /api/admin/blog-posts/:id`

**Delete**: `DELETE /api/admin/blog-posts/:id`

**BlogPost (JSON)**
```
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
```

### Comments

**List**: `GET /api/admin/comments`

**Comment (JSON)**
```
{
  "id": "comment-123",
  "postId": 1,
  "name": "Your Name",
  "email": "you@example.com",
  "message": "Your message here.",
  "createdAt": "2026-02-08T12:00:00Z"
}
```

**Reply**: `POST /api/admin/comments/{id}/reply`

**Request (JSON)**
```
{
  "message": "感谢你的留言，我这边补充一下..."
}
```

**Response (JSON)**
```
{
  "ok": true,
  "data": {
    "id": 123,
    "postId": 10,
    "parentId": 99,
    "name": "Admin",
    "email": null,
    "websiteUrl": null,
    "message": "感谢你的留言，我这边补充一下...",
    "isAdminReply": true,
    "notifyReply": false,
    "status": "approved",
    "createdAt": null,
    "repliedAt": "2026-03-07T16:30:00"
  },
  "error": null,
  "message": null
}
```

**Error (JSON)**
```
{
  "ok": false,
  "data": null,
  "error": "ValidationError",
  "message": "reply message is required"
}
```

### Admin Overview (Dashboard)

Current frontend implementation reads live counts by calling:
- `GET /api/admin/projects`
- `GET /api/admin/live-videos`
- `GET /api/admin/mindmaps`
- `GET /api/admin/blog-posts`
- `GET /api/admin/comments`

and computes dashboard metrics in client side.

For backend optimization, you can provide a single aggregate endpoint:

**Overview**: `GET /api/admin/overview`

**Query params (optional)**
- `range`: `7d` | `30d` | `custom` (default `7d`)
- `start`: `YYYY-MM-DD` (required when `range=custom`)
- `end`: `YYYY-MM-DD` (required when `range=custom`)
- `tz`: IANA timezone, e.g. `Asia/Shanghai` (default backend system timezone)

**Response (JSON)**
```
{
  "ok": true,
  "data": {
    "today": {
      "projectsCount": 12,
      "liveVideosCount": 18,
      "mindmapsCount": 9,
      "commentsCount": 54
    },
    "recent": {
      "newContentLast7d": 6,
      "basedOnField": "createdAt"
    },
    "quickLinks": [
      { "label": "Overview", "href": "/admin", "description": "Snapshots and status." },
      { "label": "Content", "href": "/admin/content", "description": "Projects, videos, mindmaps, blog." },
      { "label": "Comments", "href": "/admin/comments", "description": "Read visitor comments." }
    ]
  }
}
```

**Overview display fields used by frontend**
- `today.projectsCount` (number)
- `today.liveVideosCount` (number)
- `today.mindmapsCount` (number)
- `today.blogPostsCount` (number, optional)
- `today.commentsCount` (number)
- `recent.newContentLast7d` (number, nullable if unavailable)
- `quickLinks[].label` (string)
- `quickLinks[].href` (string)
- `quickLinks[].description` (string, optional)

**Notes**
- `recent.newContentLast7d` depends on `createdAt` in content records.
- If `createdAt` is missing everywhere, frontend can show `N/A`.

### My Todo (for Admin Overview)

Frontend currently supports local-only todo via `localStorage`.
If you want cross-device persistence, add these endpoints:

**List Todos**: `GET /api/admin/todos`

**Create Todo**: `POST /api/admin/todos`

**Update Todo**: `PATCH /api/admin/todos/:id`

**Delete Todo**: `DELETE /api/admin/todos/:id`

**Todo (JSON)**
```
{
  "id": "todo_1740636500000",
  "title": "Update live page cover",
  "done": false,
  "priority": "high",
  "dueDate": "2026-03-01",
  "createdAt": "2026-02-27T09:00:00Z",
  "updatedAt": "2026-02-27T09:00:00Z"
}
```

**Create Todo request fields (required/optional)**
- `title` (string, required, 1-120 chars)
- `priority` (`high` | `medium` | `low`, optional, default `medium`)
- `dueDate` (`YYYY-MM-DD`, optional)

**Create Todo request example**
```
{
  "title": "Review comments before publish",
  "priority": "medium",
  "dueDate": "2026-03-02"
}
```

**Create Todo response example**
```
{
  "ok": true,
  "data": {
    "id": "todo_1740636500000",
    "title": "Review comments before publish",
    "done": false,
    "priority": "medium",
    "dueDate": "2026-03-02",
    "createdAt": "2026-02-27T09:00:00Z",
    "updatedAt": "2026-02-27T09:00:00Z"
  }
}
```

## Projects Page

**Endpoint**: `GET /api/projects`

If `VITE_PROJECTS_API_URL` is not configured, frontend fallback is an empty list (`[]`).

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
  "postId": 1,
  "parentId": null,
  "name": "Your Name",
  "email": "you@example.com",
  "message": "Your message here."
}
```

`parentId` is optional:
- `null` or omitted: create a top-level comment
- non-null: create a reply under the target parent comment
- nested replies are supported at multiple levels
- parent comment must exist and belong to the same `postId`

**Response (JSON)**
```
{
  "ok": true,
  "id": "comment-123",
  "numericId": 123,
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

### Get Comments (Per Post)

**Endpoint**: `GET /api/comments`

**Query Params**
```
postId=1
```

**Response (JSON)**
```
{
  "ok": true,
  "data": [
    {
      "id": "comment-123",
      "postId": 1,
      "name": "Jack",
      "websiteUrl": "https://example.com",
      "adminReply": false,
      "message": "Great blog!",
      "createdAt": "2026-02-08T12:00:00Z",
      "replies": [
        {
          "id": "comment-124",
          "postId": 1,
          "name": "Admin",
          "websiteUrl": null,
          "adminReply": true,
          "message": "Thanks for your message.",
          "createdAt": "2026-02-08T12:30:00Z",
          "replies": []
        }
      ]
    }
  ]
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
  "numericId": 456,
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
- Admin UI now supports direct upload and auto-fills `cover` / `file` using upload response URL.
- `createdAt` is optional for resource objects; frontend should not rely on it as required.
- Admin comment reply may trigger notification emails server-side when `notifyReply=true` and email exists.
  This email sending is best-effort and does not affect reply API success.
- If you host assets in `public/`, use absolute paths like `/live/01.mp4`.
- The frontend expects an array. If your API returns `{ data: [...] }`,
  you will need to adjust the fetch logic accordingly.
