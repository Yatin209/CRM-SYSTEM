import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { notificationService } from "../services/resourceServices.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const crm = ["Administrator", "Manager", "Sales Executive", "Customer Support Executive"];
const managers = ["Administrator", "Manager"];

router.use(authenticate);

// GET /notifications - Get notifications for the logged-in user only
router.get(
  "/",
  authorize(...crm),
  asyncHandler(async (req, res) => {
    // Override query to filter by logged-in user
    const userQuery = {
      ...req.query,
      user: req.user.sub, // Filter by the user ID from JWT token
    };
    
    const { records, meta } = await notificationService.list(userQuery);
    return successResponse(res, "Notification list fetched", records, meta);
  })
);

// GET /notifications/:id - Get a single notification
router.get(
  "/:id",
  authorize(...crm),
  asyncHandler(async (req, res) => {
    const record = await notificationService.getById(req.params.id);
    if (!record) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }
    return successResponse(res, "Notification fetched", record);
  })
);

// PUT/PATCH /notifications/:id - Update a notification (e.g., mark as read)
router.put(
  "/:id",
  authorize(...crm),
  asyncHandler(async (req, res) => {
    const record = await notificationService.update(req.params.id, req.body, req.user?.sub);
    if (!record) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }
    return successResponse(res, "Notification updated", record);
  })
);

router.patch(
  "/:id",
  authorize(...crm),
  asyncHandler(async (req, res) => {
    const record = await notificationService.update(req.params.id, req.body, req.user?.sub);
    if (!record) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }
    return successResponse(res, "Notification updated", record);
  })
);

// POST /notifications - Create a notification (managers only)
router.post(
  "/",
  authorize(...managers),
  asyncHandler(async (req, res) => {
    const record = await notificationService.create(req.body, req.user?.sub);
    return successResponse(res, "Notification created", record, {}, 201);
  })
);

// DELETE /notifications/:id - Delete a notification (managers only)
router.delete(
  "/:id",
  authorize(...managers),
  asyncHandler(async (req, res) => {
    const record = await notificationService.remove(req.params.id);
    if (!record) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }
    return successResponse(res, "Notification deleted", record);
  })
);

export default router;
