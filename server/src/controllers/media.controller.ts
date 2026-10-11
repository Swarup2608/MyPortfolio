import type { Request, Response } from "express";
import { ALLOWED_IMAGE_TYPES } from "../middleware/upload.middleware.js";
import { storage } from "../services/storage/index.js";
import { AppError } from "../utils/app-error.js";

export async function uploadMediaController(req: Request, res: Response): Promise<void> {
    const extension = req.file && ALLOWED_IMAGE_TYPES[req.file.mimetype];
    if (!req.file || !extension) {
        throw new AppError("[media] No image file provided", 400);
    }
    const file = await storage.uploadFile({
        buffer: req.file.buffer,
        extension,
        contentType: req.file.mimetype,
    });
    res.status(201).json({ success: true, data: file });
}
