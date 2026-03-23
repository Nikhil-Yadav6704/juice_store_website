import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).select("-password");
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Profile GET API error (plural):", error.message, error.stack);
    return NextResponse.json(
      { message: "Failed to load profile", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fullName, phone, email, deliveryAddress, currentPassword, newPassword } = await req.json();

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.deliveryAddress = deliveryAddress || user.deliveryAddress;

    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Incorrect current password" }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user, 
      profile: user // Satisfy any frontend expecting .profile
    });
  } catch (error: any) {
    console.error("Profile PUT API error:", error.message, error.stack);
    return NextResponse.json({ message: "Failed to update profile", error: error.message }, { status: 500 });
  }
}
