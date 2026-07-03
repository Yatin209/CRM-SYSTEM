import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const activitySchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    detail: { type: String, required: true },
    actor: { type: String, required: true },
    tone: { type: String, enum: ["success", "primary", "warning", "danger", "info"], default: "primary" },
    relatedType: { type: String },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    ...auditFields
  },
  schemaOptions
);

activitySchema.index({ label: "text", detail: "text", actor: "text" });

export default mongoose.model("Activity", activitySchema);
