"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FloatingCart() {
  const { data: session } = useSession();
  
  const { data: cartData } = useSWR(
    session?.user ? "/api/cart" : null,
    fetcher,
    { 
      dedupingInterval: 10000,
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  );

  if (!session || session.user?.role === "admin") {
    return null;
  }

  const itemCount = cartData?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <Link href="/cart" className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] group">
      {/* Tooltip-like Label */}
      <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
        <div className="bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-2 px-4 rounded-full shadow-xl whitespace-nowrap uppercase tracking-widest border border-white/10">
          View Shopping Cart
        </div>
      </div>

      <div className="relative">
        {/* Main Button with Premium Gradient and Glass Effect */}
        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary via-primary-container to-[#084512] text-on-primary flex items-center justify-center rounded-[1.5rem] shadow-[0_15px_40px_rgba(13,99,27,0.25)] hover:shadow-[0_20px_50px_rgba(13,99,27,0.35)] transition-all duration-500 relative group-hover:-translate-y-1.5 active:scale-95 border border-white/10">
          
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-white/5 to-transparent opacity-50"></div>
          
          {/* Animated Glow on Hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-white/10 to-primary/20 rounded-[1.7rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <span className="material-symbols-outlined text-2xl md:text-3xl relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg] drop-shadow-md">
            shopping_cart
          </span>

          {/* New Integrated Badge Style */}
          {itemCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 min-w-[20px] h-[20px] md:min-w-[24px] md:h-[24px] px-1 bg-error text-on-error rounded-full flex justify-center items-center text-[9px] md:text-[10px] font-black shadow-[0_4px_10px_rgba(186,26,26,0.3)] border-2 border-surface animate-in zoom-in duration-300 z-20">
              {itemCount}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
