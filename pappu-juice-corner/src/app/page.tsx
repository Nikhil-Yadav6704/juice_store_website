"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: session } = useSession();
  const { data: settings } = useSWR("/api/settings", fetcher);

  return (
    <div className="bg-surface selection:bg-[#d1ecb4] selection:text-[#005312] pt-4 md:pt-12">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 md:px-8 pb-12 md:pb-20 pt-8 md:pt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">
          
          <div className="z-10 order-2 md:order-1 pt-4 md:pt-0">
            <span className="inline-block bg-[#52634f] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5 md:mb-8 shadow-sm">
              Cold Pressed Freshness
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-[5.5rem] font-extrabold text-on-surface font-headline leading-[1] tracking-tight mb-4 md:mb-6" dangerouslySetInnerHTML={{ __html: settings?.home?.heroTitle || "The Art of <br /> <span class='text-primary italic font-serif'>Living Raw.</span>" }}>
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg font-medium leading-relaxed mb-8 md:mb-10 max-w-[400px]">
              {settings?.home?.heroSubtitle || "Crafted by nutritionists, delivered by locals. High-integrity juices that transform your cellular energy in minutes."}
            </p>
            <div>
              <Link href="/menu" className="bg-primary text-on-primary px-7 md:px-8 py-3.5 md:py-4 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#0a4d15] flex items-center justify-center gap-2 max-w-[220px] transition-all">
                Explore Our Menu
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
          
          <div className="relative order-1 md:order-2 h-[320px] sm:h-[400px] md:h-[650px] w-full">
            <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img
                className="w-full h-full object-cover object-center"
                alt="Pouring vibrant green cold-pressed juice"
                src="/images/Home page.png"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-2 sm:-bottom-10 sm:-left-6 md:-left-16 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-surface-container-lowest rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col justify-center items-center text-center p-4 md:p-6 border border-white/50 z-20">
              <span className="text-[#8f4e00] font-headline font-black text-3xl sm:text-4xl md:text-5xl tracking-tighter leading-none mb-1">100%</span>
              <span className="text-on-surface-variant text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-1">Organic Traceability</span>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Hourly Delivery */}
      <section className="py-16 md:py-32 px-4 sm:px-6 md:px-8 bg-[#f0f3ec] mt-8 md:mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6 md:gap-8">
            <div className="max-w-xl">
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-3 md:mb-4">
                Smart Hourly Delivery
              </h2>
              <p className="text-on-surface-variant text-base md:text-lg font-medium leading-relaxed">
                Wellness shouldn't wait. We've optimized our local loops to get nutrients to your door exactly when you need them.
              </p>
            </div>
            <div className="flex gap-2 pb-2">
              <div className="h-0.5 w-24 bg-primary rounded-full"></div>
              <div className="h-0.5 w-8 bg-outline-variant rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            
            {/* Scheduled Free */}
            <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container min-h-[300px] md:min-h-[380px]">
              <div>
                <div className="w-12 h-12 bg-[#f2f5ee] flex items-center justify-center rounded-xl mb-6 md:mb-8 border border-surface-container-high">
                  <span className="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
                </div>
                <h3 className="font-headline text-xl md:text-2xl font-bold mb-3 text-on-surface">Scheduled Free</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                  Perfect for your morning ritual. Order by midnight for guaranteed 7AM doorstep delivery at no cost.
                </p>
              </div>
              <div className="text-[13px] text-primary font-bold mt-6 md:mt-8">
                ₹0.00 <span className="text-primary/70">Delivery Fee</span>
              </div>
            </div>

            {/* Instant */}
            <div className="bg-[#1b4321] text-white p-8 md:p-10 rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden group min-h-[300px] md:min-h-[380px]">
              <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
                <span className="bg-[#fbdfc6] text-[#8f4e00] px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                  Most Popular
                </span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#2f7831] flex items-center justify-center rounded-xl mb-6 md:mb-8">
                  <span className="material-symbols-outlined text-white text-[22px]">bolt</span>
                </div>
                <h3 className="font-headline text-xl md:text-2xl font-bold mb-3 text-white">Instant</h3>
                <p className="text-[#a3f69c] text-sm leading-relaxed font-medium opacity-90">
                  Within 60 minutes. Ideal for that post-workout window or mid-day slump recovery.
                </p>
              </div>
              <div className="text-[13px] text-white font-bold mt-6 md:mt-8 relative z-10">
                ₹{settings?.delivery?.instantPrice || "2.99"} <span className="text-white/70">Delivery Fee</span>
              </div>
            </div>
 
            {/* Super Instant */}
            <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container min-h-[300px] md:min-h-[380px]">
              <div>
                <div className="w-12 h-12 bg-[#ffe4c4] flex items-center justify-center rounded-xl mb-6 md:mb-8 border border-[#fbdfc6]">
                  <span className="material-symbols-outlined text-[#8f4e00] text-[22px]">rocket_launch</span>
                </div>
                <h3 className="font-headline text-xl md:text-2xl font-bold mb-3 text-on-surface">Super Instant</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                  Priority routing. We bypass the queue to get your juice from press to hand in under 20 minutes.
                </p>
              </div>
              <div className="text-[13px] text-[#8f4e00] font-bold mt-6 md:mt-8">
                ₹{settings?.delivery?.superInstantPrice || "5.99"} <span className="text-[#8f4e00]/70">Priority Pass</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Brand Integrity */}
      <section className="py-16 md:py-32 px-4 sm:px-6 md:px-8 overflow-hidden bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 items-center">
            
            <div className="order-2 md:order-1 relative">
              <div className="h-[350px] sm:h-[450px] md:h-[650px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl">
                <img
                  className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
                  alt="Botanical ginger and fresh oranges"
                  src="/images/Home page(2).png"
                />
              </div>
              <div className="absolute top-6 -right-2 sm:top-12 sm:-right-4 md:-right-12 bg-surface-container-lowest p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl max-w-[220px] md:max-w-[280px] border border-white/60">
                <h4 className="font-black text-[10px] md:text-[11px] text-on-surface uppercase tracking-widest mb-2 md:mb-3">Botanical Sourcing</h4>
                <p className="text-[12px] md:text-[13px] text-on-surface-variant font-medium leading-relaxed">
                  We partner with three regenerative farms within a 50-mile radius to ensure maximum phytonutrient density.
                </p>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="font-headline text-3xl sm:text-4xl md:text-6xl font-extrabold text-on-surface leading-tight mb-10 md:mb-16 tracking-tight">
                Pappu Juice <br />Integrity Standard.
              </h2>
              <div className="space-y-8 md:space-y-12">
                
                <div className="flex gap-5 md:gap-8 group">
                  <span className="text-3xl md:text-5xl font-black text-on-surface-variant/20 font-headline group-hover:text-primary transition-colors">01</span>
                  <div className="pt-1 md:pt-2">
                    <h5 className="text-lg md:text-xl font-bold mb-2 text-on-surface">No HPP Ever</h5>
                    <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                      We never use high-pressure processing. Our juice stays alive, unpasteurized, and full of active enzymes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 md:gap-8 group">
                  <span className="text-3xl md:text-5xl font-black text-on-surface-variant/20 font-headline group-hover:text-primary transition-colors">02</span>
                  <div className="pt-1 md:pt-2">
                    <h5 className="text-lg md:text-xl font-bold mb-2 text-on-surface">Glass Over Plastic</h5>
                    <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                      Bottled exclusively in sustainable Italian glass to prevent microplastic leaching and preserve flavor.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 md:gap-8 group">
                  <span className="text-3xl md:text-5xl font-black text-on-surface-variant/20 font-headline group-hover:text-primary transition-colors">03</span>
                  <div className="pt-1 md:pt-2">
                    <h5 className="text-lg md:text-xl font-bold mb-2 text-on-surface">Hourly Pressing</h5>
                    <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                      Our kitchens operate in shifts to ensure no bottle sits for more than 4 hours before it's shipped.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 md:px-8 pb-16 md:pb-32">
        <div className="max-w-6xl mx-auto bg-[#2f7831] rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <h2 className="font-headline text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
              Ready to feel the difference?
            </h2>
            <p className="text-[#c8d4c3] text-base md:text-lg mb-8 md:mb-12 max-w-xl mx-auto font-medium leading-relaxed">
              Join 15,000+ neighbors who have upgraded their daily hydration to Pappu Juice Corner.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4">
              {!session ? (
                <>
                  <Link href="/auth/signup" className="w-full sm:w-auto bg-white text-primary px-7 md:px-8 py-3.5 md:py-4 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center">
                    Get Started Now
                  </Link>
                  <Link href="/menu" className="w-full sm:w-auto bg-transparent text-white border-2 border-white/30 px-7 md:px-8 py-3.5 md:py-4 rounded-full text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center">
                    Browse Subscriptions
                  </Link>
                </>
              ) : (
                <Link href="/menu" className="bg-white text-primary px-8 md:px-10 py-4 md:py-5 rounded-full text-sm font-bold shadow-xl hover:-translate-y-1 transition-transform inline-block">
                  Order Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
