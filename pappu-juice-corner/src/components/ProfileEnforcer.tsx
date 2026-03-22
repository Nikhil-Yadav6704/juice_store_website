"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProfileEnforcer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isProfileIncomplete) {
      // List of pages that are allowed even if the profile is incomplete
      const allowedPaths = [
        "/auth/complete-profile",
        "/auth/login",
        "/auth/signup",
      ];

      const isAllowed = allowedPaths.some(path => pathname?.startsWith(path));
      
      // Also allow API routes implicitly (middleware handles those usually, but here we just focus on UI)
      if (!isAllowed) {
        router.push("/auth/complete-profile");
      }
    }
  }, [session, status, pathname, router]);

  return null; // This component doesn't render anything
}
