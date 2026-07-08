import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { errorResponse } from "../utils/apiResponse.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return errorResponse(res, "Authentication required", 401);
  }

  try {
    req.user = jwt.verify(token, env.jwtAccessSecret);
    return next();
  } catch {
    return errorResponse(res, "Session expired", 401);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.length || roles.includes(req.user?.role)) {
      return next();
    }
    return errorResponse(res, "You do not have permission to access this resource", 403);
  };
}
