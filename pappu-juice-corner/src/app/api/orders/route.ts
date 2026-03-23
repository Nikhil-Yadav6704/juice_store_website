import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import crypto from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const orders = await Order.find({ userId: session.user.id })
    .populate("items.productId", "imageUrl")
    .select("-__v")
    .sort({ createdAt: -1 });
  
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { deliveryType } = await req.json();
    
    await connectToDatabase();
    
    // Get Settings, User, and Cart in parallel
    const Settings = (await import("@/models/Settings")).default;
    const User = (await import("@/models/User")).default;
    
    const [settings, cart] = await Promise.all([
      Settings.findOne().select("shop delivery"),
      Cart.findOne({ userId: session.user.id }).populate({
        path: "items.productId",
        select: "name price imageUrl"
      })
    ]);

    // Shop Status Check
    const shopSettings = settings?.shop || { isManualClose: false, openingTime: "09:00", closingTime: "21:00" };
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const isInsideHours = currentTime >= shopSettings.openingTime && currentTime <= shopSettings.closingTime;
    const isShopOpen = !shopSettings.isManualClose && isInsideHours;

    if (!isShopOpen) {
      return NextResponse.json({ message: "Store is currently closed. We are open from " + shopSettings.openingTime + " to " + shopSettings.closingTime }, { status: 403 });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    let totalJuices = 0;
    const orderItems = cart.items.map((item: any) => {
      if (!item.productId) return null; // Safety check
      const lineTotal = item.quantity * item.productId.price;
      subtotal += lineTotal;
      totalJuices += item.quantity;
      return {
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        lineTotal,
      };
    }).filter(Boolean);

    if (orderItems.length === 0) {
      return NextResponse.json({ message: "No valid items in cart" }, { status: 400 });
    }

    let deliveryFee = 0;
    if (deliveryType === "instant") deliveryFee = settings?.delivery?.instantPrice || 5.50;
    if (deliveryType === "super_instant") deliveryFee = settings?.delivery?.superInstantPrice || 9.00;

    const grandTotal = subtotal + deliveryFee;

    // Create Order with unique ID check (Fix for Problem 1)
    let orderId = "";
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      orderId = `#PJC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const existing = await Order.findOne({ orderId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Could not generate a unique Order ID after 10 attempts");
    }
    
    const newOrder = await Order.create({
      userId: session.user.id,
      orderId,
      items: orderItems,
      deliveryType,
      deliveryFee,
      grandTotal,
      paymentMethod: "COD",
      status: "Pending",
    });

    // Increment user's juice count for rewards
    await User.findByIdAndUpdate(session.user.id, { $inc: { juicesCount: totalJuices } });

    // Clear Cart reliably (Fix for Problem 1)
    await Cart.findOneAndUpdate({ userId: session.user.id }, { $set: { items: [] } });

    return NextResponse.json({ message: "Order placed successfully", orderId: newOrder.orderId }, { status: 201 });
  } catch (error: any) {
    // Problem 1: Detailed error logging
    console.error("CRITICAL: Order placement failed for user:", session.user.id, "| Error:", error.message || error);
    if (error.stack) console.error(error.stack);
    
    return NextResponse.json({ 
      message: "Failed to place order. " + (error.message || "Please try again."),
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    }, { status: 500 });
  }
}
