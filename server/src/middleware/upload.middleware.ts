import multer from "multer";
import { AppError } from "../utils/app-error.js";

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype as never)) {
            callback(new AppError("[validation] Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.", 400));
            return;
        }
        callback(null, true);
    }
    })