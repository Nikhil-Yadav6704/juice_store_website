import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const SEED_PRODUCTS = [
  {
    name: "The Guardian",
    category: "Immunity",
    description: "Cold-pressed ginger, turmeric, orange, lemon, and a dash of cayenne. A fiery shot of cellular defense.",
    price: 350,
    imageUrl: "https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    isVisible: true,
  },
  {
    name: "Liquid Greens",
    category: "Detox",
    description: "Kale, spinach, celery, green apple, cucumber, and parsley. The ultimate alkaline reset.",
    price: 400,
    imageUrl: "https://images.unsplash.com/photo-1622484213759-42b3687be69d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    isVisible: true,
  },
  {
    name: "Golden Hour",
    category: "Fresh Juices",
    description: "Carrot, pineapple, ginger, and maca root. Sweet, earthy, and vibrantly energizing.",
    price: 300,
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451b02?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    isVisible: true,
  },
  {
    name: "Berry Brain",
    category: "Smoothies",
    description: "Wild blueberries, acai, banana, almond milk, and raw honey. Antioxidant rich.",
    price: 450,
    imageUrl: "https://images.unsplash.com/photo-1638176066666-ffb2f013c70e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    isVisible: true,
  },
  {
    name: "Activated Charcoal Lemonade",
    category: "Detox",
    description: "Fresh lemon, coconut charcoal, agave, and alkaline water. Purifies from the inside out.",
    price: 350,
    imageUrl: "https://images.unsplash.com/photo-1546887561-ebdc191fc726?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    isVisible: true,
  },
  {
    name: "Beetroot Stamina",
    category: "Energy",
    description: "Raw beet, apple, lemon, and a hint of ginger. Nitric oxide booster for deep energy.",
    price: 380,
    imageUrl: "https://images.unsplash.com/photo-1615486511484-92e172054ff1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    isVisible: true,
  }
];

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get("all") === "true";
  
  let products = showAll ? await Product.find({}) : await Product.find({ isVisible: true });

  if (products.length === 0) {
    // Seed initial products for the demo
    await Product.insertMany(SEED_PRODUCTS);
    products = await Product.find({ isVisible: true });
  }

  // Auto-seed admin user for the demo
  const adminExists = await User.findOne({ email: "admin@pappujuice.com" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      fullName: "Demo Admin",
      email: "admin@pappujuice.com",
      phone: "0000000000",
      deliveryAddress: "Admin Office",
      password: hashedPassword,
      role: "admin",
      status: "active",
    });
    console.log("Seeded Demo Admin: admin@pappujuice.com / admin123");
  }

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const product = await Product.create({
      name: body.name,
      price: body.price,
      category: body.category || "Fresh Juices",
      description: body.description || "",
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isVisible: body.isVisible !== undefined ? body.isVisible : true,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
