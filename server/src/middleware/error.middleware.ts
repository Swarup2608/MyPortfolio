import type { ErrorRequestHandler, NextFunction, Request, Response} from "express";
import multer from "multer";
import { AppError } from "../utils/app-error.js";
import { MAX_IMAGE_SIZE_BYTES } from "./upload.middleware.js";

export const errorHandler: ErrorRequestHandler = ( error, _req: Request, res: Response, _next: NextFunction ) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: error.code === "LIMIT_FILE_SIZE"
        ? `[media] Image must be ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB or smaller`
        : `[media] ${error.message}`,
    });

    return;
  }

  // body-parser errors (malformed JSON, oversized body) carry their own 4xx status.
  const status = typeof error?.status === "number" ? error.status : 500;
  if (status < 500) {
    res.status(status).json({
      success: false,
      message: `[error] ${error.message}`,
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "[error] Internal server error",
  });
};

