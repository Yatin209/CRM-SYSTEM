import Campaign from "../models/Campaign.js";
import { isMongoReady } from "../config/db.js";
import { getMemory } from "../data/memoryStore.js";
import { createGenericService } from "./genericService.js";

const baseCampaignService = createGenericService({
  collectionName: "campaigns",
  Model: Campaign,
  searchable: ["name", "owner", "type", "status"],
});

// Populates the linked Customer (name/company) so the Campaign List/Details
// views can show the real customer name. If the linked customer was deleted,
// Mongoose populate simply resolves to null — no broken references, no crash.
function withCustomerName(record) {
  if (!record) return record;
  const customer = record.customer;
  if (customer && typeof customer === "object" && customer.name) {
    return {
      ...record,
      customer: customer.id || customer._id?.toString(),
      customerName: customer.name,
      customerCompany: customer.company || "",
    };
  }
  if (customer && typeof customer === "string") {
    // Memory-fallback mode: look the customer up by id. If it was deleted,
    // getMemory returns undefined and we gracefully fall back to null.
    const found = getMemory("customers", customer);
    if (found) {
      return { ...record, customerName: found.name, customerCompany: found.company || "" };
    }
    return { ...record, customer: null, customerName: null };
  }
  return { ...record, customer: record.customer || null, customerName: null };
}

export const campaignService = {
  ...baseCampaignService,

  async list(params = {}) {
    const result = await baseCampaignService.list(params);
    if (!isMongoReady()) {
      return { ...result, records: result.records.map(withCustomerName) };
    }
    // Re-fetch the same page of ids with the customer populated. The base
    // list already applied filtering/sorting/pagination; we just enrich it.
    const ids = result.records.map((r) => r.id);
    if (!ids.length) return result;
    const populated = await Campaign.find({ _id: { $in: ids } }).populate("customer", "name company");
    const byId = new Map(populated.map((doc) => [doc.id, doc.toObject()]));
    return {
      ...result,
      records: result.records.map((r) => withCustomerName({ ...(byId.get(r.id) || r), id: r.id })),
    };
  },

  async getById(id) {
    if (isMongoReady()) {
      const record = await Campaign.findById(id).populate("customer", "name company");
      if (!record) return null;
      const value = record.toObject();
      return withCustomerName({ ...value, id: value.id || value._id?.toString() });
    }
    return withCustomerName(await baseCampaignService.getById(id));
  },
};
