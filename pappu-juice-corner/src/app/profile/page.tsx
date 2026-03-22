"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const { data: user, mutate } = useSWR("/api/users/profile", fetcher);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    currentPassword: "",
    newPassword: "",
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        deliveryAddress: user.deliveryAddress || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "Profile updated successfully");
        setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
        mutate();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-[#f7faf3] pt-24 px-4 md:px-8 text-center text-on-surface-variant font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f7faf3] px-4 sm:px-6 md:px-8 py-6 md:py-12 pt-20 md:pt-24 font-body">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Identity Concept block */}
        <div className="md:col-span-5 space-y-6 md:space-y-8 md:sticky md:top-28">
          
          {/* Peach illustration card - Hidden on very small screens, visible from sm up */}
          <div className="hidden sm:flex bg-[#fad3b5] rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 h-[280px] md:h-[380px] relative overflow-hidden items-center justify-center shadow-inner">
             <div className="w-36 md:w-48 h-48 md:h-64 bg-[#6c9a8b] rounded-xl shadow-lg relative z-10 flex flex-col justify-center gap-4 p-6 md:p-8">
                <div className="w-12 md:w-16 h-0.5 bg-white/50"></div>
                <div className="w-16 md:w-24 h-0.5 bg-white/50"></div>
                <div className="w-14 md:w-20 h-0.5 bg-white/50"></div>
             </div>
             
             {/* Fake plant shapes */}
             <div className="absolute right-6 md:right-8 bottom-6 md:bottom-8 flex flex-col items-center z-10">
                <div className="w-2 h-24 md:h-32 bg-[#4c5c44]"></div>
                <div className="w-8 md:w-10 h-8 md:h-10 bg-[#cf7c51] rounded-b-xl rounded-t-sm -mt-2"></div>
                <div className="absolute top-[20%] -left-3 w-5 md:w-6 h-3 md:h-4 bg-[#6c9a8b] rounded-full transform -rotate-45"></div>
                <div className="absolute top-[40%] -right-3 w-5 md:w-6 h-3 md:h-4 bg-[#6c9a8b] rounded-full transform rotate-45"></div>
             </div>
          </div>

          <div className="relative">
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-3 md:mb-4">
               Your PJC <span className="text-primary italic font-serif">Identity</span>
             </h1>
             <p className="text-[14px] md:text-[15px] font-medium text-[#5c6359] leading-relaxed max-w-sm">
               Refine your presence within our community. Your profile details ensure a tailored wellness journey and seamless home delivery.
             </p>

             <div className="absolute -bottom-6 md:-bottom-8 right-0 md:-right-4 bg-white/60 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-sm border border-white max-w-[180px] md:max-w-[200px]">
               <span className="text-[9px] font-black uppercase tracking-widest text-[#5c6359] block mb-1">Member Since</span>
               <span className="font-headline font-bold text-base md:text-lg text-on-surface">{new Date(user.createdAt || Date.now()).getFullYear()}</span>
             </div>
          </div>

        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-7 mt-12 md:mt-0">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {/* Personal Essence Block */}
            <div className="bg-[#f0f4ec] rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-10 shadow-sm border border-transparent">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                 <span className="material-symbols-outlined text-[#1b4321]">person</span>
                 <h2 className="text-lg md:text-xl font-bold font-headline tracking-tight text-on-surface">Personal Essence</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                 <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-[#e4ebdd] border-none rounded-xl px-4 md:px-5 py-3.5 md:py-4 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface transition-all placeholder:text-[#8ba38d]" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-[#e4ebdd] border-none rounded-xl px-4 md:px-5 py-3.5 md:py-4 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface transition-all placeholder:text-[#8ba38d]" />
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Email Address</label>
                 <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-[#e4ebdd] border-none rounded-xl px-4 md:px-5 py-3.5 md:py-4 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface transition-all placeholder:text-[#8ba38d]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              
              {/* Delivery Root Block */}
              <div className="bg-[#f0f4ec] rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-sm border border-transparent">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                   <span className="material-symbols-outlined text-[#1b4321]">local_shipping</span>
                   <h2 className="text-lg md:text-xl font-bold font-headline tracking-tight text-on-surface">Delivery Root</h2>
                </div>
                <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Street Address</label>
                   <textarea name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required rows={3} className="w-full bg-[#e4ebdd] border-none rounded-xl px-4 md:px-5 py-3.5 md:py-4 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface transition-all placeholder:text-[#8ba38d]"></textarea>
                </div>
              </div>

              {/* Security Block */}
              <div className="bg-[#f0f4ec] rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-sm border border-transparent">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                   <span className="material-symbols-outlined text-[#1b4321]">security</span>
                   <h2 className="text-lg md:text-xl font-bold font-headline tracking-tight text-on-surface">Security</h2>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">New Password</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-[#e4ebdd] border-none rounded-xl px-4 md:px-5 py-3.5 md:py-4 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface transition-all" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c6359] mb-2">Confirm Current Password</label>
                    <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full bg-[#e4ebdd] border-none rounded-xl px-4 md:px-5 py-3.5 md:py-4 focus:ring-2 focus:ring-primary/30 outline-none text-[14px] font-medium text-on-surface transition-all" placeholder="Required to save changes" />
                  </div>
                </div>
              </div>

            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 pt-4 md:pt-6 mt-4 md:mt-6">
              
              <button type="button" onClick={() => toast.error("Deactivation is currently disabled.")} className="flex items-center gap-2 text-[#5c6359] font-bold text-[13px] hover:text-[#ba1a1a] transition-colors order-2 sm:order-1">
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Deactivate Account
              </button>

              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto order-1 sm:order-2">
                <button type="button" onClick={() => window.history.back()} className="w-full sm:w-auto bg-[#dce4d5] hover:bg-[#c8d4c3] text-[#1b4321] px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-[14px] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#1b4321] hover:bg-primary text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-[14px] shadow-md transition-all disabled:opacity-70 flex justify-center">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
