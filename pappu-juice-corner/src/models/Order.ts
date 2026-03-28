import mongoose, { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  lineTotal: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
    deliveryType: {
      type: String,
      enum: ["hourly", "instant", "super_instant"],
      required: true,
    },
    deliveryFee: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['admin', 'user'] },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
