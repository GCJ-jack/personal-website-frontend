# AGENTS.md

## Project Summary / 项目概览
Personal website frontend built with React + TypeScript + Vite. It uses React Router for client-side routing and a small design system based on CSS tokens and global utility classes.
基于 React + TypeScript + Vite 的个人网站前端，使用 React Router 做前端路由，并以 CSS tokens 与全局工具类构建简单的设计系统。

## Stack / 技术栈
- React 19 + React Router
- TypeScript
- Vite
- ESLint

## Key Commands / 常用命令
- `npm run dev` — start dev server / 启动开发服务器
- `npm run build` — typecheck + production build / 类型检查并构建生产包
- `npm run lint` — run ESLint / 运行 ESLint
- `npm run preview` — preview production build / 预览生产构建

## App Structure / 目录结构
- `src/main.tsx` bootstraps the app and global styles / 应用入口与全局样式加载
- `src/App.tsx` defines routes and wraps pages with the root layout / 路由定义与布局包装
- `src/app/layout/` contains `RootLayout`, `Header`, `Footer` / 布局组件
- `src/pages/` route pages: `Home`, `Live`, `Projects`, `Blog`, `Study` / 路由页面
- `src/components/` shared UI building blocks (e.g. `Page`) / 共享组件
- `src/data/` static content seeds (used as defaults when APIs are not configured) / 静态数据种子
- `src/styles/` CSS tokens, typography, and global utility classes / 样式与工具类
- `src/assets/` local images / 本地图片资源
- `public/` static files served as-is (e.g. `/live/*.mp4` if placed there) / 静态文件

## Content Sources / 数据来源
Pages render from `src/data/*` by default. Some pages optionally fetch from APIs if environment variables are set.
页面默认读取 `src/data/*`，若配置环境变量则可从接口拉取数据。

### Environment Variables (Optional) / 环境变量（可选）
Define these in a `.env` file at the project root to enable live data:
在项目根目录 `.env` 中配置以下变量以启用接口数据：
- `VITE_PROJECTS_API_URL` — projects list for `/projects` / 项目列表
- `VITE_LIVE_API_URL` — live videos list for `/live` / 现场视频列表
- `VITE_STUDY_API_URL` — mindmaps list for `/study` / 学习脑图列表
- `VITE_COMMENTS_API_URL` — comments form submission for `/blog` / 博客留言提交
- `VITE_SUBSCRIBE_API_URL` — subscribe form submission for `/blog` / 博客订阅提交

If a variable is missing, the page uses local seed data or displays an error state for form submissions.
未配置变量时，页面使用本地数据种子或在表单提交时显示错误状态。

## Styling Conventions / 样式约定
- Global tokens and typography live in `src/styles/tokens.css` and `src/styles/typography.css`.
- App-wide layout and utility classes live in `src/styles/globals.css`.
- Pages primarily use utility classes like `card`, `grid-*`, `stack`, `small`, `button`.

全局变量与字体在 `src/styles/tokens.css`、`src/styles/typography.css`。
全局布局与工具类在 `src/styles/globals.css`。
页面主要使用 `card`、`grid-*`、`stack`、`small`、`button` 等工具类。

## Routing / 路由
Defined in `src/App.tsx`:
在 `src/App.tsx` 中定义：
- `/` Home
- `/live` Live
- `/projects` Projects
- `/blog` Blog
- `/study` Study

## Notes For Changes / 修改提示
- Update navigation labels/links in `src/data/navigation.ts`.
- Update site metadata in `src/data/site.ts`.
- Add/modify static content in `src/data/*` and page components in `src/pages/*`.

导航与链接在 `src/data/navigation.ts`。
站点元信息在 `src/data/site.ts`。
静态内容在 `src/data/*` 与 `src/pages/*`。
