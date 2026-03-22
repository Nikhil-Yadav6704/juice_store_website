import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "Pending") {
      return NextResponse.json({ message: "Order cannot be cancelled at this stage" }, { status: 400 });
    }

    order.status = "Cancelled";
    order.cancellationReason = "Cancelled by user";
    order.cancelledBy = "user";
    await order.save();

    return NextResponse.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    return NextResponse.json({ message: "Error cancelling order" }, { status: 500 });
  }
}
