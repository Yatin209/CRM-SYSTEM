import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    relatedTo: { type: String, required: true, index: true },
    assignee: { type: String, required: true, index: true },
    type: { type: String, enum: ["Follow-up", "Meeting", "Proposal", "Support", "Call"], default: "Follow-up", index: true },
    dueDate: { type: Date, required: true, index: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium", index: true },
    status: { type: String, enum: ["Open", "In Progress", "Completed"], default: "Open", index: true },
    ...auditFields
  },
  schemaOptions
);

taskSchema.index({ title: "text", relatedTo: "text", assignee: "text" });

export default mongoose.model("Task", taskSchema);
