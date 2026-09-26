# 🎓 Technical Walkthrough & Architecture Report

**Project Title:** Full-Stack Developer Blog Platform with Threaded Comments  
**Target Audience:** Internship Technical Evaluation Committee / Engineering Lead Review  
**Author:** Full-Stack Engineering Candidate  

---

## 📋 1. Executive Summary

This project delivers an end-to-end, production-ready Blog Platform designed for technical writers and developers. The goal of this application is to demonstrate enterprise-level full-stack software practices: clean architectural separation between client and server, robust TypeScript typing, secure stateless authentication with silent token rotation, automated database fallback mechanisms, and dynamic user interfaces.

### Core Engineering Accomplishments:
1. **Zero-Configuration Out-of-the-Box Execution**: Implemented an automated database connection fallback to `mongodb-memory-server` if no external MongoDB URI is specified.
2. **Stateless JWT Auth & Refresh Rotation**: Implemented short-lived Access Tokens (15m) paired with Refresh Tokens (7d) handled transparently via an Axios request/response interceptor queue.
3. **Threaded Comment Tree**: Built an efficient data modeling structure supporting top-level comments and 1-level nested replies, with automatic cascading deletions upon post/parent comment removal.
4. **Markdown Editor with Live Preview**: Built a dual-mode / split-screen Markdown editor equipped with syntax highlighting, tag chips management, and draft/publish status control.

---

## 🏗 2. System Architecture & Monorepo Layout

The application is structured as a single monorepo separating concerns into `/server` (RESTful API backend) and `/client` (Single Page Application frontend).

```
+-------------------------------------------------------------------+
|                           REACT 19 SPA                            |
| (Vite + TypeScript + Zustand + Tailwind CSS + Axios Interceptors) |
+-------------------------------------------------------------------+
                                  |
                                  | REST API over HTTP (JSON)
                                  | Bearer JWT Access Token
                                  v
+-------------------------------------------------------------------+
|                        EXPRESS API SERVER                         |
|   (Node.js + TypeScript + Zod Validation + Auth Middleware)       |
+-------------------------------------------------------------------+
                                  |
                                  | Mongoose ODM
                                  v
+-------------------------------------------------------------------+
|                   MONGODB / MONGO-MEMORY-SERVER                   |
|     (Users Collection | Posts Collection | Comments Collection)   |
+-------------------------------------------------------------------+
```

---

## 💡 3. Key Design Decisions & Architectural Highlights

### A. Automatic In-Memory MongoDB Fallback Pattern (`src/config/db.ts`)
To ensure reviewers and graders can clone and test the repository instantly without installing or configuring a MongoDB instance locally:
- The backend checks `process.env.MONGODB_URI`.
- If missing or unreachable, it seamlessly launches an instance of `MongoMemoryServer`.
- Data is seeded automatically via `npm run seed`.

```typescript
// Fallback Connection Pattern
if (uri && uri.trim() !== '') {
  try {
    await mongoose.connect(uri);
    return;
  } catch (err) {
    console.warn('⚠️ MONGODB_URI unreachable. Falling back to in-memory MongoDB...');
  }
}
mongoMemoryServer = await MongoMemoryServer.create();
await mongoose.connect(mongoMemoryServer.getUri());
```

### B. Dual-Token JWT Authentication & Silent Refresh Interceptor
Storing tokens in plain local storage is common, but long-lived access tokens pose security risks. 
1. **Access Token**: Short lifespan (15 minutes) sent in `Authorization: Bearer <token>`.
2. **Refresh Token**: Long lifespan (7 days) stored and sent to `/api/v1/auth/refresh`.
3. **Silent Queue Interceptor (`client/src/services/api.ts`)**: When an API request returns `401 Unauthorized`, the client interceptor pauses outgoing requests, calls `/auth/refresh` behind the scenes, updates the access token in Zustand, and retries original requests without interrupting user workflow.

