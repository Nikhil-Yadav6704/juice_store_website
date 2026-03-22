import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Settings from "@/models/Settings";

// GET global settings for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Admin Settings GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// UPDATE global settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    await connectDB();
    // Use findOneAndUpdate to ensure we only have one document
    const settings = await Settings.findOneAndUpdate(
      {}, // Empty filter matches the first/only document
      { $set: updates },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Admin Settings PUT Error:", error);
    return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
