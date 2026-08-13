import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { verifyToken, AUTH_COOKIE } from '../services/token.service.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) throw new ApiError(401, 'Not authenticated');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Session expired or invalid, please log in again');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Not authenticated');

  req.user = user;
  next();
});