### C. Unique Slug Generation Algorithm (`src/utils/slugify.ts`)
Posts feature SEO-friendly human-readable URLs. When creating or editing a title:
- Title is normalized to lowercase alphanumeric characters separated by hyphens.
- The system queries MongoDB for existing slugs. If a duplicate exists, a counter suffix is appended (e.g. `react-19-guide-1`).

### D. Threaded 1-Level Comment Tree Transformation (`src/controllers/commentController.ts`)
Rather than running expensive recursive DB queries, comments are stored with a simple `parentComment: ObjectId | null` pointer. When fetching comments for a post:
- All post comments are fetched in a single query ordered by `createdAt: 1`.
- An $O(N)$ hash-map algorithm builds top-level comment trees with attached `replies: []` arrays before returning to the UI.

---

## 🗄 4. Data Models Schema

### User Schema (`User`)
- `name`: String (required, 2-50 chars)
- `email`: String (required, unique, lowercase)
- `passwordHash`: String (bcrypt hashed, `select: false`)
- `avatarUrl`: String (optional default avatar)
- `timestamps`: `createdAt`, `updatedAt`

### Post Schema (`Post`)
- `title`: String (required)
- `slug`: String (required, unique index)
- `content`: String (required, Markdown)
- `excerpt`: String (required, max 300 chars)
- `coverImageUrl`: String (optional)
- `author`: ObjectId ref `User` (required)
- `tags`: Array of Strings (indexed)
- `status`: Enum `['draft', 'published']` (default: `'published'`)
- `timestamps`: `createdAt`, `updatedAt`

### Comment Schema (`Comment`)
- `post`: ObjectId ref `Post` (required, indexed)
- `author`: ObjectId ref `User` (required)
- `content`: String (required, max 1000 chars)
- `parentComment`: ObjectId ref `Comment` (optional, default `null`)
- `timestamps`: `createdAt`, `updatedAt`

---

## 🔌 5. API Endpoint Specifications

All endpoints return uniform JSON responses:
```json
{
  "success": true,
  "message": "Action completed",
  "data": { ... }
}
```

### Endpoints Overview

| Method | Route | Description | Validation / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user | Zod validation |
| `POST` | `/api/v1/auth/login` | Authenticate user | Zod validation |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | Zod validation |
| `GET` | `/api/v1/auth/me` | Current user info | Bearer JWT |
| `GET` | `/api/v1/posts` | Paginated feed | Query params (`page`, `limit`, `tag`, `search`, `status`) |
| `GET` | `/api/v1/posts/:slug` | Single post detail | Public (Drafts restricted to author) |
| `POST` | `/api/v1/posts` | Create new post | Bearer JWT + Zod validation |
| `PUT` | `/api/v1/posts/:id` | Update post | Bearer JWT + Author ownership check |
| `DELETE` | `/api/v1/posts/:id` | Delete post & comments | Bearer JWT + Author ownership check |
| `GET` | `/api/v1/posts/:postId/comments` | Post comment tree | Public |
| `POST` | `/api/v1/posts/:postId/comments` | Add comment / reply | Bearer JWT + Zod validation |
| `PUT` | `/api/v1/comments/:id` | Edit comment | Bearer JWT + Author ownership check |
| `DELETE` | `/api/v1/comments/:id` | Delete comment & replies | Bearer JWT + Author ownership check |

---

## 🧪 6. Verification & Quality Assurance

1. **TypeScript Type Safety**: Both `/server` and `/client` pass strict `npx tsc --noEmit` checks with 0 errors.
2. **Production Build Verification**: Frontend bundles cleanly via Vite (`npm run build`).
3. **Database Seeding**: Verified via `npm run seed`, creating demo users (`alex@example.com`, `sophia@example.com`, `david@example.com`), posts, and threaded comments.
4. **API Testing**: Endpoint functionality verified via REST client invocations (`POST /register`, `GET /posts`, `POST /comments`).

---

## 🎯 7. Conclusion

This Blog Platform serves as a comprehensive demonstration of modern full-stack developer competencies, combining secure backend API architecture with a responsive, aesthetic React 19 frontend experience.
