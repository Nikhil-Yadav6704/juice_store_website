"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const { data: liveData } = useSWR("/api/orders/live", fetcher, { refreshInterval: 5000 });
  const { data: rewardData } = useSWR("/api/user/rewards", fetcher);
  const { data: orders, isLoading } = useSWR("/api/orders", fetcher);
  
  const [timeLeft, setTimeLeft] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

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

  const activeOrders = orders?.filter((o: any) => !['Delivered', 'Cancelled'].includes(o.status)) || [];
  const pastOrders = orders?.filter((o: any) => ['Delivered', 'Cancelled'].includes(o.status)) || [];

  return (
    <div className="min-h-screen bg-[#f7faf3] px-4 sm:px-6 md:px-8 py-6 md:py-12 pt-20 md:pt-24 font-body">
      <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-10">
        
        {/* Top Hero Tracker */}
        <div className="bg-[#185324] rounded-[1.25rem] md:rounded-[1.5rem] p-4 sm:p-5 md:p-8 shadow-lg relative overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:flex-nowrap md:items-center w-full md:justify-between md:gap-6">
            
            {/* Left Col - Estimate */}
            <div className="flex items-center gap-4 md:gap-5 text-white flex-1 min-w-0">
              <div className="w-11 h-11 md:w-14 md:h-14 bg-[#2f7831] rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                 <span className="material-symbols-outlined text-[20px] md:text-[24px]">timer</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-[#a3f69c] mb-0.5">Batch Closing</span>
                <div className="font-headline font-bold flex items-baseline gap-1.5">
                   <span className="text-2xl md:text-4xl tracking-tighter">{timeLeft || "45:00"}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-white/20"></div>

            {/* Middle Col - Status */}
            <div className="flex items-center gap-4 md:gap-5 text-white flex-1 min-w-0">
              <div className="w-11 h-11 md:w-14 md:h-14 bg-[#d97706] rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                 <span className="material-symbols-outlined text-[20px] md:text-[24px]">local_fire_department</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-[#fbdfc6] mb-0.5">Kitchen Status</span>
                <div className="font-headline font-bold flex items-baseline gap-1.5">
                   <span className="text-2xl md:text-4xl tracking-tighter">{liveData?.count || 0}</span>
                   <span className="text-sm md:text-lg font-medium text-white/80">orders ahead</span>
                </div>
              </div>
            </div>

            {/* Right Col - Pill */}
            <div className="flex-shrink-0">
               <div className="bg-white text-on-surface px-4 md:px-6 py-2.5 md:py-3.5 rounded-full font-bold text-[12px] md:text-[13px] flex items-center gap-2 shadow-sm w-fit">
                 <span className="material-symbols-outlined text-[#185324] text-[16px] md:text-[18px]">info</span>
                 STATUS: {activeOrders.length === 0 ? "IDLE" : 
                          activeOrders.some((o: any) => o.status === "Out for Delivery") ? "IN TRANSIT" : 
                          activeOrders.some((o: any) => o.status === "Preparing") ? "PREPARING" : 
                          "PENDING"}
               </div>
            </div>

          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-on-surface-variant font-bold">Loading harvest history...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start mt-4 md:mt-8">
            
            {/* Left Column (Main Content) */}
            <div className="md:col-span-8 space-y-8 md:space-y-12">
              
              {/* Active Selection Block */}
              {activeOrders.length > 0 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-extrabold font-headline tracking-tight text-on-surface">Active Selection</h2>
                    <span className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse"></span>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {activeOrders.map((order: any) => (
                      <div key={order._id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 sm:p-5 md:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-surface-container border-l-[4px] md:border-l-[6px] border-l-[#1b4321] relative overflow-hidden">
                        
                        {/* Header mapping */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 md:gap-4 mb-5 md:mb-8">
                          <div>
                            <span className="inline-block bg-[#fbdfc6] text-[#8f4e00] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 md:mb-3 shadow-sm">
                              {order.status}
                            </span>
                            <h3 className="font-bold text-lg md:text-xl font-headline text-on-surface tracking-tight mb-1">{order.orderId}</h3>
                            <p className="text-[12px] md:text-[13px] text-[#5c6359] font-medium">
                              {new Date(order.createdAt).toLocaleString()} <span className="mx-1">•</span> {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} Items
                            </p>
                          </div>
                          
                          <div className="sm:text-right">
                             <div className="font-black text-xl md:text-2xl font-headline text-[#1b4321] mb-1">
                               ₹{Number(order.grandTotal).toFixed(2)}
                             </div>
                             <div className="text-[11px] md:text-[12px] text-[#5c6359] font-medium">
                               {order.deliveryType === 'hourly' ? 'Free Delivery' : 'Paid Delivery (₹)'}
                             </div>
                          </div>
                        </div>

                        {/* Items line-up */}
                        <div className="flex flex-wrap gap-3 md:gap-4 mb-5 md:mb-8">
                          {order.items.map((item: any, idx: number) => (
                             <div key={idx} className="bg-[#f2f5ee] rounded-xl md:rounded-2xl p-2 pr-3 md:p-2.5 md:pr-5 flex items-center gap-2 md:gap-3 min-w-0 max-w-full sm:w-[180px] md:w-[200px]">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center p-1 shadow-sm flex-shrink-0">
                                  <img src="https://images.unsplash.com/photo-1622597467836-f309a6fc430a?q=80&w=200&auto=format&fit=crop" alt="juice" className="h-full object-contain" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                   <span className="font-bold text-[11px] md:text-[12px] text-on-surface line-clamp-1">{item.name || "Botanical Juice"}</span>
                                   <span className="text-[10px] text-[#5c6359] font-medium">{item.quantity}x • Organic</span>
                                </div>
                             </div>
                          ))}
                        </div>

                        {/* Order Timeline Map Bottom */}
                        <div className="pt-4 md:pt-6 border-t border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
                           <div className="flex items-center gap-2">
                              {/* Step 1: Placed (Always active if not cancelled) */}
                              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#d1ecb4] text-[#005312] flex items-center justify-center"><span className="material-symbols-outlined text-[12px] md:text-[14px]">done</span></div>
                              
                              <div className={`w-3 md:w-4 h-px ${['Preparing', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-[#d1ecb4]' : 'bg-surface-container-high'}`}></div>
                              
                              {/* Step 2: Preparing */}
                              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${['Preparing', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-[#d1ecb4] text-[#005312]' : 'bg-[#e4ebdd] text-[#5c6359]'}`}><span className="material-symbols-outlined text-[12px] md:text-[14px]">restaurant</span></div>
                              
                              <div className={`w-3 md:w-4 h-px ${['Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-[#d1ecb4]' : 'bg-surface-container-high'}`}></div>
                              
                              {/* Step 3: Out for Delivery */}
                              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${['Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-[#d1ecb4] text-[#005312]' : 'bg-[#e4ebdd] text-[#5c6359]'}`}><span className="material-symbols-outlined text-[12px] md:text-[14px]">local_shipping</span></div>
                           </div>
                           
                           {order.status === "Pending" ? (
                             <button onClick={() => toast.error("Cancellation currently not supported here.")} className="text-[#ba1a1a] font-bold text-[13px] hover:underline transition-all">Cancel Order</button>
                           ) : (
                             <span className="text-[#5c6359] font-medium text-[12px]">Cannot cancel once prep starts</span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order History List */}
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Order History</h2>
                
                {pastOrders.length === 0 && activeOrders.length === 0 ? (
                  <div className="text-[#5c6359] text-sm">You have no previous orders.</div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {pastOrders.map((order: any) => (
                      <div key={order._id} className="bg-[#f2f5ee] rounded-[1.25rem] md:rounded-[1.5rem] p-4 md:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 md:gap-4 border border-transparent hover:border-[#dce4d5] transition-colors">
                        <div className="flex items-center gap-4 md:gap-5">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#e4ebdd] rounded-full flex items-center justify-center shrink-0">
                             <span className="material-symbols-outlined text-[#5c6359] text-[18px] md:text-[20px]">shopping_bag</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-[15px] md:text-[16px] text-on-surface font-headline">{order.orderId}</h4>
                            <p className="text-[11px] md:text-[12px] text-[#5c6359] font-medium mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()} <span className="mx-1">•</span> {order.status}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6 sm:justify-end pl-14 sm:pl-0">
                           <span className="font-bold text-base md:text-lg text-on-surface">₹{Number(order.grandTotal).toFixed(2)}</span>
                           <button onClick={async () => {
                             try {
                               for (const item of order.items) {
                                 await fetch('/api/cart', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ productId: item.productId, quantity: item.quantity })
                                 });
                               }
                               toast.success('Items added to your cart!');
                             } catch {
                               toast.error('Failed to reorder. Please try again.');
                             }
                           }} className="bg-white text-on-surface px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[12px] font-bold shadow-sm hover:shadow transition-shadow border border-[#dce4d5]">
                             Reorder
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {pastOrders.length > (showAllHistory ? Infinity : 5) && !showAllHistory && (
                  <button onClick={() => setShowAllHistory(true)} className="w-full py-3.5 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] border-2 border-dashed border-[#c8d4c3] text-[#5c6359] font-bold text-[13px] hover:bg-white hover:border-[#1b4321] transition-all mt-4 md:mt-6">
                    Load More History ({pastOrders.length - 5} more)
                  </button>
                )}
              </div>

            </div>

            {/* Right Column (Side Panels) */}
            <div className="md:col-span-4 space-y-4 md:space-y-6">
               
               {/* Orchard Rewards */}
               {rewardData?.rewards?.enabled && (
                 <div className="bg-[#e9eee5] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#dce4d5] relative overflow-hidden">
                   <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#d1ecb4] opacity-20 transform -rotate-12 scale-150 blur-3xl rounded-full"></div>
                   
                   <div className="relative z-10">
                     <h3 className="font-headline text-lg md:text-xl font-bold text-[#1b4321] mb-2 tracking-tight">Orchard Rewards</h3>
                     <p className="text-[12px] md:text-[13px] text-[#5c6359] font-medium leading-relaxed mb-6 md:mb-8 max-w-[200px]">
                       {rewardData.rewards.rewardText.replace("{count}", Math.max(0, rewardData.rewards.threshold - (rewardData.juicesCount % rewardData.rewards.threshold)).toString())}
                     </p>
                     
                     <div className="w-full h-2.5 bg-[#dce4d5] rounded-full overflow-hidden mb-3">
                       <div className="h-full bg-[#1b4321] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (rewardData.juicesCount % rewardData.rewards.threshold) / rewardData.rewards.threshold * 100)}%` }}></div>
                     </div>
                     <div className="text-[9px] font-black tracking-widest uppercase text-[#5c6359]">
                       {rewardData.juicesCount % rewardData.rewards.threshold}/{rewardData.rewards.threshold} Juices Collected
                     </div>
                   </div>
                 </div>
               )}

               {/* Need Help Panel */}
               <div className="bg-[#f2f5ee] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-transparent">
                  <h3 className="font-headline text-[16px] md:text-[17px] font-bold text-on-surface mb-4 md:mb-6 tracking-tight">Need help?</h3>
                  
                  <div className="space-y-2">
                    <button onClick={() => window.location.href = 'mailto:support@pappujuice.com?subject=Order Support'} className="w-full flex items-center justify-start gap-3 p-3 text-[13px] font-medium text-[#5c6359] hover:text-[#1b4321] hover:bg-white rounded-xl transition-all">
                      <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                      Chat with Support
                    </button>
                    <button onClick={() => window.location.href = '/about'} className="w-full flex items-center justify-start gap-3 p-3 text-[13px] font-medium text-[#5c6359] hover:text-[#1b4321] hover:bg-white rounded-xl transition-all">
                      <span className="material-symbols-outlined text-[18px]">help_outline</span>
                      Delivery FAQ
                    </button>
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
