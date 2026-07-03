import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    category: { type: String, enum: ["Strategic", "Enterprise", "Mid Market", "SMB"], default: "Mid Market", index: true },
    owner: { type: String, required: true, index: true },
    salesExecutive: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Active", "Renewal", "At Risk", "Inactive"], default: "Active", index: true },
    value: { type: Number, default: 0, min: 0 },
    lastContact: { type: Date },
    notes: { type: String },
    ...auditFields
  },
  schemaOptions
);

customerSchema.index({ company: "text", name: "text", email: "text" });

export default mongoose.model("Customer", customerSchema);
