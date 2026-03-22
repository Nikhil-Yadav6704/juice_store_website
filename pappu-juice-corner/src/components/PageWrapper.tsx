"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Don't add top padding if the global navbar is hidden (Admin and Auth routes)
  const isAuthOrAdmin = pathname?.startsWith("/auth") || pathname?.startsWith("/admin");
  
  return (
    <main className={`min-h-screen ${isAuthOrAdmin ? "" : "pt-20"}`}>
      {children}
    </main>
  );
}
