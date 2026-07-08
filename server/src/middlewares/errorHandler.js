import { errorResponse } from "../utils/apiResponse.js";
import { logger } from "../config/logger.js";

export function notFound(req, res) {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  logger.error(error);
  const statusCode = error.statusCode || error.status || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;
  return errorResponse(res, message, statusCode, {}, { path: req.originalUrl });
}
