import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  await connectToDatabase();

  // Get current hour start and end
  const now = new Date();
  const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
  const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59);

  // Sum all juices in orders that are not yet delivered or cancelled
  const activeOrders = await Order.find({
    status: { $in: ["Pending", "Preparing", "Shipped"] },
  });

  const count = activeOrders.reduce((total, order) => {
    return total + order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }, 0);

  return NextResponse.json({
    count,
    nextBatchEnd: endOfHour.toISOString(),
    currentTime: now.toISOString(),
  });
}
