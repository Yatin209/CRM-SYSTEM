import { validationResult } from "express-validator";
import { errorResponse } from "../utils/apiResponse.js";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  return errorResponse(res, "Validation failed", 422, { errors: result.array() });
}
