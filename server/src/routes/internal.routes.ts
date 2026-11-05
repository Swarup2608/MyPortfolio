import crypto from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import { env } from "../config/env.js";
import { sweepPendingMedia } from "../services/media.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

// Vercel Cron calls this with "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set.
function requireCronSecret(req: Request, res: Response, next: NextFunction): void {
    const secret = env.CRON_SECRET;
    if (!secret) {
        res.status(404).json({ success: false, message: "[internal] Not found" });
        return;
    }
    const provided = Buffer.from(req.header("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        res.status(401).json({ success: false, message: "[internal] Unauthorized" });
        return;
    }
    next();
}

router.get("/cleanup-media", requireCronSecret, asyncHandler(async (_req, res) => {
    const deleted = await sweepPendingMedia();
    res.status(200).json({ success: true, data: { deleted } });
}));

export default router;
