import { Resend } from "resend";

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: RESEND_API_KEY is missing from environment variables.");
    }
    resend = new Resend(apiKey);
  }
  return resend;
};

export const sendOtpEmail = async (email: string, otp: string) => {
  try {
    const resendInstance = getResend();
    const { data, error } = await resendInstance.emails.send({
      from: "Orchard <onboarding@resend.dev>", // Replace with verified domain in production
      to: [email],
      subject: "Your Verification Code - Pappu Juice Corner",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #1b4321; text-align: center;">Pappu Juice Corner</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your verification code for signing up is:</p>
          <div style="background-color: #f2f5ee; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1b4321;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Pappu Juice Corner. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email Service Exception:", err);
    return { success: false, error: err };
  }
};
