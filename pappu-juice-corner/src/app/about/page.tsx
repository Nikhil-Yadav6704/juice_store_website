"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutPage() {
  const [email, setEmail] = useState("");
  const { data: settings } = useSWR("/api/settings", fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false
  });

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes("@")) return toast.error("Please enter a valid email.");
    toast.success("Subscribed! Welcome to The Harvest.");
    setEmail("");
  };

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[860px] flex items-center overflow-hidden bg-surface-container-low px-4 sm:px-6 md:px-8 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#5d7543] text-white font-headline text-xs font-bold tracking-widest uppercase mb-4 md:mb-6">
              Our Philosophy
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black font-headline text-on-surface leading-[1.1] tracking-tighter mb-5 md:mb-8" dangerouslySetInnerHTML={{ __html: settings?.about?.heroTitle || "Rooted in Nature, <br /> <span class='text-primary italic'>Pressed for Life.</span>" }}>
            </h1>
            <p className="text-on-surface-variant text-base md:text-xl leading-relaxed max-w-lg mb-8 md:mb-10">
              We believe that the best medicine is grown, not manufactured. Every bottle of Pappu Juice Corner is a testament to the untamed vitality of the earth.
            </p>
            <Link
              href="/menu"
              className="bg-gradient-to-br from-primary to-[#2e7d32] text-on-primary px-7 md:px-8 py-3.5 md:py-4 rounded-full font-headline font-bold text-base md:text-lg hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 inline-block"
            >
              Discover Our Blends
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] max-h-[400px] md:max-h-none rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(25,29,25,0.06)] transform rotate-2">
              <img
                className="w-full h-full object-cover scale-110"
                alt="Sunlight filtering through lush orchard trees"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyVhJ0HC_kztAwbJwkClX4WU_2t8_TQCypUjDEfzH8yfMh04JmjS1pJTf2ltkAGlcLUliqXxnpT_7EV6USu994-GkjM-m73LPhdgb68-1u1i8LGY-xN69Z6o7BvY0N8RLrmq18wcir6zWlRkntFSUtNFgPLfzdqVe2At0ZQ3rsprugX_1qUck4D8CQo7IYNJvh-vDoHCAN47qnn6IVd-EaU8ogYsgp0x4rkxgqBzcznye2cQ2F2JdITz81xns6lR0uujSKU28pYv8"
              />
            </div>
            {/* Overlapping image for asymmetrical editorial feel */}
            <div className="absolute -bottom-8 -left-4 md:-bottom-12 md:-left-12 w-1/2 md:w-2/3 aspect-square rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(25,29,25,0.06)] border-4 md:border-8 border-white transform -rotate-3 hidden sm:block">
              <img
                className="w-full h-full object-cover"
                alt="Fresh green juice bottle in a garden"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvrRGz341v61ZM2YtEbaHEuy3YWTbhZWOBpHelZeb0ovDvZQ01JF_ZmGVM0smqBmzoppcezSh1ajRTCm_agzkx2i5JWCG-ZGUxnQMozMn6_N902QM95CSbpNaaYL2y2qNlU7GP15IcbiYIvUk0_0ocQHQ78gL4VjxXoveCT4cWwgw8zSzc1OBmd0WmX0o2WubaLg8UB_Ay01B-FuTyRtbyFu3PtXVYMWWuamdZVHG3753PR1VbxD-xE8yI5wj55cgTc4B3m-SOuP4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Heritage */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-7">
              <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface mb-6 md:mb-8">{settings?.about?.title || "Our Heritage"}</h2>
              <div className="space-y-4 md:space-y-6 text-on-surface-variant text-base md:text-lg leading-relaxed whitespace-pre-line">
                <p>
                  {settings?.about?.content || "Founded by a collective of farmers and nutritionists, Pappu Juice Corner began with a simple belief: nature's purest ingredients shouldn't be compromised by pasteurization or preservatives. Every bottle we craft reflects our commitment to soil health, seasonal harvesting, and maximum nutrient retention."}
                </p>
                <div className="pt-4 md:pt-6 flex items-center gap-6">
                  <div>
                    <div className="text-3xl md:text-4xl font-black font-headline text-primary">30</div>
                    <div className="text-xs uppercase font-bold tracking-widest text-outline">Years of Purity</div>
                  </div>
                  <div className="w-px h-12 bg-outline-variant/30"></div>
                  <div>
                    <div className="text-3xl md:text-4xl font-black font-headline text-primary">100%</div>
                    <div className="text-xs uppercase font-bold tracking-widest text-outline">Family Owned</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-5 relative h-full min-h-[300px] md:min-h-[400px]">
              <div className="absolute inset-0 bg-surface-container-high rounded-xl -z-10 transform translate-x-4 translate-y-4"></div>
              <img
                className="w-full h-full object-cover rounded-xl shadow-[0_8px_24px_rgba(25,29,25,0.06)]"
                alt="Hands holding fresh soil with a small sprout"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQujlVM7i53FmZIuLhOgMMWvvR14ACSHQm2HCaeGJQpSQBVJJYdY1wajpxHQftBmoD_crQB1Ya9TR7HtHor0Hau6ha1tFBs0n-zVhscH9nT8kBKdGAShg2js1u8588EY6lE1UoF3Wn-wmCqwIxpQ080ITCbVRmjeco_flXZjhaoveORwszckGQmJoYrONJ2u0Hu6JAOd_1RznltJgfzKqBHTZADvEvneK6rpTlfO_S2ui71i-iDMn9_y9RJzv2q9A3p6xV6ErthLs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Sourcing (Bento Grid) */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-surface-container">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 md:mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface tracking-tight">Ethical Sourcing</h2>
            <p className="text-on-surface-variant mt-3 md:mt-4 text-base md:text-lg">Beyond organic. We are restorative.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {/* Regenerative Soil */}
            <div className="bg-surface-container-lowest p-7 md:p-10 rounded-xl shadow-[0_8px_24px_rgba(25,29,25,0.06)] group hover:bg-primary transition-colors duration-500">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#a3f69c] rounded-full flex items-center justify-center mb-6 md:mb-8 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-[#005312] text-2xl md:text-3xl group-hover:text-white">potted_plant</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-headline mb-3 md:mb-4 group-hover:text-white">Regenerative Soil</h3>
              <p className="text-on-surface-variant group-hover:text-white/80 leading-relaxed text-sm md:text-base">
                We don&apos;t just take; we give back. Our farms utilize cover cropping and no-till practices to sequester carbon and restore microbial health.
              </p>
            </div>
            {/* 100-Mile Promise */}
            <div className="bg-surface-container-lowest p-7 md:p-10 rounded-xl shadow-[0_8px_24px_rgba(25,29,25,0.06)] group hover:bg-[#8f4e00] transition-colors duration-500">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#ffdcc2] rounded-full flex items-center justify-center mb-6 md:mb-8 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-[#623400] text-2xl md:text-3xl group-hover:text-white">distance</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-headline mb-3 md:mb-4 group-hover:text-white">100-Mile Promise</h3>
              <p className="text-on-surface-variant group-hover:text-white/80 leading-relaxed text-sm md:text-base">
                Every ingredient is sourced from within a 100-mile radius of our press. This minimizes transit time and supports local biodiversity.
              </p>
            </div>
            {/* Zero Waste */}
            <div className="bg-surface-container-lowest p-7 md:p-10 rounded-xl shadow-[0_8px_24px_rgba(25,29,25,0.06)] group hover:bg-[#455c2d] transition-colors duration-500">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#d0ecaf] rounded-full flex items-center justify-center mb-6 md:mb-8 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-[#374d20] text-2xl md:text-3xl group-hover:text-white">recycling</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-headline mb-3 md:mb-4 group-hover:text-white">Zero Waste</h3>
              <p className="text-on-surface-variant group-hover:text-white/80 leading-relaxed text-sm md:text-base">
                Our leftover fiber is returned to our farms as organic compost, completing a circular journey from earth to bottle and back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Craft of Cold-Pressing */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="md:w-1/3">
              <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface md:sticky md:top-32">
                The Craft of <br />Cold-Pressing
              </h2>
            </div>
            <div className="md:w-2/3 space-y-12 md:space-y-20">
              <div className="flex flex-col sm:flex-row gap-5 md:gap-8 items-start">
                <span className="text-5xl md:text-7xl font-black font-headline text-surface-container-highest">01</span>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold font-headline text-primary mb-3 md:mb-4">Hydraulic Extraction</h4>
                  <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
                    Unlike centrifugal juicers that use fast-spinning blades that heat the produce, we use thousands of pounds of pressure to squeeze every nutrient out of the pulp without oxidizing the delicate enzymes.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 md:gap-8 items-start">
                <span className="text-5xl md:text-7xl font-black font-headline text-surface-container-highest">02</span>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold font-headline text-primary mb-3 md:mb-4">Small Batch Bottling</h4>
                  <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
                    We don&apos;t do mass production. Our blends are created in small, artisanal batches where we can taste and adjust for seasonal variation in sweetness and acidity.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 md:gap-8 items-start">
                <span className="text-5xl md:text-7xl font-black font-headline text-surface-container-highest">03</span>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold font-headline text-primary mb-3 md:mb-4">Purity Guaranteed</h4>
                  <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
                    Never heated, never treated with HPP, and never diluted. From the press to your glass, our juice remains alive with flavor and nutrition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-12 md:py-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto bg-primary rounded-2xl p-8 md:p-12 relative overflow-hidden text-center md:text-left">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden md:block">
            <div className="w-full h-full bg-gradient-to-l from-[#cbffc2] to-transparent"></div>
          </div>
          <div className="relative z-10 md:flex items-center justify-between gap-8">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline text-white mb-3 md:mb-4">Join The Harvest</h2>
              <p className="text-white/80 text-base md:text-lg">Receive weekly insights on seasonal wellness and exclusive blends.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
              <input
                className="px-5 md:px-6 py-3.5 md:py-4 rounded-full bg-white/10 border-none text-white placeholder:text-white/60 focus:ring-2 focus:ring-white w-full sm:min-w-[250px] md:min-w-[300px] outline-none"
                placeholder="Your email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              />
              <button
                onClick={handleSubscribe}
                className="bg-white text-primary px-7 md:px-8 py-3.5 md:py-4 rounded-full font-headline font-bold hover:bg-[#a3f69c] transition-colors flex-shrink-0"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
