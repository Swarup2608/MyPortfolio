import {Router} from 'express';
import { createPostController, getPostsController, getPostController, updatePostController, deletePostController, changePostStautusController  } from '../controllers/post.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireCsrf } from '../middleware/csrf.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import { createPostSchema } from '../schemas/post.schema.js';
import { updatePostSchema } from '../schemas/post-update.schema.js';
import { asyncHandler } from '../utils/async-handler.js';
import { publishPostSchema } from '../schemas/post-publish.schema.js';

const postRoutes = Router();

postRoutes.use(requireAuth);

// Get All posts
postRoutes.get("/",requirePermission(PERMISSIONS.POSTS_READ),getPostsController);

// Get Post by Id
postRoutes.get("/:id",requirePermission(PERMISSIONS.POSTS_READ),getPostController);

// Create Post
postRoutes.post("/",requirePermission(PERMISSIONS.POSTS_CREATE),requireCsrf,validateBody(createPostSchema),asyncHandler(createPostController));

// Update Post
postRoutes.patch("/:id",requirePermission(PERMISSIONS.POSTS_UPDATE),requireCsrf,validateBody(updatePostSchema),updatePostController);

// Delete Post
postRoutes.delete("/:id",requirePermission(PERMISSIONS.POSTS_DELETE),requireCsrf,deletePostController);

// Change Post Status
postRoutes.patch("/:id/status",requirePermission(PERMISSIONS.POSTS_PUBLISH),requireCsrf,validateBody(publishPostSchema),asyncHandler(changePostStautusController));

export default postRoutes;