import { Router } from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';
import commentRoutes from './commentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);

export default router;
