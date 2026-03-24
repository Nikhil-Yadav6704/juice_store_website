import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const cart = await Cart.findOne({ userId: session.user.id }).populate("items.productId");

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Deduplicate items (Safety fallback)
    const mergedItems: any[] = [];
    const itemMap = new Map();

    cart.items.forEach((item: any) => {
      const pid = item.productId?._id?.toString() || item.productId?.toString();
      if (itemMap.has(pid)) {
        itemMap.get(pid).quantity += item.quantity;
      } else {
        const newItem = JSON.parse(JSON.stringify(item));
        itemMap.set(pid, newItem);
        mergedItems.push(newItem);
      }
    });

    return NextResponse.json({ ...cart.toObject(), items: mergedItems });
  } catch (error: any) {
    console.error("Cart GET API error:", error.message, error.stack);
    return NextResponse.json(
      { message: "Failed to load cart", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const MAX_RETRIES = 3;
  let retries = 0;

  try {
    const { productId, action, quantity: qtyDiff } = await req.json();
    await connectToDatabase();

    while (retries < MAX_RETRIES) {
      try {
        let updatedCart;
        const amount = qtyDiff !== undefined ? qtyDiff : (action === "add" ? 1 : action === "decrement" ? -1 : 0);

        if (action === "add" || (qtyDiff !== undefined && qtyDiff > 0)) {
          // 1. Try to increment existing item
          updatedCart = await Cart.findOneAndUpdate(
            { userId, "items.productId": productId },
            { $inc: { "items.$.quantity": amount } },
            { new: true }
          );

          // 2. If not found, push new item
          if (!updatedCart && amount > 0) {
            updatedCart = await Cart.findOneAndUpdate(
              { userId },
              { $push: { items: { productId, quantity: amount } } },
              { upsert: true, new: true }
            );
          }
        } else if (action === "decrement" || (qtyDiff !== undefined && qtyDiff < 0)) {
          // 1. Find the item to check quantity if decrementing via action
          const cart = await Cart.findOne({ userId, "items.productId": productId });
          const item = cart?.items.find((i: any) => i.productId.toString() === productId);

          if (item) {
            const currentQty = item.quantity;
            const newQty = currentQty + amount;

            if (newQty > 0) {
              updatedCart = await Cart.findOneAndUpdate(
                { userId, "items.productId": productId },
                { $inc: { "items.$.quantity": amount } },
                { new: true }
              );
            } else {
              // Remove item if quantity falls to 0 or below
              updatedCart = await Cart.findOneAndUpdate(
                { userId },
                { $pull: { items: { productId } } },
                { new: true }
              );
            }
          }
        } else if (action === "remove") {
          updatedCart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId } } },
            { new: true }
          );
        }

        return NextResponse.json({ message: "Cart updated", cart: updatedCart });
      } catch (error: any) {
        if (error.code === 112 || error.message.includes("WriteConflict")) {
          retries++;
          if (retries >= MAX_RETRIES) {
            return NextResponse.json({ message: "Cart is busy, please try again" }, { status: 409 });
          }
          await new Promise((resolve) => setTimeout(resolve, 50 * retries));
          continue;
        }
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Cart POST API error:", error.message, error.stack);
    return NextResponse.json({ message: "Error updating cart", error: error.message }, { status: 500 });
  }
}
