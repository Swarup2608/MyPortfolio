import rateLimit from "express-rate-limit";
import { success } from "zod";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "[rate-limit] Too many requests. Please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "[rate-limit] Too many login attempts. Please try again later.",
  },
});

export const contactRateLimiter = rateLimit({
  windowMs : 15*60*1000,
  limit: 5,
  legacyHeaders: false,
  standardHeaders: "draft-8",
  message: {
    success: false,
    message: "[rate-limit] Too many contact submission, please try again."
  }
});

export const analyticsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "[rate-limit] Too many analytics events. Please try again later.",
  },
});