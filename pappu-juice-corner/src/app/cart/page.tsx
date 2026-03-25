"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CountdownTimer from "@/components/CountdownTimer";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSWR("/api/auth/session", fetcher);
  const { data: cartData, mutate: mutateCart, isLoading } = useSWR(
    session?.user ? "/api/cart" : null, 
    fetcher, 
    { 
      dedupingInterval: 500, 
      revalidateOnFocus: true, 
      revalidateOnMount: true,
      shouldRetryOnError: false
    }
  );
  const { data: liveData } = useSWR("/api/orders/live", fetcher, { 
    refreshInterval: 30000, 
    dedupingInterval: 10000 
  });
  const { data: settings } = useSWR("/api/settings", fetcher, { 
    dedupingInterval: 300000, 
    revalidateOnFocus: false 
  });
  const { data: allProducts } = useSWR("/api/products", fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false
  });
  
  const [deliveryType, setDeliveryType] = useState("hourly");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  // Arrival estimate logic
  const getDynamicSlot = () => {
    if (!liveData?.nextBatchEnd) return "Calculating...";
    const batchDate = new Date(liveData.nextBatchEnd);
    return batchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getArrivalEstimate = (type: string) => {
    if (type === "hourly") return `Batch closes at ${getDynamicSlot()}`;
    if (type === "instant") return `Guaranteed dispatch at ${getDynamicSlot()}`;
    return `Arrival: 10-15 mins`;
  };

  const SmallSpinner = () => (
    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  );

  const performCartUpdate = async (productId: string, action: string) => {
    setLoadingProductId(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });

      if (res.status === 409) {
        // Write conflict - wait 100ms and retry once
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryRes = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, action }),
        });
        if (!retryRes.ok) throw new Error();
      } else if (!res.ok) {
        throw new Error();
      }
      
      await mutateCart();
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setLoadingProductId(null);
    }
  };

  const updateQuantity = async (productId: string, action: "add" | "decrement" | "remove") => {
    await performCartUpdate(productId, action);
    if (action === "remove") {
      toast.success("Removed from cart");
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryType }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(`Order placed successfully!`);
        // Immediately clear local cart cache to prevent stale data (Problem 1 & 3)
        mutateCart({ items: [] }, false);
        router.push("/orders");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant font-bold">Loading harvest...</div>;

  const cartItems = cartData?.items || [];
  const isEmpty = cartItems.length === 0;

  let subtotal = 0;
  cartItems.forEach((item: any) => {
    subtotal += item.quantity * item.productId.price;
  });

  let deliveryFee = 0;
  const instantPrice = settings?.delivery?.instantPrice ?? 5.50;
  const superInstantPrice = settings?.delivery?.superInstantPrice ?? 9.00;
  const taxRate = settings?.delivery?.taxRate ?? 0.02;

  if (deliveryType === "instant") deliveryFee = instantPrice;
  if (deliveryType === "super_instant") deliveryFee = superInstantPrice;

  const wellnessTax = subtotal * taxRate;
  const grandTotal = subtotal + deliveryFee + wellnessTax;
  
  const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  // Shop Status Logic (IST Fix)
  const shopSettings = settings?.shop || { isManualClose: false, openingTime: "09:00", closingTime: "21:00" };
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const currentTime = istTime.getUTCHours().toString().padStart(2, '0') + ":" + istTime.getUTCMinutes().toString().padStart(2, '0');
  const isInsideHours = currentTime >= shopSettings.openingTime && currentTime <= shopSettings.closingTime;
  const isShopOpen = !shopSettings.isManualClose && isInsideHours;

  return (
    <div className="min-h-screen bg-[#f7faf3] px-4 sm:px-6 md:px-8 py-6 md:py-12 pt-20 md:pt-24 font-body">
      <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-10">
        
        {/* Top Live Status Banner */}
        <div className="bg-[#2f7831] rounded-[1.25rem] md:rounded-[1.5rem] p-4 sm:p-5 flex flex-col shadow-sm relative overflow-hidden gap-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                 <span className="bg-[#a3f69c] text-[#005312] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                   Live Batch
                 </span>
                 <span className="font-bold text-[14px] md:text-base text-white tracking-tight">
                   {liveData?.count || 0} / 5 Juices Reached
                 </span>
               </div>
               <p className="text-[11px] md:text-xs text-[#c8d4c3] font-medium max-w-md">
                 Hourly free batches require 5 juices to dispatch. If not reached, orders roll over to the next hour.
               </p>
             </div>
             
             <div className="bg-black/20 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] md:text-sm border border-white/10 w-full md:w-auto justify-center">
               <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
               Batch Closes In: {isShopOpen && liveData?.nextBatchEnd ? <CountdownTimer targetDate={liveData.nextBatchEnd} /> : "00:00"}
             </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/20 rounded-full h-2 md:h-2.5 mt-2 border border-white/10 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${((liveData?.count || 0) >= 5) ? 'bg-[#a3f69c]' : 'bg-[#fbdfc6]'}`}
              style={{ width: `${Math.min(((liveData?.count || 0) / 5) * 100, 100)}%` }}
            ></div>
            {((liveData?.count || 0) >= 5) && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
           </div>
          {!isShopOpen && (
            <div className="text-[10px] md:text-[11px] text-[#ffdad6] font-bold mt-2 uppercase tracking-widest flex items-center gap-1.5 px-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
              Batch counting paused: Store is currently closed
            </div>
          )}
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-20 text-center shadow-sm border border-surface-container flex flex-col items-center max-w-2xl mx-auto mt-8 md:mt-16">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 md:mb-8">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-[#5c6359]">shopping_basket</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-3 font-headline tracking-tight">Your harvest is empty</h2>
            <p className="text-[#5c6359] mb-8 md:mb-10 text-base md:text-lg">You haven't added any botanicals to your cart yet.</p>
            <button onClick={() => router.push("/menu")} className="bg-[#1b4321] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold shadow-md hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer">
              Explore Our Menu <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
            
            {/* Left Column - Cart Items */}
            <div className="md:col-span-7 space-y-4 md:space-y-6">
              
              <div className="flex justify-between items-end border-b border-surface-container pb-3 md:pb-4 mb-2">
                <h1 className="text-2xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">Your Harvest</h1>
                <span className="text-[#5c6359] font-medium text-[13px] md:text-sm">{totalItems} items</span>
              </div>

              <div className="space-y-3 md:space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item._id || item.productId?._id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-surface-container flex flex-col sm:flex-row gap-4 md:gap-6 sm:items-center relative group">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-container-low rounded-[1rem] p-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={item.productId.imageUrl} alt={item.productId.name} className="h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                      <div className="space-y-1 w-full sm:w-1/2">
                        <h4 className="font-bold text-[15px] md:text-[17px] text-on-surface font-headline leading-tight">{item.productId.name}</h4>
                        <p className="text-[11px] md:text-[12px] text-[#5c6359] line-clamp-1 font-medium">{item.productId.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-1/2 gap-4 md:gap-6">
                         
                         <div className="flex items-center gap-3 md:gap-4 bg-[#f2f5ee] rounded-full px-2 py-1.5 shadow-inner">
                           <button 
                             onClick={() => updateQuantity(item.productId._id, "decrement")} 
                             disabled={loadingProductId === item.productId._id}
                             className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-on-surface shadow-sm hover:bg-surface-container-lowest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             <span className="material-symbols-outlined text-[14px]">remove</span>
                           </button>
                           <span className="font-bold text-[13px] w-3 flex justify-center">
                             {loadingProductId === item.productId._id ? <SmallSpinner /> : item.quantity}
                           </span>
                           <button 
                             onClick={() => updateQuantity(item.productId._id, "add")} 
                             disabled={loadingProductId === item.productId._id}
                             className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-on-surface shadow-sm hover:bg-surface-container-lowest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             <span className="material-symbols-outlined text-[14px]">add</span>
                           </button>
                         </div>

                         <p className="text-[#1b4321] font-bold text-base md:text-lg">
                           ₹{Number(item.productId.price).toFixed(2)}
                         </p>

                         <button 
                           onClick={() => updateQuantity(item.productId._id, "remove")} 
                           disabled={loadingProductId === item.productId._id}
                           className="flex items-center gap-1 text-[#ba1a1a] hover:text-[#93000a] text-[10px] uppercase font-bold tracking-widest transition-colors pl-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {loadingProductId === item.productId._id ? (
                             <SmallSpinner />
                           ) : (
                             <>
                               <span className="material-symbols-outlined text-[14px]">delete</span>
                               <span className="hidden sm:inline">Remove</span>
                             </>
                           )}
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ritual Upsell */}
              {allProducts && allProducts.length > 0 && (
                <div className="bg-[#e9eee5] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border border-[#dce4d5] mt-6 md:mt-8 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d1ecb4] blur-3xl opacity-50 rounded-full mix-blend-multiply"></div>
                  <div className="relative z-10 flex items-center gap-2 mb-4 md:mb-6 text-on-surface">
                    <span className="material-symbols-outlined text-[#8f4e00]">eco</span>
                    <h3 className="text-lg md:text-xl font-bold font-headline tracking-tight">Complete Your Ritual</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-10">
                    {allProducts
                      .filter((p: any) => !cartItems.some((item: any) => item.productId._id === p._id))
                      .slice(0, 2)
                      .map((product: any) => (
                        <div key={product._id || product.id} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm flex flex-col items-center text-center group">
                          <div className="w-full h-20 md:h-28 overflow-hidden rounded-lg md:rounded-xl mb-3 md:mb-4">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622597467836-f38240662c8b?auto=format&fit=crop&w=300&q=80";
                              }}
                            />
                          </div>
                          <h4 className="font-bold text-[12px] md:text-sm text-on-surface mb-1 line-clamp-1">{product.name}</h4>
                          <p className="text-primary font-bold text-[11px] md:text-xs mb-3 md:mb-4">+₹{Number(product.price).toFixed(0)}</p>
                          <button 
                            onClick={() => updateQuantity(product._id, "add")} 
                            disabled={loadingProductId === product._id}
                            className="w-full py-2 bg-[#f2f5ee] hover:bg-[#e4ebdd] text-[#1b4321] text-[11px] md:text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {loadingProductId === product._id ? <SmallSpinner /> : (
                              <>
                                <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                                Add
                              </>
                            )}
                          </button>
                        </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column - Order Summary & Delivery */}
            <div className="md:col-span-5 space-y-4 md:space-y-6">
              
              {/* Delivery Tier Selection */}
              <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-surface-container">
                <h3 className="text-lg md:text-xl font-bold font-headline mb-4 md:mb-6 tracking-tight text-on-surface">Delivery Tier</h3>
                <div className="space-y-3 md:space-y-4">
                  
                  <label className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === "hourly" ? "border-primary bg-[#f0f9ed]" : "border-surface-container hover:border-outline-variant"}`}>
                    <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center mt-1">
                       <input type="radio" value="hourly" checked={deliveryType === "hourly"} onChange={() => setDeliveryType("hourly")} className="w-4 h-4 text-primary accent-primary cursor-pointer" />
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#e4ebdd] rounded-full flex items-center justify-center flex-shrink-0 text-primary mt-1">
                       <span className="material-symbols-outlined text-[16px] md:text-[18px]">group</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <div>
                           <h4 className="font-bold text-[13px] md:text-[14px] text-on-surface">Tier 1: Hourly Batch</h4>
                           <p className="text-[11px] font-bold text-[#1b4321]">{getArrivalEstimate("hourly")}</p>
                        </div>
                        <span className="font-bold text-[#1b4321] text-[13px] md:text-sm">Free</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-[#5c6359] font-medium mt-1.5 leading-relaxed">
                        Waits for the current hour to close. Requires a 5-juice minimum across all customers to dispatch. If not met, rolls over to the next hour.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === "instant" ? "border-primary bg-[#f0f9ed]" : "border-surface-container hover:border-outline-variant"}`}>
                    <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center mt-1">
                       <input type="radio" value="instant" checked={deliveryType === "instant"} onChange={() => setDeliveryType("instant")} className="w-4 h-4 text-primary accent-primary cursor-pointer" />
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#fbdfc6] rounded-full flex items-center justify-center flex-shrink-0 text-[#8f4e00] mt-1">
                       <span className="material-symbols-outlined text-[16px] md:text-[18px]">bolt</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <div>
                          <h4 className="font-bold text-[13px] md:text-[14px] text-on-surface">Tier 2: Instant Guarantee</h4>
                          <p className="text-[11px] font-bold text-[#8f4e00]">{getArrivalEstimate("instant")}</p>
                        </div>
                        <span className="font-bold text-on-surface text-[13px] md:text-sm">₹{instantPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-[#5c6359] font-medium mt-1.5 leading-relaxed">
                        Still waits for the batch to close, but <strong>bypasses the 5-juice minimum</strong>. Ensures yours (and everyone else's in the batch) goes out immediately when the timer ends.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === "super_instant" ? "border-primary bg-[#f0f9ed]" : "border-surface-container hover:border-outline-variant"}`}>
                    <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center mt-1">
                       <input type="radio" value="super_instant" checked={deliveryType === "super_instant"} onChange={() => setDeliveryType("super_instant")} className="w-4 h-4 text-primary accent-primary cursor-pointer" />
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#a3f69c] rounded-full flex items-center justify-center flex-shrink-0 text-[#005312] mt-1">
                       <span className="material-symbols-outlined text-[16px] md:text-[18px]">rocket_launch</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <div>
                          <h4 className="font-bold text-[13px] md:text-[14px] text-on-surface">Tier 3: Super Instant</h4>
                          <p className="text-[11px] font-bold text-[#005312]">{getArrivalEstimate("super_instant")}</p>
                        </div>
                        <span className="font-bold text-on-surface text-[13px] md:text-sm">₹{superInstantPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-[#5c6359] font-medium mt-1.5 leading-relaxed">
                        Skips the batch entirely. Your juice is made exclusively and delivered immediately in 10-15 minutes. Independent lane priority.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Order Summary Form */}
              <div className="bg-[#e9eee5] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-[#dce4d5] md:sticky md:top-28">
                <h3 className="text-lg md:text-xl font-bold font-headline mb-4 md:mb-6 tracking-tight text-on-surface">Order Summary</h3>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-[13px] md:text-[14px] font-medium">
                  <div className="flex justify-between text-[#5c6359]">
                    <span>Subtotal</span>
                    <span className="text-on-surface">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#5c6359]">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? "text-primary font-bold" : "text-on-surface"}>
                      {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#5c6359]">
                    <span>Wellness Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="text-on-surface">₹{wellnessTax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 md:pt-6 border-t border-[#dce4d5] flex justify-between items-end mb-6 md:mb-8">
                  <span className="font-bold text-xl md:text-2xl text-on-surface font-headline tracking-tight">Total</span>
                  <span className="font-black text-3xl md:text-4xl font-headline tracking-tighter text-[#1b4321]">₹{grandTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder} 
                  disabled={placingOrder || !isShopOpen}
                  className={`w-full py-4 md:py-5 rounded-full font-bold shadow-lg transition-colors flex justify-center items-center gap-3 relative overflow-visible ${
                    isShopOpen 
                    ? "bg-[#1b4321] text-white hover:bg-primary shadow-lg cursor-pointer" 
                    : "bg-surface-container-highest text-on-surface-variant cursor-not-allowed grayscale shadow-none"
                  }`}
                >
                  <span className="absolute -top-3 -right-3 w-9 h-9 md:w-10 md:h-10 bg-[#8f4e00] text-white flex items-center justify-center rounded-full border-4 border-[#e9eee5] shadow-sm transform rotate-12">
                     <span className="material-symbols-outlined text-[16px] md:text-[18px]">shopping_bag</span>
                     <span className="absolute -top-1 -right-1 bg-[#d1ecb4] text-[#005312] w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center">{totalItems}</span>
                  </span>
                  {placingOrder ? "Processing..." : !isShopOpen ? "Store Currently Closed" : "Confirm & Place Order"}
                </button>
                
                {/* Opening Hours Note */}
                <div className={`mt-4 p-4 rounded-2xl border flex flex-col items-center text-center gap-2 ${
                  isShopOpen 
                  ? "bg-[#f0f9ed] border-[#dce4d5] text-[#1b4321]" 
                  : "bg-[#ffdad6] border-[#ffb4ab] text-[#ba1a1a]"
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    Opening Hours
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed">
                    Closed: {shopSettings.closingTime} • Opens: {shopSettings.openingTime}
                    {!isShopOpen && <span className="block mt-1 font-bold text-[11px]">Orders will resume during these hours.</span>}
                  </p>
                </div>
                
                <div className="mt-5 md:mt-6 flex items-center justify-center gap-2 text-[10px] md:text-[11px] text-[#5c6359] font-medium">
                   <span className="material-symbols-outlined text-[#1b4321] text-[14px]">verified</span>
                   Secure payment powered by PJC Pay
                </div>

                {/* Promo Code Input */}
                <div className="flex gap-2 mt-6 md:mt-8">
                  <input type="text" placeholder="Promo code" className="flex-1 bg-surface-container-lowest border border-white/50 rounded-full px-4 md:px-5 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner text-on-surface placeholder:text-[#5c6359] placeholder:font-medium min-w-0" />
                  <button onClick={() => toast.error("Invalid Promo Code")} className="bg-[#e4ebdd] hover:bg-[#d1ecb4] text-[#1b4321] px-5 md:px-6 py-2.5 md:py-3 rounded-full text-sm font-bold transition-colors flex-shrink-0 cursor-pointer">Apply</button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
