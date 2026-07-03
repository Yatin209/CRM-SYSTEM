import Campaign from "../models/Campaign.js";
import { createGenericService } from "./genericService.js";

export const campaignService = createGenericService({
  collectionName: "campaigns",
  Model: Campaign,
  searchable: ["name", "owner", "type", "status"],
});
