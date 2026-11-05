import { Router } from "express";
import { deletePendingMediaController, uploadMediaController } from "../controllers/media.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { deleteMediaSchema } from "../schemas/media.schema.js";
import { PERMISSIONS } from "../config/permissions.js";
import { uploadRateLimiter } from "../config/rate-limit.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/", requireAuth, requirePermission(PERMISSIONS.MEDIA_UPLOAD), requireCsrf, uploadRateLimiter, uploadImage, asyncHandler(uploadMediaController));

// Only the caller's own still-unsaved uploads can be deleted here.
router.delete("/", requireAuth, requirePermission(PERMISSIONS.MEDIA_UPLOAD), requireCsrf, validateBody(deleteMediaSchema), asyncHandler(deletePendingMediaController));

export default router;
