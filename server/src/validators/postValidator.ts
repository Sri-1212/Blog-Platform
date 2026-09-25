import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title cannot exceed 150 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().min(5, 'Excerpt must be at least 5 characters').max(300, 'Excerpt cannot exceed 300 characters'),
  coverImageUrl: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('published'),
});

export const updatePostSchema = createPostSchema.partial();
