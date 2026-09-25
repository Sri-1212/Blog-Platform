import { Router } from 'express';
import { register, login, refresh, getMe } from '../controllers/authController';
import { validateBody } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema, refreshSchema } from '../validators/authValidator';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshSchema), refresh);
router.get('/me', authenticate, getMe);

export default router;
