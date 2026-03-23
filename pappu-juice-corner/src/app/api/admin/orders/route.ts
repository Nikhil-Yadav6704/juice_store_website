import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User"; // Ensure model is registered for populate
import Product from "@/models/Product"; // Ensure model is registered for populate

export async function GET() {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find()
      .populate("userId", "fullName phone email juicesCount")
      .populate("items.productId", "imageUrl")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Admin orders API error:", error.message, error.stack);
    return NextResponse.json(
      { message: "Failed to load orders", error: error.message },
      { status: 500 }
    );
  }
}
