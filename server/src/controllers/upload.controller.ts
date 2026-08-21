import type {Response} from "express";
import crypto from "crypto";
import path from "path";
import type {AuthenticatedRequest} from "../middleware/auth.middleware.js";
import {uploadFile, deleteImageIfUnused} from "../services/storage.service.js";
import { AppError } from "../utils/app-error.js";
import { createAuditLog } from "../services/audit.service.js";

const EXTENSIONS : Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif"
};

export async function uploadImageController(req: AuthenticatedRequest, res: Response): Promise<void> {
    if(!req.file){
        throw new AppError("[validation] No Image file uploaded.",400);
    }
    const extension = EXTENSIONS[req.file.mimetype];
    if(!extension){
        throw new AppError("[validation] Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.", 400);
    }
    const randomId = crypto.randomUUID();
    const key = path.posix.join("uploads","images",`${randomId}${extension}`);
    const uploaded = await uploadFile({
        buffer: req.file.buffer,
        contentType: req.file.mimetype,
        key,
    });
    await createAuditLog({ req, action: "CREATE", resource: "UPLOAD", resourceId: uploaded.key, description: `Uploaded image "${uploaded.key}"` });
    res.status(201).json({
        success: true,
        message: "[upload] File uploaded successfully.",
        data: uploaded,
    });
}

export async function deleteImageController(req: AuthenticatedRequest & {params: {key?: string | string[]}}, res: Response): Promise<void> {
    const rawKey = req.params.key;
    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
    if(!key){
        throw new AppError("[validation] No file key provided for deletion.", 400);
    }
    // Security Boundary: Only allow deletion of files inside our upload directory.
    const isValidKey = /^uploads\/images\/[a-f0-9-]+\.(jpg|png|webp|avif)$/i.test(key);
    if(!isValidKey){
        throw new AppError("[validation] Invalid file key provided for deletion.", 400);
    }
    const deleted = await deleteImageIfUnused(key);
    if(!deleted){
        throw new AppError("[upload] Image is still in use.", 409);
    }
    await createAuditLog({ req, action: "DELETE", resource: "UPLOAD", resourceId: key, description: `Deleted image "${key}"` });
    res.status(200).json({
        success: true,
        message: "[upload] File deleted successfully.",
    });
}