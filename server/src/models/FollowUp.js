import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const followUpSchema = new mongoose.Schema(
  {
    relatedType: { type: String, enum: ["Lead", "Customer"], required: true, index: true },
    relatedName: { type: String, required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    reminderAt: { type: Date, required: true, index: true },
    notes: { type: String, required: true },
    outcome: { type: String, default: "Scheduled" },
    nextFollowUp: { type: Date },
    owner: { type: String, required: true, index: true },
    ...auditFields
  },
  schemaOptions
);

export default mongoose.model("FollowUp", followUpSchema);
