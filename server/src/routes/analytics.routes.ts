import { Router } from "express";
import { trackEventController } from "../controllers/analytics.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { trackEventSchema } from "../schemas/analytics.schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { trackRateLimiter } from "../config/rate-limit.js";

const router = Router();
router.post("/track",trackRateLimiter,validateBody(trackEventSchema),asyncHandler(trackEventController));

export default router;
