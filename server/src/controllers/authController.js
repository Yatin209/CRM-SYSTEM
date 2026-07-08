import { cookieOptions, createPasswordReset, loginUser, refreshSession, resetPassword } from "../services/authService.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

export const login = asyncHandler(async (req, res) => {
  const session = await loginUser(req.body.email, req.body.password);
  res.cookie("refreshToken", session.refreshToken, cookieOptions());
  return successResponse(res, "Login successful", { user: session.user, accessToken: session.accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    const error = new Error("Refresh token missing");
    error.statusCode = 401;
    throw error;
  }
  const session = await refreshSession(token);
  return successResponse(res, "Session refreshed", session);
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", { ...cookieOptions(), maxAge: 0 });
  return successResponse(res, "Logout successful");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const token = await createPasswordReset(req.body.email);
  const data = env.nodeEnv === "production" ? {} : { resetToken: token };
  return successResponse(res, "Password reset request accepted", data);
});

export const reset = asyncHandler(async (req, res) => {
  await resetPassword(req.body.token, req.body.password);
  return successResponse(res, "Password reset successful");
});
