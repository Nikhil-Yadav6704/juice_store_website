"use client";

import useSWR from "swr";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { exportToCSV } from "@/lib/exportCsv";
import CountdownTimer from "@/components/CountdownTimer";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useSWR("/api/admin/dashboard", fetcher, {
    refreshInterval: 60000,
    dedupingInterval: 30000,
    revalidateOnFocus: false
  });
  const { data: liveData } = useSWR("/api/orders/live", fetcher, { 
    refreshInterval: 30000,
    dedupingInterval: 10000
  });
  const { data: products } = useSWR("/api/products", fetcher);
  
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [growthView, setGrowthView] = useState<'Monthly' | 'Weekly'>('Monthly');

  // POS Modal State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = () => {
    if (!dashboardData) return toast.error("No data to export");
    const exportData = [
      {
         Metric: "Daily Revenue", Value: dashboardData?.pulse?.dailyRevenue || 0,
      },
      {
         Metric: "Daily Orders", Value: dashboardData?.pulse?.dailyOrderCount || 0,
      },
      {
         Metric: "Top Product", Value: dashboardData?.pulse?.topProduct || "N/A",
      },
      {
         Metric: "Monthly Revenue", Value: dashboardData?.stats?.monthlyRevenue || 0,
      },
      {
         Metric: "Kitchen Capacity", Value: dashboardData?.stats?.kitchenCapacity || "N/A",
      }
    ];
    exportToCSV(exportData, `orchard_dashboard_summary_${new Date().toISOString().split('T')[0]}`);
    toast.success("Dashboard export complete");
  };

  const handleCreatePOSOrder = async () => {
    if (!selectedProductId) return toast.error("Please select a product");
    if (quantity < 1) return toast.error("Quantity must be at least 1");

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/orders/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId, quantity, customerPhone }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Order ${data.orderId} instantly queued!`);
        setIsNewOrderModalOpen(false);
        // Reset state
        setSelectedProductId("");
        setQuantity(1);
        setCustomerPhone("");
      } else {
        toast.error(data.message || "Failed to create order");
      }
    } catch {
      toast.error("An error occurred while processing the order");
    } finally {
      setIsProcessing(false);
    }
  };


  if (isLoading) return <div className="p-8 text-xl font-bold">Loading dashboard...</div>;

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-[2.5rem] font-extrabold font-headline text-on-surface leading-tight tracking-tight">Dashboard Overview</h1>
          <p className="text-on-surface-variant mt-1 text-sm font-medium">Real-time vitals for Pappu Juice Corner production and sales.</p>
        </div>
        <div className="flex gap-3 md:gap-4 w-full sm:w-auto">
          <button onClick={handleExport} className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-full font-bold text-sm hover:bg-outline-variant transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
          <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add</span> New Order
          </button>
        </div>
      </div>
      
      {/* New Order Modal */}
      <Modal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} title="Create Fast Order (POS)">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant mb-6">Enter rapid details for in-store walk-in customers.</p>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Customer Phone (Optional)</label>
            <input 
              type="text" 
              placeholder="+91 98765 43210" 
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-surface-container-low p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Select Cold-Press Selection</label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-surface-container-low p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="">Select Juice</option>
                {products?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Quantity</label>
              <input 
                type="number" 
                min="1" 
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-surface-container-low p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          </div>
          <button 
            onClick={handleCreatePOSOrder}
            disabled={isProcessing}
            className={`w-full bg-primary text-on-primary py-4 rounded-xl font-bold mt-4 transition-all cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
          >
            {isProcessing ? "Processing..." : "Process & Queue Order"}
          </button>
        </div>
      </Modal>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: Orders */}
        <div className="bg-surface-container-lowest p-5 md:p-8 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm flex flex-col justify-between h-[180px] md:h-[220px]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-primary-fixed flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-on-primary-fixed">shopping_cart</span>
            </div>
            <span className="bg-[#e4fcde] text-[#0d631b] px-3 py-1 rounded-full text-xs font-bold font-label">
              +12% vs last hour
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Current Hour Orders</p>
            <p className="text-[2.5rem] md:text-[4rem] leading-none font-black text-on-surface font-headline">{dashboardData?.stats.currentHourOrders || 0}</p>
          </div>
        </div>
        
        {/* Card 2: Batch */}
        <div className="bg-[#ffe4c4] p-5 md:p-8 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm flex flex-col justify-between h-[180px] md:h-[220px]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-[#8f4e00] flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-white">timer</span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#ffe4c4] flex items-center justify-center text-xs">👨‍🍳</div>
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#ffe4c4] flex items-center justify-center text-xs">👩‍🍳</div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[#8f4e00] uppercase tracking-widest mb-1">Next Cold-Press Batch</p>
            <div className="text-[2.5rem] md:text-[4rem] leading-none font-black text-[#8f4e00] font-headline tracking-tighter flex items-center gap-2 md:gap-4 mt-1">
              {dashboardData?.stats?.isShopOpen ? (
                liveData?.nextBatchEnd ? <CountdownTimer targetDate={liveData.nextBatchEnd} /> : "00:00"
              ) : (
                <>
                  00:00 <span className="text-[10px] md:text-sm bg-[#8f4e00] text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl font-bold tracking-widest uppercase">CLOSED</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Juices */}
        <div className="bg-tertiary-fixed-dim p-5 md:p-8 rounded-[1.25rem] md:rounded-[1.5rem] shadow-sm flex flex-col justify-between h-[180px] md:h-[220px] sm:col-span-2 md:col-span-1">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-white">eco</span>
            </div>
            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold font-label">
              {dashboardData?.stats.kitchenCapacity || "88% Capacity"}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Juices Bottled Today</p>
            <p className="text-[2.5rem] md:text-[4rem] leading-none font-black text-on-surface font-headline">{dashboardData?.stats.totalJuicesToday || 0}</p>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Monthly Growth */}
        <div className="lg:col-span-2 bg-surface-container p-8 rounded-[1.5rem]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold font-headline text-on-surface">Monthly Growth</h3>
              <p className="text-sm text-on-surface-variant mt-1">Revenue performance across the last {growthView === 'Monthly' ? '12 Months' : '7 Days'}.</p>
            </div>
            <div className="bg-surface-container-lowest flex rounded-full p-1 shadow-sm">
              <button onClick={() => setGrowthView('Monthly')} className={`px-5 py-1.5 text-sm font-bold rounded-full transition-colors cursor-pointer ${growthView === 'Monthly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Monthly</button>
              <button onClick={() => setGrowthView('Weekly')} className={`px-5 py-1.5 text-sm font-bold rounded-full transition-colors cursor-pointer ${growthView === 'Weekly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Weekly</button>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 md:gap-4 mb-4 text-center">
            {dashboardData?.revenueHistory?.[growthView]?.map((item: any, idx: number) => {
              const history = dashboardData.revenueHistory[growthView];
              const maxRev = Math.max(...history.map((h: any) => h.revenue), 1);
              // Scale to 80% if data exists, otherwise show a tiny placeholder
              const height = item.revenue > 0 ? (item.revenue / maxRev) * 80 : 2; 
              const isLast = idx === history.length - 1;
              
              return (
                <div key={idx} className="flex-grow flex flex-col justify-end items-center gap-2 h-full">
                  <div 
                    className={`w-full transition-all duration-500 ${
                      item.revenue > 0 
                        ? (isLast ? 'bg-tertiary rounded-t-lg md:rounded-t-xl' : 'bg-[#dbe4d5] rounded-t-lg md:rounded-t-xl') 
                        : 'bg-outline-variant/10 border border-dashed border-outline-variant/20 h-1 rounded-sm'
                    }`}
                    style={{ height: item.revenue > 0 ? `${height}%` : undefined }}
                    title={item.revenue > 0 ? `₹${item.revenue}` : 'No revenue'}
                  ></div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter sm:tracking-normal">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-outline-variant/30">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-2xl font-headline font-semibold text-on-surface">₹{dashboardData?.stats?.monthlyRevenue || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Monthly Orders</p>
              <p className="text-2xl font-headline font-semibold text-on-surface">{dashboardData?.stats?.monthlyOrdersCount || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Avg Order</p>
              <p className="text-2xl font-headline font-semibold text-on-surface">₹{dashboardData?.stats?.avgOrderValue || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Best Product</p>
              <p className="text-xl font-headline font-bold text-primary">{dashboardData?.pulse?.topProduct || "-"}</p>
            </div>
          </div>
        </div>

        {/* Right: Pulse & Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container p-6 rounded-[1.5rem] flex-grow">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Today's Pulse</h3>
            <div className="flex flex-col gap-3">
              <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  <span className="font-bold text-sm text-on-surface">Daily Revenue</span>
                </div>
                <span className="font-bold text-on-surface">₹{dashboardData?.pulse?.dailyRevenue || 0}</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                  <span className="font-bold text-sm text-on-surface">Daily Orders</span>
                </div>
                <span className="font-bold text-on-surface">{dashboardData?.pulse?.dailyOrderCount || 0}</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline">star</span>
                  <span className="font-bold text-sm text-on-surface">Top Product</span>
                </div>
                <span className="font-bold text-primary text-sm max-w-[100px] truncate">{dashboardData?.pulse?.topProduct || "-"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
               <Link href="/admin/menu" className="bg-surface-container h-24 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer">
                 <span className="material-symbols-outlined mb-1 text-primary">restaurant_menu</span>
                 <span className="text-xs font-bold">Update Menu</span>
               </Link>
               <Link href="/admin/production" className="bg-surface-container h-24 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer">
                 <span className="material-symbols-outlined mb-1 text-secondary">inventory_2</span>
                 <span className="text-xs font-bold">Stock Count</span>
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Table */}
      <div className="bg-surface-container p-4 md:p-8 rounded-[1.25rem] md:rounded-[1.5rem] overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-8 gap-3">
          <h3 className="text-lg md:text-xl font-bold font-headline">Top Performing Blends (Monthly)</h3>
          <Link href="/admin/analytics" className="text-sm font-bold text-primary hover:underline cursor-pointer">View All Products</Link>
        </div>
        
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-4 mb-4 min-w-[600px]">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Units Sold</div>
            <div className="col-span-2">Gross Revenue</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Trend</div>
          </div>

          <div className="flex flex-col gap-2">
            {dashboardData?.topProducts?.map((tp: any, i: number) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center py-3 min-w-[600px]">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-fixed/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🍹</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{tp.name}</p>
                    <p className="text-xs text-on-surface-variant">Cold Pressed</p>
                  </div>
                </div>
                <div className="col-span-2 font-bold text-on-surface">{tp.units}</div>
                <div className="col-span-2 font-bold text-on-surface">₹{tp.revenue}</div>
                <div className="col-span-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    tp.status === 'In Stock' ? 'bg-[#c4eed0] text-[#0f5223]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}>
                    {tp.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <span className={`material-symbols-outlined text-sm ${tp.status === 'In Stock' ? 'text-primary' : 'text-error'}`}>
                    {tp.status === "In Stock" ? "trending_up" : "trending_flat"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
