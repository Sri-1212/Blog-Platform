# 🚀 DevPulse — Full-Stack Blog Platform with Comments

A modern, high-performance **Full-Stack Developer Blog Platform** with threaded comments, markdown editor live previews, tag filtering, and JWT token rotation.

Built as a clean monorepo architecture featuring **Node.js, Express, TypeScript, Mongoose, React 19, Vite, Zustand, and Tailwind CSS**.

---

## 🌟 Key Features

- **Out-of-the-Box In-Memory DB**: Automatically uses `mongodb-memory-server` if no external `MONGODB_URI` is supplied, making the project run instantly with zero configuration!
- **JWT Auth & Silent Refresh**: Secure stateless authentication using short-lived Access Tokens (15m) and Refresh Tokens (7d) with automatic silent rotation via Axios interceptors.
- **Markdown Editor with Live Preview**: Split-screen and live tabbed markdown renderer supporting code blocks, tables, and GitHub-flavored markdown.
- **Threaded Comment System**: 1-level nested reply hierarchy with optimistic UI feedback, inline editing, and deletion.
- **Draft & Published Post Visibility**: Authors can draft articles privately, preview them, and toggle status on demand.
- **Instant Demo Readiness**: Pre-configured seed script with 3 demo users, sample posts, tags, and threaded discussion comments.
- **One-Click Demo Login**: Login screen with quick-fill demo buttons for instant testing.
- **Light & Dark Themes**: Switch themes from the navigation bar; your choice is saved in the browser.

---

## 🛠 Tech Stack

### Backend (`/server`)
- **Runtime & Framework**: Node.js, Express.js, TypeScript
- **Database & ODM**: MongoDB, Mongoose, `mongodb-memory-server` (fallback)
- **Authentication**: JWT (Access Token + Refresh Token), `bcryptjs`
- **Validation**: Zod schema validation middleware
- **Dev Tooling**: `ts-node-dev`, `typescript`

### Frontend (`/client`)
- **Library & Framework**: React 19, Vite, TypeScript
- **State Management**: Zustand with `localStorage` persistence
- **Routing**: React Router v6
- **Styling**: Tailwind CSS, Lucide React icons, Glassmorphism design system
- **HTTP Client**: Axios with request & response interceptors
- **Markdown Parsing**: `react-markdown`, `remark-gfm`

---

## 📁 Repository Structure

```text
blog-website/
├── server/                   # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/           # DB connection & env configurations
│   │   ├── controllers/      # Auth, Post, and Comment logic handlers
│   │   ├── middleware/       # JWT auth, Zod validator, Error handler
│   │   ├── models/           # Mongoose schemas (User, Post, Comment)
│   │   ├── routes/           # REST API routes under /api/v1
│   │   ├── utils/            # JWT helpers, Slugify, ApiError class
│   │   ├── validators/       # Zod validation schemas
│   │   ├── app.ts            # Express application setup
│   │   ├── index.ts          # Server entry point
│   │   └── seed.ts           # Demo database seeder script
│   ├── package.json
│   └── tsconfig.json
├── client/                   # React 19 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Navbar, Footer, PostCard, CommentSection, etc.
│   │   ├── pages/            # Home, PostDetail, Editor, Profile, Auth pages
│   │   ├── services/         # Axios API instance and service modules
│   │   ├── store/            # Zustand state stores (useAuthStore)
│   │   ├── types/            # TypeScript interface definitions
│   │   ├── App.tsx           # Router navigation layout
│   │   └── index.css         # Tailwind & custom glassmorphism styles
│   ├── package.json
│   └── vite.config.ts
├── README.md                 # Project Setup & API documentation
├── WALKTHROUGH.md            # Internship Submission Architecture Overview
├── package.json              # Monorepo root script runner
└── .env.example              # Environment variables template
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Sri-1212/Blog-Platform.git
cd blog-platform

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Seed Demo Data (Optional but Recommended)

Seed the database with sample users, published & draft posts, and threaded comments:

```bash
cd ../server
npm run seed
```

> **Demo User Credentials:**
> - `alex@example.com` / `Password123!`
> - `sophia@example.com` / `Password123!`
> - `david@example.com` / `Password123!`

### 3. Run Development Servers

**Option A: Running Server and Client from sub-folders**

- **Terminal 1 (Backend API Server on port 5000):**
  ```bash
  cd server
  npm run dev
  ```

- **Terminal 2 (Frontend Client on port 5173):**
  ```bash
  cd client
  npm run dev
  ```

**Option B: Running from Monorepo Root**

```bash
# Start backend server
npm run dev:server

# Start frontend client (in another terminal)
npm run dev:client
```

Open your browser at **`http://localhost:5173`** to access the application!

---

## 🔌 API Endpoint Reference

All backend API routes are prefixed under `/api/v1`:

| Category | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register a new user |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT tokens |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Public | Issue new access token using refresh token |
| **Auth** | `GET` | `/api/v1/auth/me` | Protected | Fetch current logged-in user profile |
| **Posts** | `GET` | `/api/v1/posts` | Public/Optional | Paginated post feed (filters: `tag`, `author`, `status`, `search`) |
| **Posts** | `GET` | `/api/v1/posts/:slug` | Public/Optional | Single post detail with author info |
| **Posts** | `POST` | `/api/v1/posts` | Protected | Create new post (auto-generates unique slug) |
| **Posts** | `PUT` | `/api/v1/posts/:id` | Protected (Author) | Edit existing post |
| **Posts** | `DELETE` | `/api/v1/posts/:id` | Protected (Author) | Delete post & cascade delete comments |
| **Comments**| `GET` | `/api/v1/posts/:postId/comments` | Public | Fetch nested comment tree for a post |
| **Comments**| `POST` | `/api/v1/posts/:postId/comments` | Protected | Add comment or reply (`parentCommentId`) |
| **Comments**| `PUT` | `/api/v1/comments/:id` | Protected (Author) | Edit own comment |
| **Comments**| `DELETE` | `/api/v1/comments/:id` | Protected (Author) | Delete own comment and child replies |

---

## 🛡 Security & Environment Variables

Environment variables are defined in `server/.env`. If `MONGODB_URI` is left blank, the application automatically starts an in-memory MongoDB instance.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog_platform # Leave empty for in-memory fallback
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```
