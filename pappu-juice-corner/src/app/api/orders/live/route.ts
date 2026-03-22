import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  await connectToDatabase();

  // Get current hour start and end
  const now = new Date();
  const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
  const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59);

  // Count orders placed in the current hour (for Hourly Batch only as per logical interpretation or all orders)
  // We will count all orders for the live counter.
  const count = await Order.countDocuments({
    createdAt: {
      $gte: startOfHour,
      $lte: endOfHour,
    },
  });

  return NextResponse.json({
    count,
    nextBatchEnd: endOfHour.toISOString(),
    currentTime: now.toISOString(),
  });
}
