import type { ErrorRequestHandler, NextFunction, Request, Response} from "express";
import { AppError } from "../utils/app-error.js";
import multer from "multer";
import mongoose from "mongoose";

export const errorHandler: ErrorRequestHandler = ( error, _req: Request, res: Response, _next: NextFunction ) => {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if(error instanceof multer.MulterError){
    if(error.code === "LIMIT_FILE_SIZE"){
      res.status(400).json({
        success: false,
        message: "[validation] File size exceeds the maximum limit of 5MB.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `[validation] ${error.message}`,
    });
    return;
  }

  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    res.status(409).json({
      success: false,
      message: "[validation] A resource with the same unique value already exists",
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: "[validation] Database validation failed",
      errors: Object.fromEntries(
        Object.entries(error.errors).map(([field, value]) => [field, value.message]),
      ),
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "[error] Internal server error",
  });
};
