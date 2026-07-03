import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";
import { LEAD_STATUSES } from "../config/pipelineStages.js";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, index: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    source: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
      index: true,
    },
    // `stage` is kept in sync with `status` (they are the same vocabulary)
    // so the Pipeline board and the Lead status dropdown never drift apart.
    stage: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
      index: true,
    },
    category: {
      type: String,
      enum: ["Strategic", "Enterprise", "Mid Market", "SMB"],
      default: "Mid Market",
      index: true,
    },
    address: { type: String, default: "" },
    value: { type: Number, default: 0, min: 0 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    owner: { type: String, required: true, index: true },
    nextFollowUp: { type: Date },
    expectedClose: { type: Date },
    notes: { type: String },
    convertedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    ...auditFields,
  },
  schemaOptions,
);

leadSchema.index({
  company: "text",
  name: "text",
  email: "text",
  owner: "text",
});

export default mongoose.model("Lead", leadSchema);
