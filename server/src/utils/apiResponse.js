export function successResponse(res, message, data = {}, meta = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
}

export function errorResponse(res, message, statusCode = 500, data = {}, meta = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
    meta
  });
}
