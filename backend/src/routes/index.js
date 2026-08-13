import express from 'express';
import authRoutes from './auth.routes.js';
import * as postRoutes from './post.routes.js';
import mediaRoutes from './media.routes.js';
import * as contactRoutes from './contact.routes.js';

const router = express.Router();

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));

router.use('/auth', authRoutes);

router.use('/posts', postRoutes.publicRouter);
router.use('/admin/posts', postRoutes.adminRouter);

router.use('/media', mediaRoutes);

router.use('/contact', contactRoutes.publicRouter);
router.use('/admin/contact', contactRoutes.adminRouter);

export default router;
