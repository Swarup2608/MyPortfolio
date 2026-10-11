import { Router } from "express";
import { getAnalyticsSummaryController } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { validateQuery } from "../middleware/validate.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import { analyticsQuerySchema } from "../schemas/analytics.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(requireAuth);
router.get("/",requirePermission(PERMISSIONS.ANALYTICS_READ),validateQuery(analyticsQuerySchema),asyncHandler(getAnalyticsSummaryController));

export default router;
