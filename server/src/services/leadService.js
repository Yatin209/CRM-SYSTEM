import { isMongoReady } from "../config/db.js";
import { createMemory, findOneMemory, getMemory, removeMemory, updateMemory } from "../data/memoryStore.js";
import Customer from "../models/Customer.js";
import Lead from "../models/Lead.js";
import { createGenericService } from "./genericService.js";

export const leadService = createGenericService({
  collectionName: "leads",
  Model: Lead,
  searchable: ["name", "company", "email", "owner", "source"]
});

function buildCustomerPayload(lead, actorId) {
  return {
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    address: lead.address || "Address to confirm",
    category: lead.category || (lead.value > 500000 ? "Enterprise" : "Mid Market"),
    industry: lead.industry || "Other",
    owner: lead.owner,
    status: "Active",
    value: lead.value,
    notes: lead.notes,
    sourceLeadId: lead.id || lead._id,
    createdBy: actorId,
    updatedBy: actorId
  };
}

// Creates (or links to, if one already exists for this email — preventing
// duplicates whether the customer arrived manually or via conversion) the
// Customer record for a converted lead.
export async function convertLead(id, actorId) {
  if (isMongoReady()) {
    const lead = await Lead.findById(id);
    if (!lead) return null;

    let customer = await Customer.findOne({ email: lead.email });
    if (customer) {
      customer.sourceLeadId = lead._id;
      customer.status = "Active";
      customer.updatedBy = actorId;
      await customer.save();
    } else {
      customer = await Customer.create(buildCustomerPayload(lead, actorId));
    }

    lead.status = "Converted";
    lead.convertedCustomer = customer._id;
    lead.updatedBy = actorId;
    await lead.save();
    
    // Return plain objects for consistent response format
    const leadObj = lead.toObject ? lead.toObject() : lead;
    const customerObj = customer.toObject ? customer.toObject() : customer;
    return { lead: leadObj, customer: customerObj };
  }

  const lead = getMemory("leads", id);
  if (!lead) return null;

  const email = (lead.email || "").toLowerCase();
  let customer = findOneMemory("customers", (c) => (c.email || "").toLowerCase() === email);
  if (customer) {
    customer = updateMemory("customers", customer.id, { sourceLeadId: lead.id, status: "Active" }, actorId);
  } else {
    customer = createMemory("customers", buildCustomerPayload(lead, actorId), actorId);
  }

  const updatedLead = updateMemory(
    "leads",
    id,
    { status: "Converted", convertedCustomer: customer.id },
    actorId
  );
  return { lead: updatedLead, customer };
}

// Removes the Customer record that was auto-created for this lead when a
// previously-Converted lead is moved back into any other status/stage —
// keeps Leads, Customers, and Pipeline in sync.
export async function revertConversion(leadId, actorId) {
  if (isMongoReady()) {
    const customer = await Customer.findOne({ sourceLeadId: leadId });
    if (customer) {
      const customerId = customer._id.toString();
      await Customer.findByIdAndDelete(customer._id);
      return customerId;
    }
    return null;
  }

  const customer = findOneMemory("customers", (c) => c.sourceLeadId === leadId);
  if (customer) {
    removeMemory("customers", customer.id);
    return customer.id;
  }
  return null;
}

// Pipeline columns are driven directly by lead.status, so moving a card
// between Pipeline columns is just a status change — including the
// auto-convert / auto-revert side effects.
export async function updateLeadStage(id, status, actorId) {
  const current = isMongoReady() ? await Lead.findById(id) : getMemory("leads", id);
  if (!current) return null;

  const wasConverted = current.status === "Converted";

  if (status === "Converted" && !wasConverted) {
    const result = await convertLead(id, actorId);
    if (!result) return null;
    // Ensure we have plain objects
    const leadObj = result.lead.toObject ? result.lead.toObject() : result.lead;
    const customerObj = result.customer.toObject ? result.customer.toObject() : result.customer;
    return { ...leadObj, customer: customerObj };
  }

  if (wasConverted && status !== "Converted") {
    const removedCustomerId = await revertConversion(id, actorId);
    const updated = await leadService.update(id, { status, convertedCustomer: null }, actorId);
    return { ...updated, removedCustomerId };
  }

  return leadService.update(id, { status }, actorId);
}
