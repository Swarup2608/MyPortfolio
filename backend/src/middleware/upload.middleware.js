import multer from 'multer';
import ApiError from '../utils/ApiError.js';

export const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
      return cb(new ApiError(400, 'Only JPEG, PNG, WEBP or GIF images are allowed'));
    }
    cb(null, true);
  },
});

export { MAX_FILE_SIZE_BYTES };
