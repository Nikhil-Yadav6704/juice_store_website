import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    deliveryAddress: { type: String },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active", index: true },
    juicesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
