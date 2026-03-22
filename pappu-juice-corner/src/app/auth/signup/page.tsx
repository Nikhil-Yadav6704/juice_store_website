"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Account created! Logging you in...");
      
      const { signIn } = await import("next-auth/react");
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        isAdminLogin: "false",
      });

      if (signInRes?.error) {
        toast.error(signInRes.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden font-body relative">
      
      {/* Decorative Background Assets */}
      <div className="absolute top-[10%] left-[-5%] w-[400px] h-[600px] bg-[#d1ecb4] transform -skew-y-12 rounded-[3rem] opacity-40 z-0 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#ffe5cc] to-transparent rounded-full opacity-60 z-0 pointer-events-none hidden md:block"></div>
      <div className="absolute top-[20%] right-[10%] w-[150px] h-[150px] bg-[#fbdfc6] rounded-3xl transform rotate-12 opacity-80 z-0 pointer-events-none hidden lg:block"></div>

      {/* Global Navbar */}
      <nav className="relative z-20 w-full px-8 py-6 flex justify-between items-center bg-transparent">
        <Link href="/" className="text-3xl font-extrabold text-primary font-headline tracking-tighter hover:opacity-80 transition-opacity">
          Pappu Juice Corner
        </Link>
        <div className="hidden md:flex gap-10 font-medium text-sm text-on-surface-variant">
          <Link href="/menu" className="hover:text-primary transition-colors">Menu</Link>
          <Link href="/menu" className="hover:text-primary transition-colors">Juices</Link>
          <Link href="/our-story" className="hover:text-primary transition-colors">Our Story</Link>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold">
          <Link href="/auth/login" className="text-on-surface hover:text-primary transition-colors">Login</Link>
          <Link href="/auth/signup" className="bg-primary text-on-primary px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:bg-[#0a4d15] transition-all">Sign Up</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* Left Typography Section */}
        <div className="flex-1 max-w-lg relative">
          <div className="absolute -left-20 top-20 w-48 h-48 bg-gradient-to-r from-transparent to-[#ffffff33] rounded-full blur-2xl z-0 pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="bg-[#52634f] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6 inline-block shadow-sm">
              Member Atelier
            </span>
            <h1 className="text-6xl md:text-[5rem] font-extrabold text-on-surface font-headline leading-[1.1] tracking-tight mb-6">
              Join the <br/>
              <span className="text-primary italic font-serif opacity-90">harvest.</span>
            </h1>
            <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-10 max-w-md">
              Access seasonal blends, botanical insights, and doorstep vitality. Our digital orchard is cultivated for those who seek the refined essence of nature.
            </p>

            <div className="bg-[#f0f3ec] p-6 rounded-2xl flex items-center gap-6 max-w-md shadow-sm border border-[#e6ebe3]">
              <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-full text-white shadow-inner flex-shrink-0">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Farm-to-Glass</h3>
                <p className="text-sm text-on-surface-variant leading-snug">Sourced within 48 hours of your delivery date.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex-1 w-full max-w-xl relative">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/50 backdrop-blur-sm">
            
            <form onSubmit={handleSignup} className="space-y-6">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium" placeholder="Julian Orchard" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium" placeholder="julian@atelier.com" />
              </div>

              {/* Row 3 - Delivery Address */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Delivery Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-5 text-on-surface-variant text-[20px]">location_on</span>
                  <input type="text" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required className="w-full pl-12 pr-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium" placeholder="123 Botanical Ave, Suite 4" />
                </div>
              </div>

              {/* Row 4 - Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium tracking-widest" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium tracking-widest" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-[15px] shadow-md hover:shadow-lg hover:bg-[#0a4d15] transition-all mt-6 disabled:opacity-70">
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-surface-container flex justify-center">
              <p className="text-sm font-medium text-on-surface-variant">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#8f4e00] font-bold hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Footer (Extended Version for Signup) */}
      <footer className="relative z-10 w-full bg-[#ebeee7] border-t border-[#dce0d7] pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-extrabold text-primary font-headline tracking-tighter mb-4">Pappu Juice Corner</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed opacity-90">
              Cultivating high-end vitality through botanical wisdom and fresh-pressed excellence.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/sourcing" className="hover:text-primary transition-colors">Sourcing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-6">Policy</h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-6">Connect</h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center border-t border-outline-variant/20 pt-8">
          <p className="text-xs text-on-surface-variant/80 font-medium">© 2024 Pappu Juice Corner Editorial. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0 text-on-surface-variant">
            {/* Social Icons Placeholders */}
            <span className="material-symbols-outlined text-[18px] hover:text-primary cursor-pointer transition-colors">campaign</span>
            <span className="material-symbols-outlined text-[18px] hover:text-primary cursor-pointer transition-colors">eco</span>
            <span className="material-symbols-outlined text-[18px] hover:text-primary cursor-pointer transition-colors">public</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
