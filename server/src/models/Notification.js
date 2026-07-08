import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["Follow-up", "Assignment", "Deal", "Ticket", "System"], default: "System", index: true },
    read: { type: Boolean, default: false, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ...auditFields
  },
  schemaOptions
);

export default mongoose.model("Notification", notificationSchema);
