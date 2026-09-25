"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title cannot exceed 150 characters'),
    content: zod_1.z.string().min(10, 'Content must be at least 10 characters'),
    excerpt: zod_1.z.string().min(5, 'Excerpt must be at least 5 characters').max(300, 'Excerpt cannot exceed 300 characters'),
    coverImageUrl: zod_1.z.string().url('Invalid cover image URL').optional().or(zod_1.z.literal('')),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    status: zod_1.z.enum(['draft', 'published']).optional().default('published'),
});
exports.updatePostSchema = exports.createPostSchema.partial();
