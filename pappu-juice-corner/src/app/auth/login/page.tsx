"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      isAdminLogin: tab === "admin" ? "true" : "false",
    });

    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Login successful!");
      router.push(tab === "admin" ? "/admin" : "/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-surface overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-[#e4ebdd] rounded-full blur-3xl opacity-50 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#ffe4c4] rounded-full blur-3xl opacity-40 pointer-events-none hidden md:block"></div>
      
      {/* Absolute Images to simulate the Apple/Citrus corners (Placeholders using gradients to represent the images safely) */}
      <div className="absolute top-0 left-0 w-[20vw] max-w-[300px] aspect-square bg-gradient-to-br from-[#d1ecb4] to-transparent rounded-br-full opacity-60 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-0 right-0 w-[25vw] max-w-[400px] aspect-square bg-gradient-to-tl from-[#ffe5cc] to-transparent rounded-tl-full opacity-60 pointer-events-none hidden md:block"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 z-10">
        
        {/* Header Titles */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary font-headline tracking-tighter mb-2">
            Pappu Juice Corner
          </h1>
          <p className="text-on-surface-variant font-medium">
            Step into the Atelier of Vitality.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          
          {/* Tabs */}
          <div className="flex border-b border-surface-container bg-surface-container-lowest pt-2">
            <button
              onClick={() => setTab("user")}
              className={`flex-1 pb-4 pt-2 text-sm font-bold transition-colors ${
                tab === "user"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`flex-1 pb-4 pt-2 text-sm font-bold transition-colors ${
                tab === "admin"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Admin Login
            </button>
          </div>

          <div className="p-8 md:p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Email Field */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  {tab === "admin" ? "Admin Email" : "Email or Phone"}
                </label>
                <input
                  type={tab === "admin" ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium"
                  placeholder={tab === "admin" ? "admin@orchard.com" : "nature@orchard.com"}
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Password
                  </label>
                  {tab === "user" && (
                    <a href="#" className="text-[10px] font-bold text-[#b05f00] hover:underline uppercase tracking-widest">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-5 pr-12 py-4 rounded-xl bg-[#f2f5ee] border-none text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-shadow placeholder:text-on-surface-variant/50 font-medium tracking-widest"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-[15px] shadow-md hover:shadow-lg hover:bg-[#0a4d15] transition-all mt-4 disabled:opacity-70"
              >
                {loading ? "Authenticating..." : tab === "admin" ? "Login as Admin" : "Login"}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-surface-container flex justify-center">
              <p className="text-sm font-medium text-on-surface-variant">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary font-bold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Feature Tags Row */}
        <div className="flex gap-4 mt-12 mb-8">
          <div className="bg-[#f2f5ee] px-6 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 w-[100px] transition-transform hover:-translate-y-1">
            <span className="material-symbols-outlined text-primary text-[22px]">eco</span>
            <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Organic</span>
          </div>
          <div className="bg-[#f2f5ee] px-6 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 w-[100px] transition-transform hover:-translate-y-1">
            <span className="material-symbols-outlined text-primary text-[22px]">bolt</span>
            <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Vitality</span>
          </div>
          <div className="bg-[#f2f5ee] px-6 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 w-[100px] transition-transform hover:-translate-y-1">
            <span className="material-symbols-outlined text-primary text-[22px]">workspace_premium</span>
            <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Curated</span>
          </div>
        </div>

      </div>

      {/* Global Footer Minimal */}
      <footer className="w-full px-8 py-6 flex flex-col md:flex-row justify-between items-center border-t border-surface-container z-10 bg-surface/80 backdrop-blur-md">
        <div className="font-headline font-extrabold text-primary text-lg mb-4 md:mb-0 tracking-tight">
          Pappu Juice Corner Editorial
        </div>
        <div className="flex gap-8 text-xs font-medium text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
        </div>
        <div className="text-xs text-on-surface-variant mt-4 md:mt-0">
          © 2024 Pappu Juice Corner. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
