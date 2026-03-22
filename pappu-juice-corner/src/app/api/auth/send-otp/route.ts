import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import OtpAuth from "@/models/OtpAuth";
import { sendOtpEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    await connectToDatabase();

    // Store OTP in database with 5 minute expiry
    await OtpAuth.findOneAndUpdate(
      { email, type: "signup" },
      { 
        otp, 
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
      },
      { upsert: true, new: true }
    );

    // Send email via Resend
    const result = await sendOtpEmail(email, otp);
    
    if (!result.success) {
      const errorMessage = (result.error as any)?.message || "Failed to send email. Check API key.";
      console.error("OTP Email Failure Details:", result.error);
      return NextResponse.json({ 
        message: errorMessage,
        error: result.error 
      }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
