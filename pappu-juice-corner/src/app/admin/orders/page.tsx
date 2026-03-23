"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { exportToCSV } from "@/lib/exportCsv";
import CountdownTimer from "@/components/CountdownTimer";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminOrdersPage() {
  const { data: orders, error, isLoading, mutate } = useSWR("/api/admin/orders", fetcher, { 
    dedupingInterval: 30000,
    revalidateOnFocus: false 
  });
  const { data: liveData } = useSWR("/api/orders/live", fetcher, { 
    refreshInterval: 30000, 
    dedupingInterval: 10000 
  });
  const { data: settings, mutate: mutateSettings } = useSWR("/api/admin/settings", fetcher, {
    dedupingInterval: 60000,
    revalidateOnFocus: false
  });
  
  const toggleShopStatus = async () => {
    if (!settings) return;
    const newStatus = !settings.shop?.isManualClose;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop: { ...settings.shop, isManualClose: newStatus } }),
      });
      if (res.ok) {
        toast.success(`Shop manually ${newStatus ? 'closed' : 'opened'}`);
        mutateSettings();
      } else {
        toast.error("Failed to update shop status");
      }
    } catch {
      toast.error("Error updating shop status");
    }
  };

  const [filter, setFilter] = useState("All Status");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
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

  const handleStatusUpdate = async (id: string, newStatus: string, cancellationReason?: string) => {
    try {
      // Optimistic Update
      const newOrders = (Array.isArray(orders) ? orders : []).map((o: any) => 
        o._id === id ? { ...o, status: newStatus, cancellationReason, cancelledBy: newStatus === 'Cancelled' ? 'admin' : o.cancelledBy } : o
      );
      mutate(newOrders, false);

      const body: any = { status: newStatus };
      if (newStatus === 'Cancelled') {
        body.cancellationReason = cancellationReason;
        body.cancelledBy = 'admin';
      }
      
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Order status updated");
        mutate();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to update status");
      mutate(); // Revert
    }
  };

  if (isLoading) return <div className="p-8 font-bold text-xl">Loading Live Operations...</div>;
  if (error) return <div className="p-8 text-error font-bold">Failed to load operations.</div>;

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((o: any) => {
    const statusMatch = filter === "All Status" || o.status === filter;
    const searchMatch = search === "" || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.userId?.fullName.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExportOrders = () => {
    if (!orders?.length) return toast.error("No order data to export");
    const data = (Array.isArray(orders) ? orders : []).map((o: any) => ({
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

  // Shop Status Logic
  const shopSettings = settings?.shop || { isManualClose: false, openingTime: "09:00", closingTime: "21:00" };
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
  const isInsideHours = currentTime >= shopSettings.openingTime && currentTime <= shopSettings.closingTime;
  const isShopOpen = !shopSettings.isManualClose && isInsideHours;

  return (
    <div className="space-y-10 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-[2.75rem] font-extrabold font-headline text-primary tracking-tight leading-none mb-4">Live Operations</h1>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#8f4e00] text-3xl">schedule</span>
              <span className="text-on-surface-variant font-medium">Current Hour Session:</span>
              <span className="bg-surface-container font-headline font-black text-on-surface px-4 py-1.5 rounded-lg tracking-widest text-lg">
                {isShopOpen && liveData?.nextBatchEnd ? <CountdownTimer targetDate={liveData.nextBatchEnd} format="hh:mm:ss" /> : "00:00:00"}
              </span>
            </div>
            {!isShopOpen && (
              <div className="text-[10px] font-bold text-[#ba1a1a] uppercase tracking-widest ml-11 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                Session paused: Store is currently closed
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mr-2">Shop Operational Status</div>
          <button 
            onClick={toggleShopStatus}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              settings?.shop?.isManualClose 
              ? "bg-[#ffdad6] text-[#ba1a1a] border-2 border-[#ffb4ab]" 
              : "bg-[#a3f69c] text-[#005312] border-2 border-[#7cdb73]"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {settings?.shop?.isManualClose ? "lock" : "lock_open"}
            </span>
            {settings?.shop?.isManualClose ? "Shop is CLOSED (Manual)" : "Shop is OPEN"}
          </button>
        </div>
        
        <div className="flex gap-4">
          <button onClick={handleExportOrders} className="bg-surface-container-lowest shadow-sm rounded-2xl p-5 border border-surface-container w-40 flex flex-col justify-center hover:bg-surface-container transition-colors cursor-pointer">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Orders</div>
            <div className="text-3xl font-black text-primary font-headline">{liveData?.count || filteredOrders.length}</div>
          </button>
          <div className="bg-surface-container-lowest shadow-sm rounded-2xl p-5 border border-surface-container w-40 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Due Next 15m</div>
            <div className="text-3xl font-black text-[#8f4e00] font-headline">
              {isShopOpen ? Math.min(8, (Array.isArray(filteredOrders) ? filteredOrders : []).filter((o: any) => o.status === 'Pending').length).toString().padStart(2,'0') : "00"}
            </div>
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
                  <tr 
                    key={order._id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`transition-all duration-200 group cursor-pointer ${
                      order.deliveryType === 'instant' ? 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab]' : 
                      order.deliveryType === 'super_instant' ? 'bg-[#ff897d] text-black hover:bg-[#ff5449]' : 
                      'hover:bg-surface-container/30'
                    }`}
                  >
                    {/* Order ID */}
                    <td className="px-8 py-6">
                      <p className={`font-headline font-bold text-lg ${
                        order.deliveryType === 'super_instant' ? 'text-black' : 
                        order.deliveryType === 'instant' ? 'text-[#8f4e00]' : 'text-primary'
                      }`}>
                        #{order.orderId.substring(0,8).toUpperCase()}
                      </p>
                    </td>
                    
                    {/* Customer */}
                    <td className="px-8 py-6">
                      <p className={`font-bold text-[15px] ${order.deliveryType === 'super_instant' ? 'text-black' : 'text-on-surface'}`}>
                        {order.userId?.fullName || "Guest Customer"}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${
                        order.deliveryType === 'super_instant' ? 'text-black/70' : 
                        order.deliveryType === 'instant' ? 'text-[#ba1a1a]/80' : 'text-on-surface-variant'
                      }`}>
                        {order.userId?.phone || "No phone"} • {order.userId?.juicesCount || 0} Juices
                      </p>
                    </td>
                    
                    {/* Items Cluster */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {order.items.slice(0, 2).map((item: any, idx: number) => (
                            <img 
                              key={idx} 
                              src={item.productId?.imageUrl || item.imageUrl || "https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                              alt={item.name || "Juice"} 
                              className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80";
                              }}
                            />
                          ))}
                          {order.items.length > 2 && (
                            <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant">
                              +{order.items.length - 2}
                            </div>
                          )}
                        </div>
                        <p className={`text-xs max-w-[150px] truncate ${
                          order.deliveryType === 'super_instant' ? 'text-black/60' : 
                          order.deliveryType === 'instant' ? 'text-[#ba1a1a]/70' : 'text-on-surface-variant'
                        }`}>
                          {order.items.map((i:any) => i.name).join(", ")}
                        </p>
                      </div>
                    </td>
                    
                    {/* Type */}
                    <td className="px-8 py-6">
                      {order.deliveryType !== "hourly" ? (
                        <div className={`flex items-center gap-2 font-bold text-sm ${
                          order.deliveryType === 'super_instant' ? 'text-black' : 
                          order.deliveryType === 'instant' ? 'text-[#8f4e00]' : 'text-[#8f4e00]'
                        }`}>
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
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                        order.deliveryType === 'super_instant' ? 'bg-black/10 text-black border-black/20' :
                        order.status === "Pending" ? "bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]" :
                        order.status === "Preparing" ? "bg-[#a3f69c] text-[#005312] border-[#7cdb73]" :
                        order.status === "Out for Delivery" ? "bg-[#ffdcc2] text-[#2e1500] border-[#ffb4ab]" :
                        "bg-[#e0e3dd] text-[#40493d] border-[#ced4da]"
                      }`}>
                        {order.status === "Preparing" ? "IN PREP" : order.status === "Out for Delivery" ? "IN TRANSIT" : order.status}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {order.status === "Pending" && (
                          <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, "Preparing"); }} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm ${
                            order.deliveryType === 'super_instant' ? 'bg-black text-white hover:bg-black/80' : 'bg-primary text-on-primary hover:bg-[#005312]'
                          }`}>
                            Start Prep
                          </button>
                        )}
                        {order.status === "Preparing" && (
                          <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, "Out for Delivery"); }} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm ${
                            order.deliveryType === 'super_instant' ? 'bg-black text-white hover:bg-black/80' : 'bg-[#8f4e00] text-white hover:bg-[#623400]'
                          }`}>
                            Dispatch
                          </button>
                        )}
                        {order.status === "Out for Delivery" && (
                          <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, "Delivered"); }} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm ${
                            order.deliveryType === 'super_instant' ? 'bg-black/10 text-black hover:bg-black/20 border border-black/10' : 'bg-surface-container-highest text-on-surface-variant hover:bg-outline-variant hover:text-on-surface'
                          }`}>
                            Complete
                          </button>
                        )}
                        
                        <div className="relative" ref={openMenuId === order._id ? menuRef : null}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === order._id ? null : order._id); }} 
                            className={`transition-colors p-2 rounded-full ${
                              order.deliveryType === 'super_instant' ? 'text-black/80 hover:text-black hover:bg-black/10' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          {openMenuId === order._id && (
                            <div className="absolute right-0 top-10 w-48 bg-surface-container-lowest shadow-xl rounded-xl z-50 border border-surface-container py-2 animate-in fade-in zoom-in duration-200">
                              <button onClick={() => { handleExportOrders(); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">download</span> Export Order
                              </button>
                              <button onClick={() => { window.print(); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">print</span> Print Receipt
                              </button>
                              {order.status !== 'Cancelled' && (
                                <button onClick={(e) => { 
                                  e.stopPropagation();
                                  const reason = window.prompt("Enter cancellation reason to show the customer:");
                                  if (reason !== null && reason.trim() !== "") {
                                    handleStatusUpdate(order._id, 'Cancelled', reason.trim());
                                  } else if (reason !== null) {
                                    toast.error("Cancellation reason is required.");
                                  }
                                  setOpenMenuId(null); 
                                }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-error hover:bg-[#ffdad6] transition-colors flex items-center gap-2 border-t border-surface-container mt-1 pt-2">
                                  <span className="material-symbols-outlined text-[16px]">delete_forever</span> Cancel Order
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center bg-[#f0f3ec]">
              <div>
                <h2 className="text-2xl font-black font-headline text-primary tracking-tight">Order Details</h2>
                <p className="text-sm font-medium text-on-surface-variant">#{selectedOrder.orderId.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Customer</h3>
                  <p className="font-bold text-on-surface">{selectedOrder.userId?.fullName || "Guest"}</p>
                  <p className="text-sm text-on-surface-variant">{selectedOrder.userId?.email || "No email"}</p>
                  <p className="text-sm text-on-surface-variant">{selectedOrder.userId?.phone || "No phone"}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Delivery Type</h3>
                  <p className={`font-bold inline-block px-3 py-1 rounded-full text-[11px] uppercase tracking-wider ${
                    selectedOrder.deliveryType === 'instant' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 
                    selectedOrder.deliveryType === 'super_instant' ? 'bg-[#ff897d] text-black' : 
                    'bg-[#a3f69c] text-[#005312]'
                  }`}>
                    {selectedOrder.deliveryType === 'hourly' ? 'Free (Hourly Batch)' : 
                     selectedOrder.deliveryType === 'instant' ? 'Instant Delivery' : 'Super Instant'}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-surface-container">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden p-1 shadow-sm border border-surface-container">
                          <img 
                            src={item.productId?.imageUrl || item.imageUrl || "https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"} 
                            alt={item.name} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{item.name}</p>
                          <p className="text-xs text-on-surface-variant">{item.quantity}x • ₹{item.price}</p>
                        </div>
                      </div>
                      <p className="font-black text-primary">₹{item.lineTotal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-surface-container bg-[#fcfdfa] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Grand Total</p>
                <p className="text-3xl font-black text-primary font-headline tracking-tighter">₹{selectedOrder.grandTotal}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="px-6 py-3 rounded-xl border-2 border-surface-container font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                  Print Receipt
                </button>
                <button onClick={() => setSelectedOrder(null)} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-[#005312] transition-colors shadow-md">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
