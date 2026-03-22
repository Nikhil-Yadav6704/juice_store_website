# Deployment & Authentication Guide for The Orchard (Pappu Juice Corner)

## 1. Deployment Strategies

### Option A: Completely Free Deployment
You can deploy this Next.js 14 application completely for free using generous free tiers from modern cloud providers.

#### Stack:
- **Frontend & Serverless API:** Vercel (Free Hobby Tier)
- **Database:** MongoDB Atlas (Free Shared Tier - 512MB storage)
- **Email Sending (for OTP/Auth):** Resend or SendGrid (Free Tier - 100 emails/day)

#### Steps to Deploy for Free:
1. **GitHub Repository:** Push your entire codebase to a private or public GitHub repository. You can do this by running `git init`, `git add .`, `git commit -m "initial commit"`, and pushing to a newly created repo.
2. **MongoDB Atlas Setup:**
   - Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - Create a new free "M0" shared cluster. 
   - Go to "Database Access" on the left sidebar and create a database user with a secure password.
   - Go to "Network Access" and allow access from anywhere by adding IP `0.0.0.0/0`.
   - Go back to "Databases", click "Connect" -> "Drivers", and copy your connection string (`MONGODB_URI`). Replace `<password>` with your database user password.
3. **Vercel Deployment:**
   - Create a free account on [Vercel](https://vercel.com/signup) and connect your GitHub account.
   - Click "Add New..." -> "Project" and select your repository.
   - Under "Environment Variables", add:
     - `MONGODB_URI`: (Your Atlas connection string)
     - `NEXTAUTH_URL`: `https://your-vercel-app-url.vercel.app` (You can update this after Vercel generates the URL)
     - `NEXTAUTH_SECRET`: (Generate a random secure string, e.g., using `openssl rand -base64 32` or an online generator)
   - Click "Deploy". Vercel will automatically build and host your Next.js application globally using their serverless Edge network.

### Option B: Professional / Paid Deployment
If you expect high commercial traffic, need a custom domain, or require higher database performance limits, use a paid setup.

#### Recommended Stack (Estimated $20-$30/month):
- **Hosting:** Vercel Pro ($20/month base) OR AWS EC2 / DigitalOcean VPS ($5-$10/month)
- **Database:** MongoDB Atlas Dedicated Cluster (e.g., M10 starting at ~$60/month, or a self-hosted MongoDB on a $5 DigitalOcean droplet)
- **Email Sending:** Postmark or AWS SES (Pay as you go, ~$0.10 to $1.00 per 1000 emails)
- **Domain Name:** Namecheap, GoDaddy, or Cloudflare (~$10/year)

#### Steps for VPS Deployment (Alternative to Vercel):
If you want to avoid Vercel and host it yourself:
1. **Get a VPS:** Buy a $5/month Ubuntu server droplet on DigitalOcean or AWS Lightsail.
2. **Setup Server:** SSH into your server, install Node.js, clone your repo, run `npm install`, and `npm run build`.
3. **Run with PM2:** Use the `pm2` tool (`npm install -g pm2`) and run `pm2 start npm --name "orchard" -- start` to keep the Next.js app running in the background persistently.
4. **Nginx Reverse Proxy:** Install Nginx on the server, point your custom domain DNS records to the VPS IPv4 address, and configure a reverse proxy to forward web traffic from port 80/443 to `localhost:3000`.
5. **SSL Certificate:** Use Certbot (Let's Encrypt) to generate a free SSL certificate for secure `https://` browsing.

---

## 2. Implementing Email OTP Verification for Signup

To migrate away from passwords and implement a modern, highly secure OTP (One-Time Password) email verification flow, you will need to add an email provider package and build an OTP verification flow into the database.

### Prerequisites
1. **Email Provider:** Sign up for an API service like [Resend](https://resend.com/) (Free tier allows 3,000 emails/month). Copy your API key.
2. **Install the SDK:** Run `npm install resend` in your terminal.

### Step-by-Step Implementation Guide

#### 1. Update the Database Schema
Create a new model for storing OTP codes temporarily.
**File: `src/models/OtpAuth.ts`**
```typescript
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: '10m', default: Date.now } // Automatically deletes document after 10 mins
});

export const OtpAuth = mongoose.models.OtpAuth || mongoose.model("OtpAuth", otpSchema);
```

#### 2. Create an API Route to Generate and Send the OTP
When the user enters their email on the signup page, the frontend will hit this endpoint.
**File: `src/app/api/auth/send-otp/route.ts`**
```typescript
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OtpAuth } from "@/models/OtpAuth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); // Add RESEND_API_KEY to your .env files

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await connectDB();
    
    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to database (use upsert to overwrite any old unused OTPs for this email)
    await OtpAuth.findOneAndUpdate({ email }, { otp }, { upsert: true });

    // Send the Email
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Note: You must verify your actual domain in Resend for production use
      to: email,
      subject: 'Your Pappu Juice Corner Login Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
           <h2>Pappu Juice Corner</h2>
           <p>Your verification code is: <strong style="font-size: 24px; color: #1b4321;">${otp}</strong></p>
           <p>This code expires securely in 10 minutes. Do not share this code with anyone.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send OTP email." }, { status: 500 });
  }
}
```

#### 3. Update the Registration Flow (Frontend UI)
On your authentication page (`src/app/auth/register/page.tsx`):
1. **Initial State:** The user enters their `email` and clicks a "Send Verification Code" button.
2. **API Call:** The button pushes a `POST` request to `/api/auth/send-otp`.
3. **Verification State:** The UI swaps from the email input to a 6-digit number input.
4. **Final Step:** The user enters the OTP and clicks "Verify & Create Account".

#### 4. Update NextAuth to Support OTP Login/Registration
Since your app uses `next-auth`, the cleanest way to log the user in instantly after verifying the OTP is to update your NextAuth configuration's `CredentialsProvider` to verify the OTP instead of a password.

**File: `src/app/api/auth/[...nextauth]/route.ts`**
```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { OtpAuth } from "@/models/OtpAuth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        fullName: { label: "Full Name (Optional)", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) throw new Error("Missing inputs");
        
        await connectDB();
        
        // 1. Check if OTP matches the database
        const record = await OtpAuth.findOne({ email: credentials.email });
        if (!record || record.otp !== credentials.otp) {
           throw new Error("Invalid or Expired OTP");
        }

        // 2. OTP is valid! Delete it so it cannot be reused.
        await OtpAuth.deleteOne({ email: credentials.email });

        // 3. Find the user, or automatically register them if they don't exist
        let user = await User.findOne({ email: credentials.email });
        if (!user) {
          // If the user provided a full name during registration, save it. Otherwise default to "User".
          user = await User.create({ 
             email: credentials.email, 
             fullName: credentials.fullName || "Juice Lover",
             role: "user" 
          });
        }

        // 4. Return user to NextAuth to establish session
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role
        };
      }
    }),
  ],
  // ... Keep existing NextAuth session/callbacks ...
});

export { handler as GET, handler as POST };
```

#### 5. Execute the Login from the Client Side
Once the user types in their OTP on the frontend, simply use NextAuth's `signIn` function.
```typescript
import { signIn } from "next-auth/react";

const handleVerifySubmit = async () => {
   const res = await signIn("credentials", {
      redirect: false,
      email: emailValue,
      otp: otpValue,
      fullName: nameValue // Optional, passed during their first signup
   });

   if (res?.error) {
      toast.error(res.error);
   } else {
      toast.success("Login Successful!");
      router.push("/");
   }
}
```

### Summary Check-In
Using the approach above provides the following flow:
1. User provides an email address -> System emails a temporary mathematically random 6-digit code.
2. User provides the code -> `NextAuth` checks the temporary OTP database collection.
3. If matches -> The system deletes the OTP entry for security, provisions a new permanent user row (if they are new), and grants an active session securely.
