import express from 'express';
import validate from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { loginLimiter } from '../middleware/rateLimit.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';
import { login, logout, me } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
