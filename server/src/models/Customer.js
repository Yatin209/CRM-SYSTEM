import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    category: { type: String, enum: ["Strategic", "Enterprise", "Mid Market", "SMB"], default: "Mid Market", index: true },
    industry: { type: String, default: "Other", index: true },
    owner: { type: String, required: true, index: true },
    salesExecutive: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Active", "Renewal", "At Risk", "Inactive"], default: "Active", index: true },
    value: { type: Number, default: 0, min: 0 },
    lastContact: { type: Date },
    notes: { type: String },
    // Links this customer back to the lead it was converted from, so the
    // Pipeline/Customers views can be kept in sync (e.g. auto-removing the
    // customer if the lead is later moved back out of "Converted").
    sourceLeadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null, index: true },
    ...auditFields
  },
  schemaOptions
);

customerSchema.index({ company: "text", name: "text", email: "text" });

export default mongoose.model("Customer", customerSchema);
