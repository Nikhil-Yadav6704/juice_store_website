import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const result = await User.findOneAndUpdate(
      { email: "admin@orchard.com" },
      {
        $set: {
          fullName: "Demo Admin",
          phone: "+15550000001",
          deliveryAddress: "AdminHQ",
          password: hashedPassword,
          role: "admin",
          status: "active"
        }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, email: result.email });
  } catch (error) {
    console.error("Seed error", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
