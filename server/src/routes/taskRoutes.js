import { Router } from "express";
import { body } from "express-validator";
import { recordActivity } from "../controllers/crudController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { taskService } from "../services/resourceServices.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  canSeeTask,
  isTaskAdmin,
  taskVisibilityFilter,
} from "../utils/taskVisibility.js";

const router = Router();
const crmRoles = ["Administrator", "Manager", "Sales Executive", "Customer Support Executive"];
const taskStatuses = ["Pending", "In Progress", "Completed"];
const describeTask = (task) => `${task?.title || ""}${task?.relatedTo ? ` - ${task.relatedTo}` : ""}`;

function hiddenTaskError() {
  const error = new Error("Task not found");
  error.statusCode = 404;
  return error;
}

function permissionError() {
  const error = new Error("Only administrators can edit task details. Assignees can only change the status");
  error.statusCode = 403;
  return error;
}

function invalidStatusError() {
  const error = new Error("Task status must be Pending, In Progress, or Completed");
  error.statusCode = 422;
  return error;
}

function normalizeTaskStatus(task) {
  if (!task) return task;
  return {
    ...task,
    status: task.status === "Open" ? "Pending" : task.status,
  };
}

function onlyStatusPatch(payload) {
  const keys = Object.keys(payload || {});
  return keys.length === 1 && keys[0] === "status";
}

function assertValidStatus(status) {
  if (!taskStatuses.includes(status)) {
    throw invalidStatusError();
  }
}

const taskController = {
  list: asyncHandler(async (req, res) => {
    const query = isTaskAdmin(req.user)
      ? req.query
      : { ...req.query, ...taskVisibilityFilter(req.user) };
    const { records, meta } = await taskService.list(query);
    return successResponse(res, "Task list fetched", records.map(normalizeTaskStatus), meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const task = await taskService.getById(req.params.id);
    if (!canSeeTask(req.user, task)) {
      throw hiddenTaskError();
    }
    return successResponse(res, "Task fetched", normalizeTaskStatus(task));
  }),

  create: asyncHandler(async (req, res) => {
    const payload = {
      ...req.body,
      status: req.body.status || "Pending",
    };
    assertValidStatus(payload.status);

    const task = await taskService.create(payload, req.user?.sub);
    await recordActivity({
      resourceName: "Task",
      action: "created",
      record: task,
      req,
      describe: describeTask,
      relatedType: "Task",
    });
    return successResponse(res, "Task created", normalizeTaskStatus(task), {}, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const current = await taskService.getById(req.params.id);
    if (!canSeeTask(req.user, current)) {
      throw hiddenTaskError();
    }

    if (req.body.status) {
      assertValidStatus(req.body.status);
    }

    const isAdmin = isTaskAdmin(req.user);
    const isAssignee = canSeeTask(req.user, current) && !isAdmin;
    
    // Admin can edit anything
    // Assignee can only change status
    if (isAssignee && !onlyStatusPatch(req.body)) {
      throw permissionError();
    }

    const task = await taskService.update(req.params.id, req.body, req.user?.sub);
    await recordActivity({
      resourceName: "Task",
      action: "updated",
      record: task,
      req,
      describe: describeTask,
      relatedType: "Task",
    });
    return successResponse(res, "Task updated", normalizeTaskStatus(task));
  }),

  remove: asyncHandler(async (req, res) => {
    // Only admins can delete tasks
    if (!isTaskAdmin(req.user)) {
      const error = new Error("Only administrators can delete tasks");
      error.statusCode = 403;
      throw error;
    }
    
    const task = await taskService.remove(req.params.id);
    if (!task) {
      throw hiddenTaskError();
    }
    await recordActivity({
      resourceName: "Task",
      action: "deleted",
      record: task,
      req,
      describe: describeTask,
      relatedType: "Task",
    });
    return successResponse(res, "Task deleted", normalizeTaskStatus(task));
  }),
};

router.use(authenticate);
router.get("/", authorize(...crmRoles), taskController.list);
router.get("/:id", authorize(...crmRoles), taskController.getById);
router.post(
  "/",
  authorize("Administrator"),
  [
    body("title").isString().notEmpty(),
    body("relatedTo").isString().notEmpty(),
    body("assignee").isString().notEmpty(),
    body("dueDate").isISO8601(),
    body("status").optional().isIn(taskStatuses),
  ],
  validate,
  taskController.create,
);
router.patch("/:id", authorize(...crmRoles), taskController.update);
router.put("/:id", authorize(...crmRoles), taskController.update);
router.delete("/:id", authorize("Administrator"), taskController.remove);

export default router;