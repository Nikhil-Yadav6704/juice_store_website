import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fullName, email, role } = await req.json();

    if (!fullName || !email || !role) {
      return NextResponse.json({ message: "Full name, email, and role are required" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "A user with this email already exists" }, { status: 409 });
    }

    // Generate a temporary random password
    const tempPassword = crypto.randomBytes(5).toString("hex"); // 10 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Map UI roles to DB roles if necessary
    let dbRole = "user";
    if (role === "System Administrator") dbRole = "admin";

    const newUser = await User.create({
      fullName,
      email,
      role: dbRole,
      password: hashedPassword,
      status: "active",
      phone: "Not Set", // Placeholder for manual creation
      deliveryAddress: "Not Set" // Placeholder for manual creation
    });

    return NextResponse.json({ 
      message: "User created successfully", 
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      },
      tempPassword 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Admin User Creation Error:", error);
    return NextResponse.json({ message: "Failed to create user", error: error.message }, { status: 500 });
  }
}
