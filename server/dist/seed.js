"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./config/db");
const User_1 = require("./models/User");
const Post_1 = require("./models/Post");
const Comment_1 = require("./models/Comment");
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting Database Seeding Process...');
        await (0, db_1.connectDB)();
        // Clear existing data
        await User_1.User.deleteMany({});
        await Post_1.Post.deleteMany({});
        await Comment_1.Comment.deleteMany({});
        console.log('🧹 Cleaned existing database collections.');
        // 1. Create Demo Users
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash('Password123!', salt);
        const user1 = await User_1.User.create({
            name: 'Alex Morgan',
            email: 'alex@example.com',
            passwordHash,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        });
        const user2 = await User_1.User.create({
            name: 'Sophia Chen',
            email: 'sophia@example.com',
            passwordHash,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        });
        const user3 = await User_1.User.create({
            name: 'David Miller',
            email: 'david@example.com',
            passwordHash,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        });
        console.log(`👤 Created 3 Demo Users:
      - alex@example.com (Password: Password123!)
      - sophia@example.com (Password: Password123!)
      - david@example.com (Password: Password123!)`);
        // 2. Create Demo Posts
        const post1 = await Post_1.Post.create({
            title: 'Building High-Performance Web Applications with React 19 & Vite',
            slug: 'building-high-performance-web-applications-with-react-19-vite',
            excerpt: 'Discover how React 19 features, Zustand state management, and Vite optimize frontend speeds and developer experience.',
            content: `# Building High-Performance Web Applications with React 19 & Vite

Modern web applications require fast initial load times, instant feedback, and maintainable state management. In this article, we explore how combining **React 19**, **Vite**, and **Zustand** creates a world-class developer and user experience.

---

## Why React 19?

React 19 introduces significant improvements in rendering efficiency, component lifecycle handling, and asynchronous data fetching:

- **Optimistic UI Updates**: Instantly reflect user actions before server responses return.
- **Improved Hydration**: Faster time-to-interactive for dynamic components.
- **Form Actions & Hooks**: Built-in mechanisms to handle async submit logic seamlessly.

---

## Lightweight State Management with Zustand

Zustand provides a minimal, boilerplate-free state management model that works out of the box with TypeScript.

\`\`\`typescript
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
\`\`\`

---

## Key Takeaways

1. **Vite** delivers lightning-fast Hot Module Replacement (HMR).
2. **React 19** improves UI responsiveness and async workflow design.
3. **Zustand** eliminates Redux boilerplate while maintaining full predictability.

Happy coding! 🚀`,
            coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
            author: user1._id,
            tags: ['React', 'TypeScript', 'Vite', 'WebDev'],
            status: 'published',
        });
        const post2 = await Post_1.Post.create({
            title: 'Demystifying JWT Authentication & Refresh Token Rotation',
            slug: 'demystifying-jwt-authentication-refresh-token-rotation',
            excerpt: 'A comprehensive deep-dive into secure stateless authentication using short-lived access tokens and long-lived refresh tokens.',
            content: `# Demystifying JWT Authentication & Refresh Token Rotation

Security is paramount in modern web architectures. Storing long-lived access tokens in local storage exposes applications to XSS attacks. By combining short-lived JWT access tokens with secure refresh tokens, we strike the perfect balance between security and user convenience.

---

## Token Lifecycle Architecture

1. **User Login**: Server verifies credentials with \`bcrypt\`.
2. **Issue Tokens**: 
   - **Access Token**: Short lifespan (e.g., 15 minutes), used in \`Authorization: Bearer <token>\`.
   - **Refresh Token**: Longer lifespan (e.g., 7 days), used exclusively to request new access tokens.
3. **Silent Refresh**: Axios interceptors detect \`401 Unauthorized\` responses and automatically request a new access token without disrupting the user.

---

## Axios Interceptor Implementation

\`\`\`typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newAccessToken = await refreshAccessToken();
      error.config.headers.Authorization = \`Bearer \${newAccessToken}\`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
\`\`\`

---

## Summary

Implementing short-lived access tokens alongside structured rotation mechanisms keeps user credentials protected against common web vectors.`,
            coverImageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80',
            author: user2._id,
            tags: ['Security', 'JWT', 'NodeJS', 'Express'],
            status: 'published',
        });
        const post3 = await Post_1.Post.create({
            title: 'Mastering MongoDB Schema Design & Mongoose Patterns',
            slug: 'mastering-mongodb-schema-design-mongoose-patterns',
            excerpt: 'Learn how to structure collections, optimize queries with compound indexes, and model hierarchical data such as nested comments.',
            content: `# Mastering MongoDB Schema Design & Mongoose Patterns

MongoDB's flexible document model allows developers to scale schema structures quickly. However, without careful indexing and document modeling, performance degrades as datasets grow.

---

## Modeling Nested & Threaded Comments

When building discussion forums or blogs with nested comments, you have two primary options:
1. **Embedded Subdocuments**: Fast reads, but restricted by the 16MB document size limit.
2. **Referenced Documents with Parent Pointer**: Highly scalable and clean for 1-level or multi-level replies.

\`\`\`typescript
const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }
});
\`\`\`

---

## Indexing Strategy

- Index frequently searched fields like \`slug\`, \`status\`, and \`tags\`.
- Use compound indexes for queries combining sorting and filtering.`,
            coverImageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
            author: user3._id,
            tags: ['MongoDB', 'Database', 'NodeJS', 'Mongoose'],
            status: 'published',
        });
        await Post_1.Post.create({
            title: 'Draft: Exploring WebAssembly for High-Performance Browser Computing',
            slug: 'draft-exploring-webassembly-for-high-performance-browser-computing',
            excerpt: 'Private draft notes on compiling Rust to WebAssembly to handle heavy media rendering in the browser.',
            content: `# Exploring WebAssembly in Browser Applications

*Note: This is an unpublished draft.*

WebAssembly (Wasm) enables near-native execution speeds for computational heavy-lifting in client applications...`,
            coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
            author: user1._id,
            tags: ['WebAssembly', 'Rust', 'Performance'],
            status: 'draft',
        });
        console.log('📝 Created 4 Demo Posts (3 Published, 1 Draft).');
        // 3. Create Demo Comments
        const comment1 = await Comment_1.Comment.create({
            post: post1._id,
            author: user2._id,
            content: 'Fantastic article, Alex! React 19 compiler optimizations have significantly simplified state management.',
        });
        await Comment_1.Comment.create({
            post: post1._id,
            author: user1._id,
            content: 'Thanks Sophia! Glad you found it helpful. Combined with Zustand, it makes development so clean.',
            parentComment: comment1._id,
        });
        await Comment_1.Comment.create({
            post: post1._id,
            author: user3._id,
            content: 'Great writeup. Vite HMR is definitely a game changer compared to older webpack builds.',
        });
        const comment2 = await Comment_1.Comment.create({
            post: post2._id,
            author: user1._id,
            content: 'The refresh token interceptor snippet is crystal clear. Thanks for sharing this pattern!',
        });
        await Comment_1.Comment.create({
            post: post2._id,
            author: user2._id,
            content: 'Appreciate it, Alex! Keeping tokens short-lived prevents so many security issues.',
            parentComment: comment2._id,
        });
        console.log('💬 Created Demo Threaded Comments.');
        console.log('✅ Database Seeding Completed Successfully!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        await (0, db_1.disconnectDB)();
        process.exit(0);
    }
};
seedDatabase();
