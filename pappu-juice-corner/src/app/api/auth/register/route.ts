import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import OtpAuth from "@/models/OtpAuth";

export async function POST(req: Request) {
  try {
    const { fullName, phone, email, deliveryAddress, password, otp } = await req.json();

    if (!fullName || !phone || !email || !deliveryAddress || !password || !otp) {
      return NextResponse.json({ message: "All fields including OTP are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify OTP
    const otpRecord = await OtpAuth.findOne({ email, otp, type: "signup" });
    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    // Check if OTP is expired (Mongoose TTL might take time to delete, so double check)
    if (new Date() > otpRecord.expiresAt) {
        return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email or phone already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      phone,
      email,
      deliveryAddress,
      password: hashedPassword,
      role: "user",
      status: "active",
    });

    // Delete the used OTP
    await OtpAuth.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
