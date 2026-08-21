import {Router} from "express";

import {getAnalyticsDashboard} from "../controllers/admin-analytics.controller.js";
import {requireAuth} from "../middleware/auth.middleware.js";
import {requirePermission} from "../middleware/permission.middleware.js";
import {PERMISSIONS} from "../config/permissions.js";
import {asyncHandler} from "../utils/async-handler.js";

const router = Router();

router.get("/dashboard", requireAuth, requirePermission(PERMISSIONS.ANALYTICS_READ), asyncHandler(getAnalyticsDashboard));

export default router;