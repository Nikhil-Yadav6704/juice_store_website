"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StatusWatcher() {
  const { data: session } = useSession();
  
  // Only poll if there's an active session
  const { data } = useSWR(session ? "/api/auth/status" : null, fetcher, {
    refreshInterval: 30000, // Check every 30 seconds
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (data?.status === "blocked") {
      toast.error("Your account has been suspended. Please contact admin.", {
        duration: 8000,
        id: "blocked-toast",
      });
      
      // Delay sign out slightly so the user can see the toast
      const timer = setTimeout(() => {
        signOut({ callbackUrl: "/auth/login?error=blocked" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [data]);

  return null;
}
