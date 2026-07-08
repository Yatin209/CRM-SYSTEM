import mongoose from "mongoose";
import { schemaOptions } from "./auditFields.js";

const passwordResetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date }
  },
  schemaOptions
);

export default mongoose.model("PasswordReset", passwordResetSchema);
