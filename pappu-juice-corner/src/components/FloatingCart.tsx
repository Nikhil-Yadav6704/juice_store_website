"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FloatingCart() {
  const { data: session } = useSession();
  
  const { data, error } = useSWR(session ? "/api/cart/count" : null, fetcher, {
    refreshInterval: 5000,
  });

  if (!session || session.user?.role === "admin") {
    return null;
  }

  const itemCount = data?.count || 0;

  return (
    <Link href="/cart" className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[100] group">
      <div className="relative w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary flex items-center justify-center rounded-2xl shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <span className="material-symbols-outlined text-2xl md:text-3xl">shopping_cart</span>
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-7 h-7 md:w-8 md:h-8 bg-error text-on-error rounded-full flex justify-center items-center text-xs md:text-sm font-bold shadow-lg border-2 border-surface">
            {itemCount}
          </div>
        )}
      </div>
    </Link>
  );
}
