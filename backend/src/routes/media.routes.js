import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';
import { uploadLimiter } from '../middleware/rateLimit.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadImage } from '../controllers/media.controller.js';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  csrfProtection,
  uploadLimiter,
  upload.single('image'),
  uploadImage
);

export default router;
