import ApiError from '../utils/ApiError.js';
import { CSRF_COOKIE } from '../services/token.service.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Double-submit cookie pattern: the CSRF cookie is not httpOnly, so only
// same-origin JS (our own frontend) can read it and echo it in this header.
// A cross-site form/img/script attack can't set custom headers, so it fails here.
export function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.get('X-CSRF-Token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new ApiError(403, 'Invalid or missing CSRF token');
  }

  next();
}
