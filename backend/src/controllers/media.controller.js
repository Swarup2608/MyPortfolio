import path from 'path';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { uploadFile } from '../services/storage/index.js';
import { ALLOWED_MIME_TO_EXT } from '../middleware/upload.middleware.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided');

  const extension = ALLOWED_MIME_TO_EXT[req.file.mimetype] || path.extname(req.file.originalname);

  const result = await uploadFile({
    buffer: req.file.buffer,
    extension,
    contentType: req.file.mimetype,
  });

  res.status(201).json({ success: true, url: result.url, key: result.key });
});
