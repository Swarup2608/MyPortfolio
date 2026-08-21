import {Router} from 'express';
import { getPublishedPosts, getPublishedPostsBySlug, getPublishedPostTags } from '../controllers/public-post.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get("/",asyncHandler(getPublishedPosts));
router.get("/tags",asyncHandler(getPublishedPostTags));
router.get("/:slug",asyncHandler(getPublishedPostsBySlug));

export default router;