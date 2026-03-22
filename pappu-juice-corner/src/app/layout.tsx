import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCart from "@/components/FloatingCart";
import StatusWatcher from "@/components/StatusWatcher";

export const metadata: Metadata = {
  title: {
    default: "Pappu Juice Corner — Cold Pressed Freshness Delivered",
    template: "%s | Pappu Juice Corner",
  },
  description: "Pappu Juice Corner crafts premium cold-pressed juices from locally sourced organic produce. Fresh presses and instant delivery to your doorstep.",
  keywords: ["cold pressed juice", "organic juice", "juice delivery", "fresh juice", "health drinks", "pappu juice corner"],
  authors: [{ name: "Pappu Juice Corner" }],
  openGraph: {
    title: "Pappu Juice Corner — Cold Pressed Freshness Delivered",
    description: "Premium cold-pressed juices crafted from locally sourced organic produce. Order now for instant delivery.",
    siteName: "Pappu Juice Corner",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pappu Juice Corner",
    description: "Premium cold-pressed juices delivered to your door.",
  },
  robots: { index: true, follow: true },
};

import ProfileEnforcer from "@/components/ProfileEnforcer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-body antialiased">
        <Providers>
          <StatusWatcher />
          <ProfileEnforcer />
          <Navbar />
          <main className="min-h-screen pt-20">
            {children}
          </main>
          <Footer />
          <FloatingCart />
        </Providers>
      </body>
    </html>
  );
}
