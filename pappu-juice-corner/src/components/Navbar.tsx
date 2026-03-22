"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hooks must always be called at the top level
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  // Hide the global navbar on Admin and Auth routes where custom navigation exists
  // This return MUST come after all hook definitions
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    return null;
  }

  const baseLinks = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Juices", href: "/menu", icon: "local_bar" },
    { label: "Our Story", href: "/about", icon: "auto_stories" },
  ];

  const navLinks = session
    ? [...baseLinks, { label: "Orders", href: "/orders", icon: "receipt_long" }]
    : baseLinks;

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#f7faf3]/90 backdrop-blur-md border-b border-[#e4ebdd]/60">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 h-[64px] md:h-[72px] max-w-[1400px] mx-auto w-full">
          
          {/* Left Col - Brand */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="text-[18px] md:text-[22px] font-bold text-[#1b4321] tracking-[-0.02em] italic hover:opacity-80 transition-opacity" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              Pappu Juice Corner
            </Link>
          </div>
          
          {/* Center Col - Links (Desktop only) */}
          <div className="hidden md:flex gap-8 items-center justify-center">
            {navLinks.map((link) => {
               const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
               return (
                 <Link 
                   key={link.href} 
                   href={link.href} 
                   className={`text-[15px] font-medium tracking-tight transition-colors duration-200 ${
                     isActive ? "text-[#1b4321] font-semibold" : "text-[#5c6359] hover:text-[#1b4321]"
                   }`}
                 >
                   {link.label}
                 </Link>
               )
            })}
          </div>
          
          {/* Right Col - Actions */}
          <div className="flex items-center justify-end gap-3 md:gap-5 relative">
            {/* Desktop auth actions */}
            {!session ? (
              <div className="hidden md:flex items-center gap-5">
                <Link href="/auth/login" className="text-[14px] text-[#5c6359] font-semibold hover:text-[#1b4321] transition-colors">Login</Link>
                <Link href="/auth/signup" className="bg-[#1b4321] text-white font-bold text-[14px] px-6 py-2.5 rounded-full shadow-sm hover:bg-primary transition-all">Signup</Link>
              </div>
            ) : (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className="flex items-center gap-2 group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1b4321] text-white flex items-center justify-center font-bold text-[14px] shadow-sm group-hover:shadow-md transition-shadow">
                    {userInitial}
                  </div>
                  <span className={`material-symbols-outlined text-[18px] text-[#5c6359] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-[#e4ebdd] py-2">
                    <div className="px-5 py-3 border-b border-[#e4ebdd] mb-1">
                      <p className="text-[11px] uppercase tracking-widest font-bold text-[#5c6359] mb-0.5">Signed in as</p>
                      <p className="text-[14px] font-bold text-on-surface truncate">{session.user?.name}</p>
                      <p className="text-[12px] text-[#5c6359] truncate">{session.user?.email}</p>
                    </div>
                    
                    {session.user?.role === "admin" && (
                      <Link href="/admin" className="block px-5 py-2.5 text-[13px] font-bold text-[#1b4321] hover:bg-[#f2f5ee] transition-colors" onClick={() => setProfileOpen(false)}>
                        <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <Link href="/profile" className="block px-5 py-2.5 text-[13px] font-medium text-[#5c6359] hover:bg-[#f2f5ee] hover:text-[#1b4321] transition-colors" onClick={() => setProfileOpen(false)}>
                      <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">person</span>Edit Profile</span>
                    </Link>
                    <Link href="/orders" className="block px-5 py-2.5 text-[13px] font-medium text-[#5c6359] hover:bg-[#f2f5ee] hover:text-[#1b4321] transition-colors" onClick={() => setProfileOpen(false)}>
                      <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">receipt_long</span>My Orders</span>
                    </Link>
                    
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-5 py-2.5 text-[13px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors mt-1 border-t border-[#e4ebdd] pt-3">
                      <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[18px]">logout</span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#e4ebdd] transition-colors"
              aria-label="Toggle mobile menu"
            >
              <span className="material-symbols-outlined text-[24px] text-[#1b4321]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 w-[85%] max-w-[320px] h-full bg-[#f7faf3] shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e4ebdd]">
              <span className="text-[16px] font-bold text-[#1b4321] italic" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                Pappu Juice Corner
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e4ebdd] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-[#5c6359]">close</span>
              </button>
            </div>

            {/* User info (if logged in) */}
            {session && (
              <div className="px-6 py-5 border-b border-[#e4ebdd] bg-[#f0f3ec]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1b4321] text-white flex items-center justify-center font-bold text-[15px] shadow-sm">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-on-surface truncate">{session.user?.name}</p>
                    <p className="text-[12px] text-[#5c6359] truncate">{session.user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all ${
                        isActive 
                          ? "bg-[#1b4321] text-white shadow-md" 
                          : "text-[#40493d] hover:bg-[#e4ebdd]"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-[#5c6359]'}`}>
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Quick actions for logged in users */}
              {session && (
                <div className="mt-6 pt-6 border-t border-[#e4ebdd] space-y-1">
                  <Link 
                    href="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#40493d] hover:bg-[#e4ebdd] transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#5c6359]">person</span>
                    Edit Profile
                  </Link>
                  {session.user?.role === "admin" && (
                    <Link 
                      href="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#1b4321] hover:bg-[#e4ebdd] transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#1b4321]">admin_panel_settings</span>
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="px-6 py-5 border-t border-[#e4ebdd]">
              {!session ? (
                <div className="space-y-3">
                  <Link 
                    href="/auth/signup" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-[#1b4321] text-white text-center font-bold text-[14px] px-6 py-3.5 rounded-full shadow-md hover:bg-primary transition-all"
                  >
                    Get Started
                  </Link>
                  <Link 
                    href="/auth/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center text-[14px] text-[#5c6359] font-semibold py-3 hover:text-[#1b4321] transition-colors"
                  >
                    Already have an account? Login
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={() => { signOut({ callbackUrl: "/" }); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 text-[#ba1a1a] font-bold text-[14px] py-3 rounded-full border-2 border-[#ffdad6] hover:bg-[#ffdad6]/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
