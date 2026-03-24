import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  await connectToDatabase();

  // Get current hour start and end in IST (UTC+5:30)
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  // End of current IST Hour
  const endOfHourIST = new Date(istTime);
  endOfHourIST.setUTCMinutes(59, 59, 999);
  
  // Convert back to UTC for output
  const endOfHourUTC = new Date(endOfHourIST.getTime() - (5.5 * 60 * 60 * 1000));

  // Sum all juices in orders that are not yet delivered or cancelled
  const activeOrders = await Order.find({
    status: { $in: ["Pending", "Preparing", "Shipped"] },
  });

  const count = activeOrders.reduce((total, order) => {
    return total + order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }, 0);

  return NextResponse.json({
    count,
    nextBatchEnd: endOfHourUTC.toISOString(),
    currentTime: now.toISOString(),
  });
}
