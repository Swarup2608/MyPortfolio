import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import { setAuthCookies, clearAuthCookies } from '../services/token.service.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  // Use one generic message for both cases so we don't leak which emails exist.
  if (!user || !(await user.verifyPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  setAuthCookies(res, user);
  res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
});
