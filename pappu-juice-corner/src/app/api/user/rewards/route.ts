import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id).select("juicesCount");
    const settings = await Settings.findOne().select("rewards");

    return NextResponse.json({
      juicesCount: user?.juicesCount || 0,
      rewards: settings?.rewards || { enabled: false, threshold: 10, rewardText: "" }
    });
  } catch (error) {
    console.error("Rewards API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
