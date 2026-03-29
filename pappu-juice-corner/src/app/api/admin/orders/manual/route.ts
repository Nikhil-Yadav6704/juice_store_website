import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, quantity, customerPhone } = await req.json();

    if (!productId || !quantity) {
      return NextResponse.json({ message: "Product and quantity are required" }, { status: 400 });
    }

    await connectToDatabase();

    const [product, settings] = await Promise.all([
      Product.findById(productId),
      Settings.findOne().select("delivery")
    ]);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const subtotal = product.price * quantity;
    const taxRate = settings?.delivery?.taxRate || 0;
    const taxAmount = Math.round(subtotal * taxRate);
    const grandTotal = subtotal + taxAmount;

    // Generate Unique Order ID
    let orderId = "";
    let isUnique = false;
    while (!isUnique) {
      orderId = `#POS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const existing = await Order.findOne({ orderId });
      if (!existing) isUnique = true;
    }

    const newOrder = await Order.create({
      userId: session.user.id, // Attributed to admin
      orderId,
      items: [{
        productId: product._id,
        name: product.name,
        quantity,
        price: product.price,
        imageUrl: product.imageUrl,
        lineTotal: subtotal
      }],
      deliveryType: "instant",
      deliveryFee: 0,
      taxRate,
      taxAmount,
      grandTotal,
      paymentMethod: "COD",
      status: "Preparing",
      customerPhone: customerPhone || "Walk-in"
    });

    // Update admin's juice stats (for tracking total throughput)
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { juicesCount: quantity, ordersCount: 1 }
    });

    return NextResponse.json({ message: "POS Order created", orderId: newOrder.orderId }, { status: 201 });
  } catch (error: any) {
    console.error("Manual Order Error:", error);
    return NextResponse.json({ message: "Failed to create manual order", error: error.message }, { status: 500 });
  }
}
