# Deployment & Authentication Guide for The Orchard (Pappu Juice Corner)

## 1. Quick Deployment to Vercel (Latest Features)

Since the latest features (OTP, Dynamic Pricing, Rewards) have been pushed to GitHub, updating your live site is simple.

### Steps:
1. **Push to GitHub**: I have already pushed the latest code to your repository.
2. **Vercel Automatic Redeploy**: Vercel will detect the new commit and start a build automatically.
3. **Add Environment Variables**:
   - Go to your Project Dashboard on Vercel.
   - Settings -> **Environment Variables**.
   - Add the following:
     - `RESEND_API_KEY`: Your API key from Resend.
     - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
     - `CLOUDINARY_API_KEY`: Your Cloudinary API Key.
     - `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret.
   - Ensure these are also present:
     - `MONGODB_URI`: Your MongoDB Atlas string.
     - `NEXTAUTH_SECRET`: A random secure string.
     - `NEXTAUTH_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`).
4. **Redeploy**: If the build already finished before you added the variables, go to the "Deployments" tab, click the three dots on the latest deployment, and select **Redeploy**.

---

## 2. Completely Free Deployment (Recommended Stack)

You can run this entire application with zero hosting costs using these providers:

- **Frontend & API:** [Vercel](https://vercel.com/) (Hobby Tier)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) (M0 Free Cluster)
- **Email (OTP):** [Resend](https://resend.com/) (Free Tier: 3,000 emails/month)
- **Images:** [Cloudinary](https://cloudinary.com/) (Free Tier)

---

## 3. New Feature: Email OTP Verification

The Signup process now requires a 6-digit verification code.

### Configuration:
- **Service**: Resend
- **File**: `src/lib/email.ts`
- **Variable**: `RESEND_API_KEY`
- **Default Sender**: `Orchard <onboarding@resend.dev>` (Update this in `email.ts` once you verify your custom domain in Resend).

---

## 4. Other Dynamic Features
- **Delivery Prices**: Change them in **Admin -> Global Settings**.
- **Orchard Rewards**: Enable/Disable and set thresholds in **Admin -> Global Settings**.
- **Kitchen Status**: Automatically shows actual active orders.
- **User Blocking**: Blocks in **Admin -> User Directory** instantly logout the user.

---

## 5. Paid/Professional Deployment
For high traffic or custom domains:
- **Hosting**: Vercel Pro ($20/mo) or DigitalOcean VPS ($6/mo).
- **Database**: MongoDB Atlas Shared/Dedicated (~$9+/mo).
- **Email**: Resend Paid or AWS SES (Very cheap).
