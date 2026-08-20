import type { ErrorRequestHandler, NextFunction, Request, Response} from "express";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = ( error, _req: Request, res: Response, _next: NextFunction ) => {
  console.error(error);
 console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "[error] Internal server error",
  });
};