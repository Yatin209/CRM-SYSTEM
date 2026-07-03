import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "Email",
        "WhatsApp",
        "SMS",
        "Social Media",
        "Referral",
        "Event",
        "Cold Calling",
        "Other",
      ],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Active", "Paused", "Completed", "Cancelled"],
      default: "Draft",
      index: true,
    },

    owner: {
      type: String,
      required: true,
      index: true,
    },

    budget: {
      type: Number,
      default: 0,
      min: 0,
    },

    expectedRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    leadsGenerated: {
      type: Number,
      default: 0,
      min: 0,
    },

    convertedCustomers: {
      type: Number,
      default: 0,
      min: 0,
    },

    roi: {
      type: Number,
      default: 0,
    },

    ...auditFields,
  },
  schemaOptions,
);

campaignSchema.index({
  name: "text",
  owner: "text",
  type: "text",
});

export default mongoose.model("Campaign", campaignSchema);
