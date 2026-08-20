import {Router} from "express";
import {adminTest, editorTest, viewerTest} from "../controllers/rbac-test.controller.js";
import {requireAuth} from "../middleware/auth.middleware.js";
import {requirePermission} from "../middleware/permission.middleware.js";
import {PERMISSIONS} from "../config/permissions.js";

const router = Router();

router.get("/admin", requireAuth, requirePermission(PERMISSIONS.USERS_READ), adminTest);
router.get("/editor", requireAuth, requirePermission(PERMISSIONS.POSTS_CREATE), editorTest);
router.get("/viewer", requireAuth, requirePermission(PERMISSIONS.POSTS_READ), viewerTest);

export default router;