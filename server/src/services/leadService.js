import { isMongoReady } from "../config/db.js";
import { createMemory, getMemory, updateMemory } from "../data/memoryStore.js";
import Customer from "../models/Customer.js";
import Communication from "../models/Communication.js";
import Lead from "../models/Lead.js";
import { createGenericService } from "./genericService.js";
import { LEAD_STATUSES } from "../config/pipelineStages.js";

const baseLeadService = createGenericService({
  collectionName: "leads",
  Model: Lead,
  searchable: ["name", "company", "email", "owner", "source"],
});

// `stage` and `status` share the exact same vocabulary (see pipelineStages.js)
// so the pipeline board is always in sync with the lead's status. Any create
// or update that touches `status` keeps `stage` mirrored automatically —
// this is the only place that needs to know about that relationship.
function syncStageWithStatus(payload) {
  if (payload && payload.status && LEAD_STATUSES.includes(payload.status)) {
    return { ...payload, stage: payload.status };
  }
  return payload;
}

export const leadService = {
  ...baseLeadService,
  async create(payload, actorId) {
    const withStatus = { status: "New", ...payload };
    return baseLeadService.create(syncStageWithStatus(withStatus), actorId);
  },
  async update(id, payload, actorId) {
    return baseLeadService.update(id, syncStageWithStatus(payload), actorId);
  },
};

// Used by the Pipeline board drag-and-drop: moving a card to a column
// changes the lead's status (and, in turn, its stage) to that column.
export async function updateLeadStage(id, status, actorId) {
  if (status === "Converted") {
    const result = await convertLead(id, actorId);
    return result?.lead || null;
  }
  return leadService.update(id, { status }, actorId);
}

export async function convertLead(id, actorId) {
  if (isMongoReady()) {
    const lead = await Lead.findById(id);
    if (!lead) return null;
    const customer = await Customer.create({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      address: lead.address || "",
      category:
        lead.category || (lead.value > 500000 ? "Enterprise" : "Mid Market"),
      owner: lead.owner,
      status: "Active",
      value: lead.value,
      notes: lead.notes,
      createdBy: actorId,
      updatedBy: actorId,
    });
    lead.status = "Converted";
    lead.stage = "Converted";
    lead.convertedCustomer = customer.id;
    lead.updatedBy = actorId;
    await lead.save();

    await Communication.updateMany(
      { lead: lead.id },
      { $set: { customer: customer.id, linkedTo: "customer" } },
    );
    return { lead, customer };
  }

  const lead = getMemory("leads", id);
  if (!lead) return null;
  const customer = createMemory(
    "customers",
    {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      address: lead.address || "",
      category:
        lead.category || (lead.value > 500000 ? "Enterprise" : "Mid Market"),
      owner: lead.owner,
      status: "Active",
      value: lead.value,
      notes: lead.notes,
    },
    actorId,
  );
  const updatedLead = updateMemory(
    "leads",
    id,
    { status: "Converted", stage: "Converted" },
    actorId,
  );
  return { lead: updatedLead, customer };
}
