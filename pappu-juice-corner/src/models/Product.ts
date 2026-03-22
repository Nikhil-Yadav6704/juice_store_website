import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    isVisible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;
