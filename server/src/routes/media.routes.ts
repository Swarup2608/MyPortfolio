import { Router } from "express";
import { uploadMediaController } from "../controllers/media.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { uploadRateLimiter } from "../config/rate-limit.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/", requireAuth, requirePermission(PERMISSIONS.MEDIA_UPLOAD), requireCsrf, uploadRateLimiter, uploadImage, asyncHandler(uploadMediaController));

export default router;
