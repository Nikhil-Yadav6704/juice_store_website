import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User"; // Ensure model is registered for populate
import Product from "@/models/Product"; // Ensure model is registered for populate

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find()
      .populate("userId", "fullName phone email juicesCount")
      .populate("items.productId", "imageUrl")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('ADMIN ORDERS FULL ERROR:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: error.message,
      type: error.name,
      code: error.code 
    }, { status: 500 });
  }
}
