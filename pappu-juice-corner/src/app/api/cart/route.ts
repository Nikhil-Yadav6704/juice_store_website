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

    return NextResponse.json(cart);
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

  try {
    const { productId, action } = await req.json(); // action = "add" | "remove" | "decrement"
    await connectToDatabase();

    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = new Cart({ userId: session.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex((p: any) => p.productId.toString() === productId);

    if (action === "add") {
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    } else if (action === "decrement") {
      if (itemIndex > -1) {
        if (cart.items[itemIndex].quantity > 1) {
          cart.items[itemIndex].quantity -= 1;
        } else {
          cart.items.splice(itemIndex, 1);
        }
      }
    } else if (action === "remove") {
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
      }
    }

    await cart.save();
    return NextResponse.json({ message: "Cart updated", cart });
  } catch (error: any) {
    console.error("Cart POST API error:", error.message, error.stack);
    return NextResponse.json({ message: "Error updating cart" }, { status: 500 });
  }
}
