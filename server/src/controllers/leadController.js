import { convertLead, leadService, updateLeadStage } from "../services/leadService.js";
import { notificationService } from "../services/resourceServices.js";
import { createCrudController, recordActivity } from "./crudController.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const describeLead = (r) => `${r?.name || ""}${r?.company ? ` — ${r.company}` : ""}`;

const genericLeadController = createCrudController(leadService, "Lead", {
  describe: describeLead
});

async function notifyAssignee(lead, actorId) {
  if (!lead?.ownerId) return;
  try {
    await notificationService.create(
      {
        title: "New lead assigned",
        message: `You have been assigned the lead "${describeLead(lead)}".`,
        type: "Assignment",
        read: false,
        user: lead.ownerId
      },
      actorId
    );
  } catch (err) {
    console.error("Failed to notify lead assignee:", err.message);
  }
}

async function recordConversionActivity(req, lead, customer) {
  await recordActivity({
    resourceName: "Lead",
    action: "updated",
    record: lead,
    req,
    describe: (r) => `${describeLead(r)} converted to customer`
  });
  if (customer) {
    await recordActivity({
      resourceName: "Customer",
      action: "created",
      record: customer,
      req,
      describe: (r) => `${r?.name || ""}${r?.company ? ` — ${r.company}` : ""} (from lead conversion)`
    });
  }
}

async function recordRevertActivity(req, lead, removedCustomerId) {
  await recordActivity({
    resourceName: "Lead",
    action: "updated",
    record: lead,
    req,
    describe: (r) => `${describeLead(r)} moved back to ${r.status} — removed from Customers`
  });
  if (removedCustomerId) {
    await recordActivity({
      resourceName: "Customer",
      action: "deleted",
      record: { id: removedCustomerId, name: lead?.name, company: lead?.company },
      req,
      describe: () => `${describeLead(lead)} (lead reverted from Converted)`
    });
  }
}

export const leadController = {
  ...genericLeadController,
  create: asyncHandler(async (req, res) => {
    const record = await leadService.create(req.body, req.user?.sub);
    await recordActivity({ resourceName: "Lead", action: "created", record, req, describe: describeLead });
    await notifyAssignee(record, req.user?.sub);
    return successResponse(res, "Lead created", record, {}, 201);
  })
};

// Pipeline drag-and-drop — `stage` here is one of the Pipeline column
// values, which map 1:1 onto lead.status. Moving into "Converted"
// auto-creates/links the Customer; moving a Converted lead into any other
// column auto-removes the linked Customer, keeping everything in sync.
export const moveLeadStage = asyncHandler(async (req, res) => {
  try {
    const status = req.body.stage;
    const result = await updateLeadStage(req.params.id, status, req.user?.sub);
    if (!result) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
    const { customer, removedCustomerId, ...lead } = result;

    if (customer) {
      await recordConversionActivity(req, lead, customer);
    } else if (removedCustomerId) {
      await recordRevertActivity(req, lead, removedCustomerId);
    } else {
      await recordActivity({
        resourceName: "Lead",
        action: "updated",
        record: lead,
        req,
        describe: (r) => `${describeLead(r)} moved to ${status}`
      });
    }

    return successResponse(res, "Lead stage updated", { ...lead, customer, removedCustomerId });
  } catch (error) {
    console.error("Lead stage update error:", error);
    if (error.statusCode) {
      throw error;
    }
    const err = new Error(error.message || "Failed to update lead stage. Please try again.");
    err.statusCode = 500;
    throw err;
  }
});

// Handles normal field edits. When the status is being set to "Converted"
// (or away from it) this applies the same auto-convert / auto-revert sync
// as the Pipeline board.
export const updateLead = asyncHandler(async (req, res) => {
  try {
    if (req.body.status !== undefined) {
      const { status, ...rest } = req.body;
      if (Object.keys(rest).length) {
        await leadService.update(req.params.id, rest, req.user?.sub);
      }
      const result = await updateLeadStage(req.params.id, status, req.user?.sub);
      if (!result) {
        const error = new Error("Lead not found");
        error.statusCode = 404;
        throw error;
      }
      const { customer, removedCustomerId, ...lead } = result;

      if (customer) {
        await recordConversionActivity(req, lead, customer);
      } else if (removedCustomerId) {
        await recordRevertActivity(req, lead, removedCustomerId);
      } else {
        await recordActivity({ resourceName: "Lead", action: "updated", record: lead, req, describe: describeLead });
      }
      if (req.body.ownerId) {
        await notifyAssignee(lead, req.user?.sub);
      }
      return successResponse(res, "Lead updated", { ...lead, customer, removedCustomerId });
    }

    const record = await leadService.update(req.params.id, req.body, req.user?.sub);
    if (!record) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
    await recordActivity({ resourceName: "Lead", action: "updated", record, req, describe: describeLead });
    if (req.body.ownerId) {
      await notifyAssignee(record, req.user?.sub);
    }
    return successResponse(res, "Lead updated", record);
  } catch (error) {
    console.error("Lead update error:", error);
    if (error.statusCode) {
      throw error;
    }
    const err = new Error(error.message || "Failed to update lead. Please try again.");
    err.statusCode = 500;
    throw err;
  }
});

export const convert = asyncHandler(async (req, res) => {
  try {
    const result = await convertLead(req.params.id, req.user?.sub);
    if (!result) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }
    await recordConversionActivity(req, result.lead, result.customer);
    return successResponse(res, "Lead converted", result);
  } catch (error) {
    // Log the actual error for debugging
    console.error("Lead conversion error:", error);
    // If it's already a proper error with statusCode, rethrow it
    if (error.statusCode) {
      throw error;
    }
    // Otherwise wrap it in a user-friendly error
    const err = new Error(error.message || "Failed to convert lead. Please try again.");
    err.statusCode = 500;
    throw err;
  }
});
