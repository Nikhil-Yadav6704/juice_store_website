"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { exportToCSV } from "@/lib/exportCsv";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminOrdersPage() {
  const { data: orders, error, isLoading, mutate } = useSWR("/api/admin/orders", fetcher);
  const { data: liveData } = useSWR("/api/orders/live", fetcher, { refreshInterval: 5000 });
  
  const [filter, setFilter] = useState("All Status");
  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!liveData?.nextBatchEnd) return;
    const interval = setInterval(() => {
      const target = new Date(liveData.nextBatchEnd).getTime();
      const now = new Date().getTime();
      const difference = target - now;
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [liveData]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Order status updated");
        mutate();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  if (isLoading) return <div className="p-8 font-bold text-xl">Loading Live Operations...</div>;
  if (error) return <div className="p-8 text-error font-bold">Failed to load operations.</div>;

  const filteredOrders = orders?.filter((o: any) => {
    const statusMatch = filter === "All Status" || o.status === filter;
    const searchMatch = search === "" || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.userId?.fullName.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExportOrders = () => {
    if (!orders?.length) return toast.error("No order data to export");
    const data = orders.map((o: any) => ({
      OrderID: o.orderId,
      Customer: o.userId?.fullName || 'Guest',
      Items: o.items.map((i: any) => i.name).join('; '),
      Total: o.grandTotal,
      Status: o.status,
      Type: o.deliveryType,
      Date: new Date(o.createdAt).toISOString().split('T')[0]
    }));
    exportToCSV(data, `orders_export_${new Date().toISOString().split('T')[0]}`);
    toast.success("Orders CSV downloaded.");
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-[2.75rem] font-extrabold font-headline text-primary tracking-tight leading-none mb-4">Live Operations</h1>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#8f4e00] text-3xl">schedule</span>
            <span className="text-on-surface-variant font-medium">Current Hour Session:</span>
            <span className="bg-surface-container font-headline font-black text-on-surface px-4 py-1.5 rounded-lg tracking-widest text-lg">
              {timeLeft || "14:42:05"}
            </span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button onClick={handleExportOrders} className="bg-surface-container-lowest shadow-sm rounded-2xl p-5 border border-surface-container w-40 flex flex-col justify-center hover:bg-surface-container transition-colors cursor-pointer">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Orders</div>
            <div className="text-3xl font-black text-primary font-headline">{liveData?.count || filteredOrders.length}</div>
          </button>
          <div className="bg-surface-container-lowest shadow-sm rounded-2xl p-5 border border-surface-container w-40 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Due Next 15m</div>
            <div className="text-3xl font-black text-[#8f4e00] font-headline">{Math.min(8, filteredOrders.filter((o: any) => o.status === 'Pending').length).toString().padStart(2,'0')}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search customer, ID, or items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-lowest border-none shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow text-sm"
            />
          </div>
          <div className="flex gap-2 bg-surface-container-lowest p-1 rounded-2xl shadow-sm">
            {["All Status", "Pending", "Preparing", "Out for Delivery", "Delivered"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  filter === status 
                  ? "bg-primary text-on-primary" 
                  : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {status === "All Status" && <span className="material-symbols-outlined text-[18px]">filter_list</span>}
                {status === "Preparing" && filter !== status ? "In Prep" : status}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary-fixed/20 px-4 py-2.5 rounded-xl">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          Today, Oct 24
        </div>
      </div>

      {/* Operations Table */}
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#f0f3ec]">
              <tr>
                <th className="px-8 py-5 font-bold text-on-surface-variant text-xs uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-5 font-bold text-on-surface-variant text-xs uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 font-bold text-on-surface-variant text-xs uppercase tracking-widest">Items</th>
                <th className="px-8 py-5 font-bold text-on-surface-variant text-xs uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 font-bold text-on-surface-variant text-xs uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 font-bold text-on-surface-variant text-xs uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-on-surface-variant">
                    No active operations found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-surface-container/30 transition-colors group">
                    {/* Order ID */}
                    <td className="px-8 py-6">
                      <p className="font-headline font-bold text-lg text-primary">#{order.orderId.substring(0,8).toUpperCase()}</p>
                    </td>
                    
                    {/* Customer */}
                    <td className="px-8 py-6">
                      <p className="font-bold text-on-surface text-[15px]">{order.userId?.fullName || "Guest Customer"}</p>
                      <p className="text-xs text-on-surface-variant mt-1">4.8 ★ VIP Member</p>
                    </td>
                    
                    {/* Items Cluster */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {order.items.slice(0, 2).map((item: any, idx: number) => (
                            <img 
                              key={idx} 
                              src="https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                              alt="Juice" 
                              className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover"
                            />
                          ))}
                          {order.items.length > 2 && (
                            <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant">
                              +{order.items.length - 2}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant max-w-[150px] truncate">
                          {order.items.map((i:any) => i.name).join(", ")}
                        </p>
                      </div>
                    </td>
                    
                    {/* Type */}
                    <td className="px-8 py-6">
                      {order.deliveryType !== "hourly" ? (
                        <div className="flex items-center gap-2 text-[#8f4e00] font-bold text-sm">
                          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                          Delivery
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                          <span className="material-symbols-outlined text-[18px]">shopping_basket</span>
                          Pickup
                        </div>
                      )}
                    </td>
                    
                    {/* Status Pill */}
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === "Pending" ? "bg-[#ffdad6] text-[#ba1a1a]" :
                        order.status === "Preparing" ? "bg-[#a3f69c] text-[#005312]" :
                        order.status === "Out for Delivery" ? "bg-[#ffdcc2] text-[#2e1500]" :
                        "bg-[#e0e3dd] text-[#40493d]"
                      }`}>
                        {order.status === "Preparing" ? "IN PREP" : order.status === "Out for Delivery" ? "IN TRANSIT" : order.status}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      {order.status === "Pending" && (
                        <button onClick={() => handleStatusUpdate(order._id, "Preparing")} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#005312] transition-colors">
                          Start Prep
                        </button>
                      )}
                      {order.status === "Preparing" && (
                        <button onClick={() => handleStatusUpdate(order._id, "Out for Delivery")} className="bg-[#8f4e00] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#623400] transition-colors">
                          Dispatch
                        </button>
                      )}
                      {order.status === "Out for Delivery" && (
                        <button onClick={() => handleStatusUpdate(order._id, "Delivered")} className="bg-surface-container-highest text-on-surface-variant px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-outline-variant hover:text-on-surface transition-colors">
                          Track
                        </button>
                      )}
                      {order.status === "Delivered" && (
                        <div className="relative" ref={openMenuId === order._id ? menuRef : null}>
                          <button onClick={() => setOpenMenuId(openMenuId === order._id ? null : order._id)} className="text-outline-variant hover:text-on-surface transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          {openMenuId === order._id && (
                            <div className="absolute right-0 top-8 w-48 bg-surface-container-lowest shadow-xl rounded-xl z-50 border border-surface-container py-2">
                              <button onClick={() => { handleExportOrders(); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">download</span> Export Order
                              </button>
                              <button onClick={() => { window.print(); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">print</span> Print Receipt
                              </button>
                              <button onClick={() => { handleStatusUpdate(order._id, 'Cancelled'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-error hover:bg-[#ffdad6] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">delete</span> Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-5 border-t border-surface-container flex justify-between items-center bg-[#fcfdfa]">
          <p className="text-sm text-on-surface-variant font-medium">Showing {paginatedOrders.length} of {filteredOrders.length} orders</p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${currentPage === p ? 'bg-primary text-on-primary' : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
            ))}
            {totalPages > 3 && <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant font-bold">...</span>}
            {totalPages > 3 && <button onClick={() => setCurrentPage(totalPages)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${currentPage === totalPages ? 'bg-primary text-on-primary' : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}`}>{totalPages}</button>}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
