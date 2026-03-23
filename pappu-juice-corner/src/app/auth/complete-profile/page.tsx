"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    deliveryAddress: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && !session?.user?.isProfileIncomplete) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          deliveryAddress: formData.deliveryAddress,
          password: formData.password,
        }),
      });

      if (res.ok) {
        toast.success("Profile completed successfully!");
        // Update session to remove the isProfileIncomplete flag
        await update();
        router.push("/");
        router.refresh();
      } else {
        const result = await res.json().catch(() => ({}));
        if (!result || (!result.profile && !result.user)) {
          console.warn('Profile complete: unexpected response shape', result);
        }
        toast.error(result?.message || "Failed to complete profile");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="p-8 font-bold text-lg">Verifying your harvest...</div>;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#d1ecb4] rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#ffe5cc] rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl z-10 border border-white/50 backdrop-blur-sm">
        <div className="text-center mb-10">
          <span className="bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 inline-block">
            Final Step
          </span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight mb-2">
            Complete Your Profile
          </h1>
          <p className="text-sm text-on-surface-variant font-medium">
            Welcome, {session?.user?.name}! Just a few more details to set up your digital orchard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Delivery Address</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-5 text-on-surface-variant text-[20px]">location_on</span>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium"
                placeholder="123 Botanical Ave, Suite 4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Set Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium tracking-widest"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-[15px] shadow-md hover:shadow-lg hover:bg-[#0a4d15] transition-all mt-6 disabled:opacity-70"
          >
            {loading ? "Saving Details..." : "Finish Setup"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs font-medium text-on-surface-variant opacity-60">
        All your details are encrypted and stored securely in the atelier.
      </p>
    </div>
  );
}
