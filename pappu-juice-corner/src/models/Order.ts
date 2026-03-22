import mongoose, { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
    deliveryType: {
      type: String,
      enum: ["hourly", "instant", "super_instant"],
      required: true,
    },
    deliveryFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['admin', 'user'] },
  },
  { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);
export default Order;
