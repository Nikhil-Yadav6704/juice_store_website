import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    
    const ghostEmails = ["admin@pappujuice.com", "admin@orchard.com", "admin@sipfresh.com"];
    
    // Find all admins with these emails excluding the current logged-in user's email
    const result = await User.deleteMany({
      email: { $in: ghostEmails },
      _id: { $ne: session.user.id }
    });

    return NextResponse.json({ 
      message: "Cleanup successful", 
      deletedCount: result.deletedCount,
      keptUser: session.user.email
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Cleanup failed", error: error.message }, { status: 500 });
  }
}
