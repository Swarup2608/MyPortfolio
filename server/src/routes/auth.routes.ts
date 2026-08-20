import {Router} from "express";
import {login, logout, getMe} from "../controllers/auth.controller.js";
import {requireAuth} from "../middleware/auth.middleware.js";
import {validateBody} from "../middleware/validate.middleware.js";
import {loginSchema} from "../schemas/auth.schema.js";
import { authRateLimiter } from "../config/rate-limit.js";

const router = Router();
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);

export default router;