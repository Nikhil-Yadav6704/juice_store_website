"use client";

import useSWR from "swr";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { exportToCSV } from "@/lib/exportCsv";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminProductionPage() {
  const { data: productionData, isLoading } = useSWR("/api/admin/production", fetcher, { 
    refreshInterval: 30000,
    dedupingInterval: 10000,
    revalidateOnFocus: false
  });
  const { data: dashboardData } = useSWR("/api/admin/dashboard", fetcher, { 
    refreshInterval: 60000,
    dedupingInterval: 30000,
    revalidateOnFocus: false
  });

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [reminders, setReminders] = useState([
    "Sanitize Cold-Press #3 before 1:00 PM changeover.",
    "Prepare 15kg crushed ice for delivery packaging.",
    "Check temperature of Walk-in Cooler #2."
  ]);
  const [newReminder, setNewReminder] = useState("");

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({...prev, [index]: !prev[index]}));
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (!productionData) return toast.error("No data to export");
    const allItems = [...activeProduction, ...upcomingHour, ...completedToday];
    if (!allItems.length) return toast.error("Queue is empty");
    const data = allItems.map((item: any) => ({
      Product: item.name,
      Quantity: item.count,
      Status: activeProduction.includes(item) ? 'Active' : upcomingHour.includes(item) ? 'Upcoming' : 'Completed'
    }));
    exportToCSV(data, `production_sheet_${new Date().toISOString().split('T')[0]}`);
    toast.success("Production sheet exported.");
  };

  const addReminder = () => {
    if (!newReminder.trim()) return toast.error("Enter a reminder first.");
    setReminders(prev => [...prev, newReminder.trim()]);
    setNewReminder("");
    toast.success("Reminder added.");
  };

  if (isLoading) return <div className="p-8 font-bold text-xl">Loading live kitchen view...</div>;
  if (!productionData) return <div className="p-8 font-bold text-xl text-error">Failed to synchronize with kitchen datastream.</div>;

  const { activeProduction, upcomingHour, completedToday, alerts, kitchenStats } = productionData;

  const getUpcomingBatchTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const m = d.getHours() >= 12 ? 'PM' : 'AM';
    const h = d.getHours() % 12 || 12;
    return `${h}:00 ${m} Batch`;
  };

  const getTargetCompletionTime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    const m = d.getHours() >= 12 ? 'PM' : 'AM';
    const h = d.getHours() % 12 || 12;
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${mins} ${m}`;
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Live Kitchen View</p>
          <h1 className="text-[2.75rem] font-extrabold font-headline text-on-surface tracking-tight leading-none">Production Sheet</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-full font-bold text-sm hover:bg-outline-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">print</span> Print Sheet
          </button>
          <button onClick={handleExportCSV} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Active Production + Alerts) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Active Production Block */}
          <div className="bg-surface-container-low p-8 rounded-[1.5rem] border border-surface-container">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold font-headline text-on-surface mb-1">Active Production</h2>
                <p className="text-sm font-medium text-on-surface-variant">
                  Target Completion: <span className="font-bold text-primary">{getTargetCompletionTime()}</span>
                </p>
              </div>
              <div className="bg-[#a3f69c] text-[#005312] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-pulse"></span> LIVE UPDATES ON
              </div>
            </div>

            <div className="space-y-4">
              
              {activeProduction.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant font-bold border-2 border-dashed border-surface-container rounded-2xl">
                   No immediate instant orders in processing queue.
                </div>
              )}

              {/* Active Cards */}
              {activeProduction.map((item: any, i: number) => (
                <div key={i} className="bg-[#fcfdfa] p-6 rounded-2xl shadow-sm border border-surface-container flex justify-between items-center transition-transform hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl ${item.bg || 'bg-[#ffe4c4]'} flex items-center justify-center text-3xl shadow-sm`}>
                      {item.icon || '🥤'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{item.name}</h3>
                      <p className="text-sm text-on-surface-variant mt-0.5">Priority instant orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary font-headline">x {item.count}</p>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">In Progress</p>
                  </div>
                </div>
              ))}

              {/* Completed Cards */}
              {completedToday.map((item: any, i: number) => (
                <div key={`comp-${i}`} className="bg-[#fcfdfa] p-6 rounded-2xl shadow-sm border border-surface-container flex justify-between items-center opacity-75">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-3xl opacity-50 shadow-sm">
                      {item.icon || '🫚'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface line-through decoration-outline-variant">{item.name}</h3>
                      <p className="text-sm text-on-surface-variant mt-0.5">Recently fulfilled</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="w-8 h-8 rounded-full bg-[#a3f69c] flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[#005312] text-xl">check_circle</span>
                    </div>
                    <p className="text-[9px] font-bold text-[#5c6359] uppercase tracking-widest mt-2">{item.count} Completed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {alerts && alerts.map((alert: any, i: number) => (
              <div key={i} className={`${alert.bgColor || 'bg-[#f2f0e6]'} p-8 rounded-[1.5rem] shadow-sm border ${alert.borderColor || 'border-[#e6e3d5]'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`material-symbols-outlined ${alert.textColor || 'text-[#8f4e00]'}`}>{alert.icon || 'warning'}</span>
                  <p className={`text-[10px] font-bold ${alert.textColor || 'text-[#8f4e00]'} uppercase tracking-widest`}>{alert.title || 'Alert'}</p>
                </div>
                <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">{alert.item || 'System Warning'}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {alert.message}
                </p>
              </div>
            ))}

            <div className="bg-[#52634f] text-white p-8 rounded-[1.5rem] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#a3f69c]">bolt</span>
                <p className="text-[10px] font-bold text-[#a3f69c] uppercase tracking-widest">Kitchen Efficiency</p>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-2">{kitchenStats?.capacity || "100% Capacity"}</h3>
              <p className="text-sm text-[#c8d4c3] leading-relaxed">
                {kitchenStats?.outputStr || "Optimal pace maintained for current staff count."}
              </p>
            </div>

          </div>

        </div>

        {/* Right Column (Upcoming + Reminders) */}
        <div className="flex flex-col gap-6">
          
          {/* Upcoming Hour Block */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm border border-surface-container flex-grow">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-xl">schedule</span>
              <h2 className="text-xl font-bold font-headline text-on-surface">Upcoming Hour</h2>
            </div>

            <div className="space-y-6 mb-8">
              {upcomingHour.length === 0 ? (
                 <p className="text-sm font-bold text-on-surface-variant italic">No scheduled tasks for upcoming batch.</p>
              ) : (
                upcomingHour.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-surface-container pb-4">
                    <div>
                      <h4 className="font-bold text-on-surface truncate max-w-[150px]">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{getUpcomingBatchTime()}</p>
                    </div>
                    <p className="text-xl font-black font-headline text-on-surface">x {item.count}</p>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setIsScheduleModalOpen(true)} className="w-full bg-surface-container-highest text-on-surface font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-outline-variant transition-colors border border-surface-container">
              View Full Schedule
            </button>
          </div>

          <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Full Production Schedule">
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant mb-4">Today's complete processing timeline:</p>
              {[...activeProduction, ...upcomingHour, ...completedToday].length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No batches scheduled for today.</p>
              ) : (
                [...activeProduction.map((i: any) => ({...i, status: 'Active'})), ...upcomingHour.map((i: any) => ({...i, status: 'Upcoming'})), ...completedToday.map((i: any) => ({...i, status: 'Completed'}))].map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-bold text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">x{item.count}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.status === 'Active' ? 'bg-[#a3f69c] text-[#005312]' : item.status === 'Upcoming' ? 'bg-[#ffe4c4] text-[#8f4e00]' : 'bg-surface-container text-on-surface-variant'}`}>{item.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Modal>

          {/* Prep Reminders */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm border border-surface-container">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-6">Prep Reminders</h2>
            
            <div className="space-y-4">
              {reminders.map((reminder, idx) => (
                <label key={idx} className="flex gap-4 cursor-pointer group">
                  <div 
                    className={`w-6 h-6 flex-shrink-0 border-2 rounded-md flex items-center justify-center transition-colors mt-0.5 ${
                      checkedItems[idx] 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-outline-variant group-hover:border-primary'
                    }`}
                    onClick={() => toggleCheck(idx)}
                  >
                    {checkedItems[idx] && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                  </div>
                  <span className={`text-sm leading-relaxed transition-all ${
                    checkedItems[idx] 
                      ? 'text-on-surface-variant line-through decoration-outline-variant opacity-70' 
                      : 'text-on-surface'
                  }`}>
                    {reminder}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <input 
                type="text"
                placeholder="Add a prep reminder..."
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addReminder()}
                className="flex-1 bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <button onClick={addReminder} className="bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#005312] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">add</span> Add
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
