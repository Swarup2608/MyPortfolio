import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

export const AUTH_COOKIE = 'token';
export const CSRF_COOKIE = 'csrfToken';

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function cookieOptions(maxAgeMs, httpOnly) {
  return {
    httpOnly,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    maxAge: maxAgeMs,
    path: '/',
  };
}

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export function setAuthCookies(res, user) {
  const token = signToken(user);
  const csrfToken = crypto.randomBytes(24).toString('hex');

  res.cookie(AUTH_COOKIE, token, cookieOptions(EIGHT_HOURS_MS, true));
  // Readable by JS on purpose: the double-submit CSRF pattern requires the
  // frontend to read this cookie and echo it back in a custom header.
  res.cookie(CSRF_COOKIE, csrfToken, cookieOptions(EIGHT_HOURS_MS, false));
}

export function clearAuthCookies(res) {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}
