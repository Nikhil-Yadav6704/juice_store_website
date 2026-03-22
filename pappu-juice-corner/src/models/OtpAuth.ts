import mongoose, { Schema, model, models } from "mongoose";

const OtpAuthSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ["signup", "reset"], default: "signup" },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL Index
  },
  { timestamps: true }
);

const OtpAuth = models.OtpAuth || model("OtpAuth", OtpAuthSchema);
export default OtpAuth;
