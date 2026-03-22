"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CartPage() {
  const router = useRouter();
  const { data: cartData, mutate: mutateCart, isLoading } = useSWR("/api/cart", fetcher);
  const { data: liveData } = useSWR("/api/orders/live", fetcher, { refreshInterval: 5000 });
  const { data: settings } = useSWR("/api/settings", fetcher);
  
  const [deliveryType, setDeliveryType] = useState("hourly");
  const [timeLeft, setTimeLeft] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!liveData?.nextBatchEnd) return;
    
    const interval = setInterval(() => {
      const target = new Date(liveData.nextBatchEnd).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [liveData]);

  const updateQuantity = async (productId: string, action: "add" | "decrement" | "remove") => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });
      mutateCart();
    } catch {
      toast.error("Failed to update cart");
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
        mutateCart();
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

  return (
    <div className="min-h-screen bg-[#f7faf3] px-4 sm:px-6 md:px-8 py-6 md:py-12 pt-20 md:pt-24 font-body">
      <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-10">
        
        {/* Top Live Status Banner */}
        <div className="bg-[#2f7831] rounded-[1.25rem] md:rounded-[1.5rem] p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm relative overflow-hidden gap-3 md:gap-0">
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white w-full md:w-auto">
            <span className="bg-[#a3f69c] text-[#005312] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              Live Status
            </span>
            <span className="font-bold text-[13px] md:text-sm tracking-tight">{liveData?.count || 14} Active deliveries in your area</span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden md:flex flex-col items-end border-r border-white/20 pr-6 mr-2">
               <span className="text-[9px] uppercase tracking-widest text-[#c8d4c3] font-bold">Estimated Slot</span>
               <span className="font-headline font-bold text-white text-lg tracking-tight">14:20 - 14:45</span>
            </div>
            <div className="bg-black/20 text-white flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-bold text-[13px] md:text-sm border border-white/10">
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">schedule</span>
              Expires in {timeLeft || "08:52"}
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-20 text-center shadow-sm border border-surface-container flex flex-col items-center max-w-2xl mx-auto mt-8 md:mt-16">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 md:mb-8">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-[#5c6359]">shopping_basket</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-3 font-headline tracking-tight">Your harvest is empty</h2>
            <p className="text-[#5c6359] mb-8 md:mb-10 text-base md:text-lg">You haven't added any botanicals to your cart yet.</p>
            <button onClick={() => router.push("/menu")} className="bg-[#1b4321] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold shadow-md hover:bg-primary transition-colors flex items-center gap-2">
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
                  <div key={item._id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-surface-container flex flex-col sm:flex-row gap-4 md:gap-6 sm:items-center relative group">
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
                           <button onClick={() => updateQuantity(item.productId._id, "decrement")} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-on-surface shadow-sm hover:bg-surface-container-lowest transition-colors">
                             <span className="material-symbols-outlined text-[14px]">remove</span>
                           </button>
                           <span className="font-bold text-[13px] w-3 text-center">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.productId._id, "add")} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-on-surface shadow-sm hover:bg-surface-container-lowest transition-colors">
                             <span className="material-symbols-outlined text-[14px]">add</span>
                           </button>
                         </div>

                         <p className="text-[#1b4321] font-bold text-base md:text-lg">
                           ₹{Number(item.productId.price).toFixed(2)}
                         </p>

                         <button onClick={() => updateQuantity(item.productId._id, "remove")} className="flex items-center gap-1 text-[#ba1a1a] hover:text-[#93000a] text-[10px] uppercase font-bold tracking-widest transition-colors pl-2">
                           <span className="material-symbols-outlined text-[14px]">delete</span>
                           <span className="hidden sm:inline">Remove</span>
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ritual Upsell */}
              <div className="bg-[#e9eee5] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border border-[#dce4d5] mt-6 md:mt-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d1ecb4] blur-3xl opacity-50 rounded-full mix-blend-multiply"></div>
                <div className="relative z-10 flex items-center gap-2 mb-4 md:mb-6 text-on-surface">
                   <span className="material-symbols-outlined text-[#8f4e00]">eco</span>
                   <h3 className="text-lg md:text-xl font-bold font-headline tracking-tight">Complete Your Ritual</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-10">
                   {/* Upsell 1 */}
                   <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm flex flex-col items-center text-center">
                     <img src="https://images.unsplash.com/photo-1596280453303-34e9e033fb9b?q=80&w=200&auto=format&fit=crop" alt="Hemp Hearts" className="w-full h-20 md:h-28 object-cover rounded-lg md:rounded-xl mb-3 md:mb-4" />
                     <h4 className="font-bold text-[12px] md:text-sm text-on-surface mb-1">Organic Hemp Hearts</h4>
                     <p className="text-primary font-bold text-[11px] md:text-xs mb-3 md:mb-4">+₹4.50</p>
                     <button onClick={() => toast.error("Currently out of stock")} className="w-full py-2 bg-[#f2f5ee] hover:bg-[#e4ebdd] text-[#1b4321] text-[11px] md:text-xs font-bold rounded-full transition-colors">Add to Bag</button>
                   </div>
                   {/* Upsell 2 */}
                   <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm flex flex-col items-center text-center">
                     <img src="https://images.unsplash.com/photo-1622597467836-f309a6fc430a?q=80&w=200&auto=format&fit=crop" alt="Botanical Glassware" className="w-full h-20 md:h-28 object-cover rounded-lg md:rounded-xl mb-3 md:mb-4" />
                     <h4 className="font-bold text-[12px] md:text-sm text-on-surface mb-1">Botanical Glassware</h4>
                     <p className="text-primary font-bold text-[11px] md:text-xs mb-3 md:mb-4">+₹18.00</p>
                     <button onClick={() => toast.error("Currently out of stock")} className="w-full py-2 bg-[#f2f5ee] hover:bg-[#e4ebdd] text-[#1b4321] text-[11px] md:text-xs font-bold rounded-full transition-colors">Add to Bag</button>
                   </div>
                </div>
              </div>

            </div>

            {/* Right Column - Order Summary & Delivery */}
            <div className="md:col-span-5 space-y-4 md:space-y-6">
              
              {/* Delivery Speed */}
              <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-surface-container">
                <h3 className="text-lg md:text-xl font-bold font-headline mb-4 md:mb-6 tracking-tight text-on-surface">Delivery Speed</h3>
                <div className="space-y-3 md:space-y-4">
                  
                  <label className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === "hourly" ? "border-primary bg-[#f0f9ed]" : "border-surface-container hover:border-outline-variant"}`}>
                    <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center">
                       <input type="radio" value="hourly" checked={deliveryType === "hourly"} onChange={() => setDeliveryType("hourly")} className="w-4 h-4 text-primary accent-primary" />
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#e4ebdd] rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                       <span className="material-symbols-outlined text-[16px] md:text-[18px]">schedule</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-[13px] md:text-[14px] text-on-surface">Free (Hourly)</h4>
                        <span className="font-bold text-[#1b4321] text-[13px] md:text-sm">Free</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-[#5c6359] font-medium">Arrival: 15:00 - 16:00</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === "instant" ? "border-primary bg-[#f0f9ed]" : "border-surface-container hover:border-outline-variant"}`}>
                    <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center">
                       <input type="radio" value="instant" checked={deliveryType === "instant"} onChange={() => setDeliveryType("instant")} className="w-4 h-4 text-primary accent-primary" />
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#fbdfc6] rounded-full flex items-center justify-center flex-shrink-0 text-[#8f4e00]">
                       <span className="material-symbols-outlined text-[16px] md:text-[18px]">bolt</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-[13px] md:text-[14px] text-on-surface">Instant Delivery</h4>
                        <span className="font-bold text-on-surface text-[13px] md:text-sm">₹{instantPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-[#5c6359] font-medium">Arrival: 20-30 mins</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === "super_instant" ? "border-primary bg-[#f0f9ed]" : "border-surface-container hover:border-outline-variant"}`}>
                    <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center">
                       <input type="radio" value="super_instant" checked={deliveryType === "super_instant"} onChange={() => setDeliveryType("super_instant")} className="w-4 h-4 text-primary accent-primary" />
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#a3f69c] rounded-full flex items-center justify-center flex-shrink-0 text-[#005312]">
                       <span className="material-symbols-outlined text-[16px] md:text-[18px]">rocket_launch</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-[13px] md:text-[14px] text-on-surface">Super Instant</h4>
                        <span className="font-bold text-on-surface text-[13px] md:text-sm">₹{superInstantPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-[#5c6359] font-medium">Arrival: 10-15 mins</p>
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
                  disabled={placingOrder}
                  className="w-full bg-[#1b4321] text-white py-4 md:py-5 rounded-full font-bold shadow-lg hover:bg-primary transition-colors disabled:opacity-70 flex justify-center items-center gap-3 relative overflow-visible"
                >
                  <span className="absolute -top-3 -right-3 w-9 h-9 md:w-10 md:h-10 bg-[#8f4e00] text-white flex items-center justify-center rounded-full border-4 border-[#e9eee5] shadow-sm transform rotate-12">
                     <span className="material-symbols-outlined text-[16px] md:text-[18px]">shopping_bag</span>
                     <span className="absolute -top-1 -right-1 bg-[#d1ecb4] text-[#005312] w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center">{totalItems}</span>
                  </span>
                  {placingOrder ? "Processing..." : "Confirm & Place Order"}
                </button>
                
                <div className="mt-5 md:mt-6 flex items-center justify-center gap-2 text-[10px] md:text-[11px] text-[#5c6359] font-medium">
                   <span className="material-symbols-outlined text-[#1b4321] text-[14px]">verified</span>
                   Secure payment powered by PJC Pay
                </div>

                {/* Promo Code Input */}
                <div className="flex gap-2 mt-6 md:mt-8">
                  <input type="text" placeholder="Promo code" className="flex-1 bg-surface-container-lowest border border-white/50 rounded-full px-4 md:px-5 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner text-on-surface placeholder:text-[#5c6359] placeholder:font-medium min-w-0" />
                  <button onClick={() => toast.error("Invalid Promo Code")} className="bg-[#e4ebdd] hover:bg-[#d1ecb4] text-[#1b4321] px-5 md:px-6 py-2.5 md:py-3 rounded-full text-sm font-bold transition-colors flex-shrink-0">Apply</button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
