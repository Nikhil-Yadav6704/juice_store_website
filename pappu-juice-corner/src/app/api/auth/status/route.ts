import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ status: "unauthenticated" });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select("status");

    if (!user) {
      return NextResponse.json({ status: "not_found" });
    }

    return NextResponse.json({ status: user.status });
  } catch (error) {
    console.error("Auth Status API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
