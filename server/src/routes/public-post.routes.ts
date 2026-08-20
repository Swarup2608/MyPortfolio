import {Router} from 'express';
import { getPublishedPosts, getPublishedPostsBySlug } from '../controllers/public-post.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get("/",asyncHandler(getPublishedPosts));
router.get("/:slug",asyncHandler(getPublishedPostsBySlug));

export default router;