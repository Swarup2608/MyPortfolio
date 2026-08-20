import { Router } from "express";
import { createContactController } from "../controllers/contact.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createContactSchema } from "../schemas/contact.schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { contactRateLimiter } from "../config/rate-limit.js";

const router = Router();
router.post("/",contactRateLimiter,validateBody(createContactSchema),asyncHandler(createContactController));

export default router;