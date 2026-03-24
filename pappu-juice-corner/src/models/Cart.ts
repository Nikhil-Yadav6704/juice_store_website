import mongoose, { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

CartSchema.index({ userId: 1, "items.productId": 1 }, { unique: false });

const Cart = models.Cart || model("Cart", CartSchema);
export default Cart;
