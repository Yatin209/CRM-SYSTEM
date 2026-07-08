import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const reportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["Customer", "Lead", "Sales", "Follow-up", "Revenue", "Activity"], required: true, index: true },
    period: { type: String, enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    generatedBy: { type: String, required: true },
    fileUrl: { type: String },
    summary: { type: mongoose.Schema.Types.Mixed },
    ...auditFields
  },
  schemaOptions
);

export default mongoose.model("Report", reportSchema);
