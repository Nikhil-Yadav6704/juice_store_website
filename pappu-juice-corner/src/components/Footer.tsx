"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide the global footer on Admin and Auth routes where custom navigation exists or clean UI is needed
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <footer className="w-full py-8 md:py-12 px-4 sm:px-6 md:px-8 mt-12 md:mt-20 bg-[#ecefe8] dark:bg-stone-900">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
          <span className="text-lg font-bold text-[#0d631b] dark:text-emerald-500 font-headline">Pappu Juice Corner</span>
          <p className="text-[#40493d] dark:text-stone-400 font-['Manrope'] text-sm leading-relaxed">Crafting editorial wellness through the lens of local, organic nourishment.</p>
        </div>
        <div className="flex flex-col gap-3 md:gap-4">
          <h4 className="font-bold text-on-surface">Explore</h4>
          <div className="flex flex-col gap-2">
            <Link className="text-[#40493d] dark:text-stone-400 hover:text-[#8f4e00] transition-colors duration-200 text-sm" href="/about">About Us</Link>
            <Link className="text-[#40493d] dark:text-stone-400 hover:text-[#8f4e00] transition-colors duration-200 text-sm" href="/menu">Our Juices</Link>
            <Link className="text-[#40493d] dark:text-stone-400 hover:text-[#8f4e00] transition-colors duration-200 text-sm" href="/contact">Contact</Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:gap-4">
          <h4 className="font-bold text-on-surface">Support</h4>
          <div className="flex flex-col gap-2">
            <Link className="text-[#40493d] dark:text-stone-400 hover:text-[#8f4e00] transition-colors duration-200 text-sm" href="/terms">Terms of Service</Link>
            <Link className="text-[#40493d] dark:text-stone-400 hover:text-[#8f4e00] transition-colors duration-200 text-sm" href="/privacy">Privacy Policy</Link>
            <Link className="text-[#40493d] dark:text-stone-400 hover:text-[#8f4e00] transition-colors duration-200 text-sm" href="/orders">Track Order</Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:gap-4 col-span-2 md:col-span-1">
          <h4 className="font-bold text-on-surface">Newsletter</h4>
          <div className="flex gap-2">
            <input className="bg-surface-container-low border-none rounded-lg text-sm w-full focus:ring-1 focus:ring-primary px-3 py-2.5 min-w-0" placeholder="Email address" type="text" />
            <button className="bg-primary text-on-primary p-2.5 rounded-lg flex items-center justify-center min-w-[40px] flex-shrink-0">
              <span className="material-symbols-outlined text-sm">east</span>
            </button>
          </div>
          <p className="text-[11px] text-[#40493d] mt-4 md:mt-4 font-['Manrope'] leading-relaxed text-center md:text-left">© {new Date().getFullYear()} Pappu Juice Corner. <br className="md:hidden"/> Stay Organic.</p>
        </div>
      </div>
    </footer>
  );
}
