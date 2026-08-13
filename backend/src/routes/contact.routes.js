import express from 'express';
import validate from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';
import { contactLimiter } from '../middleware/rateLimit.middleware.js';
import { contactSchema } from '../validators/contact.validator.js';
import { idParamSchema, listQuerySchema } from '../validators/post.validator.js';
import * as ctrl from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/', contactLimiter, validate(contactSchema), ctrl.submit);

const adminRouter = express.Router();
adminRouter.use(requireAuth, csrfProtection);
adminRouter.get('/', validate(listQuerySchema), ctrl.listAll);
adminRouter.patch('/:id/read', validate(idParamSchema), ctrl.markRead);

export { router as publicRouter, adminRouter };
