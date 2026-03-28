import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  await connectToDatabase();

  // BUG 3: Calculate next batch end in IST (next hour boundary)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const nextBatchEndIST = new Date(istTime);
  nextBatchEndIST.setUTCMinutes(59, 59, 999);
  const nextBatchEnd = new Date(nextBatchEndIST.getTime() - istOffset);

  // BUG 2: Get start of current clock hour in IST for filtering historical orders
  const startOfCurrentHourIST = new Date(istTime);
  startOfCurrentHourIST.setUTCMinutes(0, 0, 0);
  const startOfHourUTC = new Date(startOfCurrentHourIST.getTime() - istOffset);

  // BUG 1 & 2: Query for current hour active orders with corrected status
  const activeOrders = await Order.find({
    status: { $in: ["Pending", "Preparing", "Out for Delivery"] },
    createdAt: { $gte: startOfHourUTC }
  });

  const count = activeOrders.reduce((total, order) => {
    return total + order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }, 0);

  return NextResponse.json({
    count,
    nextBatchEnd: nextBatchEnd.toISOString(),
    currentTime: now.toISOString(),
  });
}
