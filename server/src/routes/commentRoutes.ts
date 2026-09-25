import { Router } from 'express';
import { updateComment, deleteComment } from '../controllers/commentController';
import { validateBody } from '../middleware/validateMiddleware';
import { updateCommentSchema } from '../validators/commentValidator';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.put('/:id', authenticate, validateBody(updateCommentSchema), updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
