import { getDashboard } from "../services/dashboardService.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboard();
  return successResponse(res, "Dashboard fetched", data);
});
