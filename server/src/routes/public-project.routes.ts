import {Router} from 'express';
import {getPublishedProjects , getPublishedProjectsBySlug } from '../controllers/public-project.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get("/",asyncHandler(getPublishedProjects));
router.get("/:slug",asyncHandler(getPublishedProjectsBySlug));

export default router;