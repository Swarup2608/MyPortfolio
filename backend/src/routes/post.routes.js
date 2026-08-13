import express from 'express';
import validate from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  idParamSchema,
  slugParamSchema,
  listQuerySchema,
  adminListQuerySchema,
} from '../validators/post.validator.js';
import * as ctrl from '../controllers/post.controller.js';

const router = express.Router();

// Public
router.get('/', validate(listQuerySchema), ctrl.listPublished);
router.get('/tags', ctrl.listTags);
router.get('/:slug', validate(slugParamSchema), ctrl.getPublishedBySlug);

// Admin (mounted separately below with auth applied)
const adminRouter = express.Router();
adminRouter.use(requireAuth, csrfProtection);
adminRouter.get('/', validate(adminListQuerySchema), ctrl.listAll);
adminRouter.get('/:id', validate(idParamSchema), ctrl.getById);
adminRouter.post('/', validate(createPostSchema), ctrl.create);
adminRouter.put('/:id', validate(updatePostSchema), ctrl.update);
adminRouter.delete('/:id', validate(idParamSchema), ctrl.remove);

export { router as publicRouter, adminRouter };
