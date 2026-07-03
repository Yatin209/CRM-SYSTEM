import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { auditFields, schemaOptions } from "./auditFields.js";

const roles = [
  "Administrator",
  "Manager",
  "Sales Executive",
  "Customer Support Executive",
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: roles,
      required: true,
      index: true,
    },

    region: {
      type: String,
      default: "Global",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },

    avatar: {
      type: String,
    },

    performance: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },

    refreshTokenVersion: {
      type: Number,
      default: 0,
    },

    ...auditFields,
  },
  schemaOptions,
);

userSchema.virtual("password").set(function (password) {
  this.passwordHash = bcrypt.hashSync(password, 12);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", userSchema);
