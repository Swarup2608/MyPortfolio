import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : err.statusCode || 500;

  if (!isApiError && statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isApiError || statusCode < 500 ? err.message : 'Internal server error',
    ...(isApiError && err.details ? { details: err.details } : {}),
    ...(env.nodeEnv === 'development' && !isApiError ? { stack: err.stack } : {}),
  });
}
