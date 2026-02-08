# Personal Website Frontend

基于 React + TypeScript + Vite 的个人网站前端项目，包含主页、现场演出、项目、博客与学习笔记等页面，支持可选的 API 数据源与表单提交。

## Features
- Pages: Home, Live, Projects, Blog, Study
- Static data seeds with optional API overrides
- Minimal design system using CSS tokens and utility classes

## Tech Stack
- React 19 + React Router
- TypeScript
- Vite
- ESLint

## Getting Started
1. Install dependencies
   `npm install`
2. Start dev server
   `npm run dev`

## Commands
- `npm run dev` — start dev server
- `npm run build` — typecheck + production build
- `npm run lint` — run ESLint
- `npm run preview` — preview production build

## Environment Variables (Optional)
Create a `.env` file in the project root to enable live data:
- `VITE_PROJECTS_API_URL` — projects list for `/projects`
- `VITE_LIVE_API_URL` — live videos list for `/live`
- `VITE_STUDY_API_URL` — mindmaps list for `/study`
- `VITE_COMMENTS_API_URL` — comments form submission for `/blog`
- `VITE_SUBSCRIBE_API_URL` — subscribe form submission for `/blog`

If a variable is missing, the page uses local seed data or shows an error state for form submissions.

## Project Structure
- `src/main.tsx` app bootstrap and global styles
- `src/App.tsx` routes and root layout
- `src/app/layout/` layout components
- `src/pages/` route pages
- `src/components/` shared UI components
- `src/data/` static content seeds
- `src/styles/` tokens, typography, globals
- `src/assets/` images
- `public/` static files served as-is

## 说明（中文）
- 路由与布局：`src/App.tsx`、`src/app/layout/`
- 页面：`src/pages/*`
- 数据种子：`src/data/*`
- 样式：`src/styles/*`
- 静态资源：`src/assets/` 与 `public/`

若需启用接口数据或表单提交，请配置 `.env` 中的 `VITE_*` 变量。
