import { Router } from 'express';
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController';
import {
  getCommentsByPost,
  createComment,
} from '../controllers/commentController';
import { validateBody } from '../middleware/validateMiddleware';
import { createPostSchema, updatePostSchema } from '../validators/postValidator';
import { createCommentSchema } from '../validators/commentValidator';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';

const router = Router();

// Post routes
router.get('/', optionalAuthenticate, getPosts);
router.get('/:slug', optionalAuthenticate, getPostBySlug);
router.post('/', authenticate, validateBody(createPostSchema), createPost);
router.put('/:id', authenticate, validateBody(updatePostSchema), updatePost);
router.delete('/:id', authenticate, deletePost);

// Comments nested under post routes
router.get('/:postId/comments', getCommentsByPost);
router.post('/:postId/comments', authenticate, validateBody(createCommentSchema), createComment);

export default router;
