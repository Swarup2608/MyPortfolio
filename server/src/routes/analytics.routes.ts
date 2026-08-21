import {Router} from "express";

import {trackAnalyticsEvent} from "../controllers/analytics.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { analyticsEventSchema } from "../schemas/analytics.schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { analyticsRateLimiter } from "../config/rate-limit.js";

const router = Router();

router.post("/track", analyticsRateLimiter, validateBody(analyticsEventSchema), asyncHandler(trackAnalyticsEvent));

export default router;