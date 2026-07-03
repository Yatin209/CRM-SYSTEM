import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const communicationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Call", "Email", "WhatsApp", "Ticket", "Meeting"], required: true, index: true },
    subject: { type: String, required: true, trim: true },
    linkedTo: { type: String, required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    owner: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    outcome: { type: String },
    sentiment: { type: String, enum: ["Positive", "Neutral", "Watch"], default: "Neutral" },
    ...auditFields
  },
  schemaOptions
);

communicationSchema.index({ subject: "text", linkedTo: "text", owner: "text" });

export default mongoose.model("Communication", communicationSchema);
