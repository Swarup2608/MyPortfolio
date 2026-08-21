import {Router} from "express";

import {deleteImageController, uploadImageController} from "../controllers/upload.controller.js";
import {requireAuth} from "../middleware/auth.middleware.js";
import {requirePermission} from "../middleware/permission.middleware.js";
import {asyncHandler} from "../utils/async-handler.js";
import {uploadImage} from "../middleware/upload.middleware.js";
import {PERMISSIONS} from "../config/permissions.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";

const router = Router();

router.post("/",requireAuth, requirePermission(PERMISSIONS.POSTS_CREATE), requireCsrf, uploadImage.single("image"), asyncHandler(uploadImageController));
router.delete("/*key",requireAuth, requirePermission(PERMISSIONS.POSTS_DELETE), requireCsrf, asyncHandler(deleteImageController));

export default router;