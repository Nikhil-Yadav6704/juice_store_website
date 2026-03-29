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

      {/* Global Navbar */}
      <nav className="relative z-20 w-full px-6 md:px-8 py-4 md:py-6 flex justify-between items-center bg-transparent">
        <Link href="/" className="text-xl md:text-3xl font-extrabold text-primary font-headline tracking-tighter hover:opacity-80 transition-opacity">
          Pappu Juice Corner
        </Link>
        <div className="hidden md:flex gap-10 font-medium text-sm text-on-surface-variant">
          <Link href="/menu" className="hover:text-primary transition-colors">Menu</Link>
          <Link href="/menu" className="hover:text-primary transition-colors">Juices</Link>
          <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-sm font-bold">
          <Link href="/auth/login" className="text-on-surface hover:text-primary transition-colors text-xs md:text-sm">Login</Link>
          <Link href="/auth/signup" className="bg-primary text-on-primary px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-md hover:shadow-lg hover:bg-[#0a4d15] transition-all text-xs md:text-sm whitespace-nowrap">Sign Up</Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 z-10">
        
        {/* Header Titles */}
        <div className="text-center mb-8 md:mb-10 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary font-headline tracking-tighter mb-2 leading-tight">
            Pappu Juice Corner
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-medium opacity-80">
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

            {tab === "user" && (
              <div className="mt-6 space-y-4">
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-px bg-surface-container"></div>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container-lowest px-2">OR</span>
                  <div className="flex-1 h-px bg-surface-container"></div>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="w-full bg-white text-on-surface py-3.5 rounded-full font-bold text-[14px] border border-surface-container shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            )}

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

    </div>
  );
}
