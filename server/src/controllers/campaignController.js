import { createCrudController } from "./crudController.js";
import { campaignService } from "../services/campaignService.js";

export const campaignController = createCrudController(
  campaignService,
  "Campaign",
  { describe: (r) => r?.name || "" },
);
