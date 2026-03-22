import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, cancellationReason, cancelledBy } = await req.json();
    await connectToDatabase();
    
    const updateData: any = { status };
    if (status === 'Cancelled') {
      updateData.cancellationReason = cancellationReason || "Cancelled by admin";
      updateData.cancelledBy = cancelledBy || "admin";
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ message: "Error updating order" }, { status: 500 });
  }
}
