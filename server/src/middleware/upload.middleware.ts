import multer from "multer";
import { AppError } from "../utils/app-error.js";

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
};

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Single "image" field, held in memory and handed to the storage driver by the controller.
export const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
            cb(new AppError("[media] Only JPEG, PNG, WEBP or GIF images are allowed", 400));
            return;
        }
        cb(null, true);
    },
}).single("image");
