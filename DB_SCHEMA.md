# Database Schema (Draft)

This document describes the database tables for the personal site backend.
Designed for MySQL 8+ (works with minor changes in PostgreSQL).

## blog_posts

Stores blog/diary posts.

```sql
CREATE TABLE blog_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255) NOT NULL,
  cover_url VARCHAR(512),
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  status ENUM('draft','published') DEFAULT 'draft',
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## blog_tags

Optional tags for posts.

```sql
CREATE TABLE blog_tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) UNIQUE NOT NULL
);
```

## blog_post_tags

Many-to-many relation between posts and tags.

```sql
CREATE TABLE blog_post_tags (
  post_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  CONSTRAINT fk_blog_post_tags_post
    FOREIGN KEY (post_id) REFERENCES blog_posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_blog_post_tags_tag
    FOREIGN KEY (tag_id) REFERENCES blog_tags(id)
    ON DELETE CASCADE
);
```

## subscribers

Stores email subscriptions.

```sql
CREATE TABLE subscribers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('active','unsubscribed') DEFAULT 'active',
  source VARCHAR(64),
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME
);
```

## email_broadcasts

Tracks bulk email sends.

```sql
CREATE TABLE email_broadcasts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subject VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  status ENUM('draft','scheduled','sent','failed') DEFAULT 'draft',
  scheduled_at DATETIME,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## email_broadcast_logs

Tracks per-recipient delivery status for each broadcast.

```sql
CREATE TABLE email_broadcast_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  broadcast_id BIGINT NOT NULL,
  subscriber_id BIGINT NOT NULL,
  status ENUM('pending','sent','failed') DEFAULT 'pending',
  error_message TEXT,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_email_broadcast_logs_broadcast
    FOREIGN KEY (broadcast_id) REFERENCES email_broadcasts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_email_broadcast_logs_subscriber
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
    ON DELETE CASCADE
);
```

## projects

Stores portfolio projects.

```sql
CREATE TABLE projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  summary VARCHAR(500),
  cover_url VARCHAR(512),
  project_year VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## project_stack_items

Stores stack tags for each project (one-to-many).

```sql
CREATE TABLE project_stack_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  stack_item VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_project_stack_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE
);
```

## project_highlights

Stores highlight bullets for each project (one-to-many).

```sql
CREATE TABLE project_highlights (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  highlight_text VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_project_highlight_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE
);
```

## project_links

Stores external links for each project (one-to-many).

```sql
CREATE TABLE project_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  label VARCHAR(100) NOT NULL,
  href VARCHAR(1000) NOT NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_project_link_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE
);
```

## live_videos

Stores live show videos.

```sql
CREATE TABLE live_videos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  date DATE,
  description TEXT,
  file_url VARCHAR(512) NOT NULL,
  cover_url VARCHAR(512),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## mindmaps

Stores study mindmaps and learning resources.

```sql
CREATE TABLE mindmaps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  file_url VARCHAR(512) NOT NULL,
  cover_url VARCHAR(512),
  updated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## study_tags

Optional tags for mindmaps.

```sql
CREATE TABLE study_tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) UNIQUE NOT NULL
);
```

## mindmap_tags

Many-to-many relation between mindmaps and tags.

```sql
CREATE TABLE mindmap_tags (
  mindmap_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (mindmap_id, tag_id),
  CONSTRAINT fk_mindmap_tags_map
    FOREIGN KEY (mindmap_id) REFERENCES mindmaps(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_mindmap_tags_tag
    FOREIGN KEY (tag_id) REFERENCES study_tags(id)
    ON DELETE CASCADE
);
```

## admin_users

Admin accounts for the management console.

```sql
CREATE TABLE admin_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(128),
  role ENUM('admin','editor') DEFAULT 'admin',
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Optional: comments

If you want to store blog comments in DB.

```sql
CREATE TABLE comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_post
    FOREIGN KEY (post_id) REFERENCES blog_posts(id)
    ON DELETE CASCADE
);
```

## Suggested Indexes

```sql
CREATE INDEX idx_blog_posts_status_published_at ON blog_posts(status, published_at);
CREATE INDEX idx_project_stack_project_id ON project_stack_items(project_id);
CREATE INDEX idx_project_highlight_project_id ON project_highlights(project_id);
CREATE INDEX idx_project_link_project_id ON project_links(project_id);
CREATE INDEX idx_live_videos_date ON live_videos(date);
CREATE INDEX idx_subscribers_status ON subscribers(status);
```
