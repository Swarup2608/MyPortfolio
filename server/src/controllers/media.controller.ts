import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { ALLOWED_IMAGE_TYPES } from "../middleware/upload.middleware.js";
import { deletePendingMedia, trackUpload } from "../services/media.service.js";
import { storage } from "../services/storage/index.js";
import { AppError } from "../utils/app-error.js";

export async function uploadMediaController(req: AuthenticatedRequest, res: Response): Promise<void> {
    const extension = req.file && ALLOWED_IMAGE_TYPES[req.file.mimetype];
    if (!req.file || !extension) {
        throw new AppError("[media] No image file provided", 400);
    }
    const file = await storage.uploadFile({
        buffer: req.file.buffer,
        extension,
        contentType: req.file.mimetype,
    });
    // Tracked as PENDING until a saved post/project references it, so abandoned uploads can be cleaned up.
    if (req.user) await trackUpload(file.key, req.user.userId);
    res.status(201).json({ success: true, data: file });
}

// Drops this user's own unsaved uploads (the editor was refreshed or closed without saving).
export async function deletePendingMediaController(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) throw new AppError("[auth] User not authenticated", 401);
    const deleted = await deletePendingMedia(req.body.keys, req.user.userId);
    res.status(200).json({ success: true, data: { deleted } });
}
