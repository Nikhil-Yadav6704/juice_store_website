"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "grid_view" },
    { name: "Orders", href: "/admin/orders", icon: "receipt_long" },
    { name: "Menu", href: "/admin/menu", icon: "restaurant_menu" },
    { name: "Users", href: "/admin/users", icon: "group" },
    { name: "Analytics", href: "/admin/analytics", icon: "monitoring" },
    { name: "Production", href: "/admin/production", icon: "content_paste" },
  ];

  const sidebarContent = (
    <>
      <div className="px-6 md:px-8 pt-8 md:pt-12 pb-6 md:pb-10 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-black text-primary font-headline uppercase tracking-wide">PJC Admin</h1>
          <p className="text-xs font-semibold text-on-surface-variant mt-1">Management Portal</p>
        </div>
        {/* Close button for mobile */}
        <button 
          onClick={() => setMobileOpen(false)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-1 flex-grow pr-4 md:pr-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`pl-6 md:pl-8 py-3.5 md:py-4 rounded-r-full font-bold transition-colors flex items-center gap-3 md:gap-4 text-[14px] md:text-base ${
                isActive
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              <span className={`material-symbols-outlined text-lg md:text-xl ${isActive ? "" : "text-outline"}`}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 px-6 md:px-8 pt-6 md:pt-8 border-t border-surface-container-highest">
        <Link href="/admin/settings" onClick={() => setMobileOpen(false)} className={`py-2.5 md:py-3 font-bold transition-colors flex items-center gap-3 md:gap-4 text-left text-[14px] md:text-base ${pathname === '/admin/settings' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
          <span className="material-symbols-outlined text-lg md:text-xl">settings</span>
          Global Settings
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="py-2.5 md:py-3 font-bold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-3 md:gap-4 text-left text-[14px] md:text-base">
          <span className="material-symbols-outlined text-lg md:text-xl">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button — fixed top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-surface-container-lowest rounded-xl shadow-md flex items-center justify-center border border-surface-container-high"
      >
        <span className="material-symbols-outlined text-[22px] text-primary">menu</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 w-[280px] max-w-[85%] h-full bg-surface-container border-r border-surface-container-high flex flex-col pb-6 animate-slide-in-left shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[280px] bg-surface-container border-r border-surface-container-high flex-col fixed h-full z-40 left-0 top-0 pb-8">
        {sidebarContent}
      </aside>
    </>
  );
}
