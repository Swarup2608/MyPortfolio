import {Router} from 'express';
import { getPublishedPostsController, getPublishedPostsBySlug, getPublishedTagsController } from '../controllers/public-post.controller.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { publicPostListQuerySchema } from '../schemas/list-query.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get("/",validateQuery(publicPostListQuerySchema),asyncHandler(getPublishedPostsController));
// Must stay above "/:slug" or "tags" would be treated as a slug.
router.get("/tags",asyncHandler(getPublishedTagsController));
router.get("/:slug",asyncHandler(getPublishedPostsBySlug));

export default router;
