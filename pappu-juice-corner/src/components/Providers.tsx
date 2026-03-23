"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig 
        value={{
          errorRetryCount: 2,
          shouldRetryOnError: true
        }}
      >
        {children}
      </SWRConfig>
      <Toaster position="top-center" />
    </SessionProvider>
  );
}
