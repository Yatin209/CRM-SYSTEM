import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { activityService } from "../services/resourceServices.js";

const ACTION_TONE = { created: "success", updated: "primary", deleted: "danger" };

function defaultDescribe(record) {
  if (!record) return "";
  return record.name || record.title || record.company || record.email || "";
}

// Writes a shared Activity record so every user's Activity feed reflects
// Lead/Customer/Task/Campaign changes made by anyone on the team.
export async function recordActivity({ resourceName, action, record, req, describe, relatedType }) {
  try {
    const actor = req.user?.name || req.user?.email || req.user?.role || "System";
    const actionLabel = action === "updated" ? "updated by" : action === "created" ? "created by" : "deleted by";
    await activityService.create(
      {
        label: `${resourceName} ${actionLabel} ${actor}`,
        detail: (describe || defaultDescribe)(record) || resourceName,
        actor,
        tone: ACTION_TONE[action] || "info",
        relatedType: relatedType || resourceName,
        relatedId: record?.id || record?._id
      },
      req.user?.sub
    );
  } catch (err) {
    // Activity logging is best-effort and must never block the primary CRUD action.
    console.error(`Activity log failed for ${resourceName} ${action}:`, err.message);
  }
}

export function createCrudController(service, resourceName, options = {}) {
  const { describe, relatedType } = options;

  return {
    list: asyncHandler(async (req, res) => {
      const { records, meta } = await service.list(req.query);
      return successResponse(res, `${resourceName} list fetched`, records, meta);
    }),

    getById: asyncHandler(async (req, res) => {
      const record = await service.getById(req.params.id);
      if (!record) {
        const error = new Error(`${resourceName} not found`);
        error.statusCode = 404;
        throw error;
      }
      return successResponse(res, `${resourceName} fetched`, record);
    }),

    create: asyncHandler(async (req, res) => {
      const record = await service.create(req.body, req.user?.sub);
      await recordActivity({ resourceName, action: "created", record, req, describe, relatedType });
      return successResponse(res, `${resourceName} created`, record, {}, 201);
    }),

    update: asyncHandler(async (req, res) => {
      const record = await service.update(req.params.id, req.body, req.user?.sub);
      if (!record) {
        const error = new Error(`${resourceName} not found`);
        error.statusCode = 404;
        throw error;
      }
      await recordActivity({ resourceName, action: "updated", record, req, describe, relatedType });
      return successResponse(res, `${resourceName} updated`, record);
    }),

    remove: asyncHandler(async (req, res) => {
      const record = await service.remove(req.params.id);
      if (!record) {
        const error = new Error(`${resourceName} not found`);
        error.statusCode = 404;
        throw error;
      }
      await recordActivity({ resourceName, action: "deleted", record, req, describe, relatedType });
      return successResponse(res, `${resourceName} deleted`, record);
    })
  };
}
