import { convertLead, leadService, updateLeadStage } from "../services/leadService.js";
import { createCrudController, recordActivity } from "./crudController.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const describeLead = (r) => `${r?.name || ""}${r?.company ? ` — ${r.company}` : ""}`;

export const leadController = createCrudController(leadService, "Lead", {
  describe: describeLead
});

// Wrap the generic update so that setting status to "Converted" automatically
// creates/moves the record into Customers.
const genericUpdate = leadController.update;
leadController.update = asyncHandler(async (req, res, next) => {
  if (req.body?.status === "Converted") {
    const existing = await leadService.getById(req.params.id);
    if (existing && existing.status !== "Converted") {
      const { status, ...rest } = req.body;
      if (Object.keys(rest).length) {
        await leadService.update(req.params.id, rest, req.user?.sub);
      }
      const result = await convertLead(req.params.id, req.user?.sub);
      if (!result) {
        const error = new Error("Lead not found");
        error.statusCode = 404;
        throw error;
      }
      await recordActivity({
        resourceName: "Lead",
        action: "updated",
        record: result.lead,
        req,
        describe: (r) => `${describeLead(r)} converted to customer`
      });
      if (result.customer) {
        await recordActivity({
          resourceName: "Customer",
          action: "created",
          record: result.customer,
          req,
          describe: (r) => `${r?.name || ""}${r?.company ? ` — ${r.company}` : ""} (from lead conversion)`
        });
      }
      return successResponse(res, "Lead converted", result.lead);
    }
  }
  return genericUpdate(req, res, next);
});

export const moveLeadStage = asyncHandler(async (req, res) => {
  const lead = await updateLeadStage(req.params.id, req.body.stage, req.user?.sub);
  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }
  await recordActivity({
    resourceName: "Lead",
    action: "updated",
    record: lead,
    req,
    describe: (r) => `${describeLead(r)} moved to ${req.body.stage}`
  });
  return successResponse(res, "Lead stage updated", lead);
});

export const convert = asyncHandler(async (req, res) => {
  const result = await convertLead(req.params.id, req.user?.sub);
  if (!result) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }
  await recordActivity({
    resourceName: "Lead",
    action: "updated",
    record: result.lead,
    req,
    describe: (r) => `${describeLead(r)} converted to customer`
  });
  if (result.customer) {
    await recordActivity({
      resourceName: "Customer",
      action: "created",
      record: result.customer,
      req,
      describe: (r) => `${r?.name || ""}${r?.company ? ` — ${r.company}` : ""} (from lead conversion)`
    });
  }
  return successResponse(res, "Lead converted", result);
});
