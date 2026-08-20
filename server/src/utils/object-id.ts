import mongoose from "mongoose";
import { AppError } from "./app-error.js";

export function validateObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post ID", 400);
  }
}