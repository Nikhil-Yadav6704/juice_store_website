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
  const orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 });
  
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
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: session.user.id }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cart.items.map((item: any) => {
      const lineTotal = item.quantity * item.productId.price;
      subtotal += lineTotal;
      return {
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        lineTotal,
      };
    });

    let deliveryFee = 0;
    if (deliveryType === "instant") deliveryFee = 50;
    if (deliveryType === "super_instant") deliveryFee = 100;

    const grandTotal = subtotal + deliveryFee;

    // Create Order
    const orderId = `#PJC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    
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

    // Clear Cart
    cart.items = [];
    await cart.save();

    return NextResponse.json({ message: "Order placed successfully", orderId: newOrder.orderId }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ message: "Failed to place order" }, { status: 500 });
  }
}
