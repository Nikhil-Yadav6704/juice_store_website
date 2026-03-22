import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Cart from "@/models/Cart";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ count: 0 });
  }

  await connectToDatabase();
  const cart = await Cart.findOne({ userId: session.user.id });

  if (!cart) {
    return NextResponse.json({ count: 0 });
  }

  const count = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
  return NextResponse.json({ count });
}
