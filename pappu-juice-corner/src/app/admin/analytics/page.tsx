"use client";

import useSWR from "swr";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, YAxis
} from "recharts";
import Modal from "@/components/Modal";
import { exportToCSV } from "@/lib/exportCsv";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useSWR("/api/admin/analytics", fetcher, { refreshInterval: 60000 });

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const handleExport = () => {
    if (!analytics) return toast.error("No analytics data available to export");
    const exportData = [
      { Metric: "Total Volume", Value: analytics.cards.totalVolume.value },
      { Metric: "Today Percent", Value: analytics.cards.today.percent },
      { Metric: "Weekly Percent", Value: analytics.cards.weekly.percent },
      { Metric: "Monthly Percent", Value: analytics.cards.monthly.percent },
      { Metric: "Active Users", Value: analytics.userBehavior.activeUsers },
      ...analytics.productPerformance.map((p: any) => ({
        Metric: `Product: ${p.name}`, Value: `Units: ${p.units} | Revenue: ${p.revenue}`
      }))
    ];
    exportToCSV(exportData, `operational_insights_${new Date().toISOString().split('T')[0]}`);
    toast.success("Operational Insights exported.");
  };

  if (isLoading) return <div className="p-8 font-bold text-xl">Loading live insights...</div>;
  if (!analytics) return <div className="p-8 font-bold text-xl text-error">Failed to load analytics engine.</div>;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-[2.75rem] font-extrabold font-headline text-primary tracking-tight leading-none mb-4">Operational Insights</h1>
          <p className="text-on-surface-variant font-medium">Real-time performance metrics for Pappu Juice Corner ecosystem.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsDateModalOpen(true)} className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-full font-bold text-sm hover:bg-outline-variant transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span> {dateRange}
          </button>
          <button onClick={handleExport} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
        </div>
      </div>

      <Modal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} title="Select Date Range">
         <div className="space-y-2">
            {["Today", "Last 7 Days", "Last 30 Days", "This Quarter", "Year to Date"].map(range => (
               <label key={range} className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors">
                  <input 
                    type="radio" 
                    name="date_range" 
                    checked={dateRange === range}
                    onChange={() => setDateRange(range)}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="font-bold text-on-surface">{range}</span>
               </label>
            ))}
            <button onClick={() => { toast.success("Timeline updated!"); setIsDateModalOpen(false); }} className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold mt-4 cursor-pointer">Apply Range</button>
         </div>
      </Modal>

      <div className="flex items-center gap-2 text-on-surface">
        <span className="material-symbols-outlined text-primary text-xl">bar_chart</span>
        <h2 className="text-lg font-bold font-headline">Order Performance</h2>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Today</p>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${analytics?.cards?.today?.percent >= 0 ? "bg-[#a3f69c] text-[#005312]" : "bg-[#ffdad6] text-[#ba1a1a]"}`}>
              {analytics?.cards?.today?.percent >= 0 ? "+" : ""}{analytics?.cards?.today?.percent ?? 0}%
            </span>
          </div>
          <p className="text-4xl leading-none font-black text-primary font-headline">{analytics.cards.today.value}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Weekly</p>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${analytics?.cards?.weekly?.percent >= 0 ? "bg-[#a3f69c] text-[#005312]" : "bg-[#ffdad6] text-[#ba1a1a]"}`}>
              {analytics?.cards?.weekly?.percent >= 0 ? "+" : ""}{analytics?.cards?.weekly?.percent ?? 0}%
            </span>
          </div>
          <p className="text-4xl leading-none font-black text-primary font-headline">{analytics.cards.weekly.value}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Monthly</p>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${analytics?.cards?.monthly?.percent >= 0 ? "bg-[#a3f69c] text-[#005312]" : "bg-[#ffdad6] text-[#ba1a1a]"}`}>
              {analytics?.cards?.monthly?.percent >= 0 ? "+" : ""}{analytics?.cards?.monthly?.percent ?? 0}%
            </span>
          </div>
          <p className="text-4xl leading-none font-black text-primary font-headline">{analytics.cards.monthly.value}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Volume</p>
            <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
          </div>
          <p className="text-4xl leading-none font-black text-primary font-headline">{( (analytics?.cards?.totalVolume?.value ?? 0) / 1000).toFixed(1)}k</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Main Charts & Products) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Orders Per Day Chart via RECHARTS */}
          <div className="bg-surface-container-lowest p-8 flex flex-col rounded-[1.5rem] shadow-sm border border-surface-container">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-headline text-on-surface">Orders per Day</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Order Count
              </div>
            </div>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.ordersPerDay || []} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: "#72796e", fontWeight: "bold"}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 10, fill: "#72796e", fontWeight: "bold"}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1c18", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                    itemStyle={{ color: "#a3f69c" }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#a3f69c" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: "#fff", stroke: "#005312" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center gap-2 text-on-surface mt-2">
            <span className="material-symbols-outlined text-[#8f4e00] text-xl">eco</span>
            <h2 className="text-lg font-bold font-headline">Product Performance</h2>
          </div>

          {/* Product Performance Table Area */}
          <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-sm border border-surface-container overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#fcfdfa]">
                <tr>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest border-b border-surface-container">Product</th>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest border-b border-surface-container">Units Sold</th>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest border-b border-surface-container">Revenue</th>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest border-b border-surface-container text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {(analytics?.productPerformance || []).map((item: any, idx: number) => (
                   <tr key={idx} className="hover:bg-[#fcfdfa] transition-colors">
                     <td className="px-8 py-6 flex items-center gap-4">
                       <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center text-xl font-bold font-headline text-on-surface-variant">
                         {idx + 1}
                       </div>
                       <div>
                         <p className="font-bold text-on-surface truncate max-w-[150px]">{item.name}</p>
                         <p className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Cold Press</p>
                       </div>
                     </td>
                     <td className="px-8 py-6 font-bold text-on-surface">{item.units.toLocaleString()}</td>
                     <td className="px-8 py-6 font-bold text-primary">₹{item.revenue.toLocaleString()}</td>
                     <td className="px-8 py-6 text-right">
                        {item.trend === 'up' ? 
                          <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span> :
                          <span className="material-symbols-outlined text-error text-[18px]">trending_down</span>
                        }
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-on-surface mt-2">
            <span className="material-symbols-outlined text-[#8f4e00] text-xl">bolt</span>
            <h2 className="text-sm font-bold font-headline">Cross-Selling Insights</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6 bg-surface-container px-6 py-6 rounded-[1.5rem] border border-surface-container-high">
            <div className="bg-surface-container-lowest p-6 rounded-2xl">
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Strongest Duo</p>
              <p className="text-sm font-bold text-on-surface mb-3 min-h-[40px] flex items-center">{analytics?.crossSelling?.strongest || "N/A"}</p>
              <p className="text-xs font-bold text-primary">{analytics?.crossSelling?.strongestRate || 0}% attachment rate</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl">
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Missed Opportunity</p>
              <p className="text-sm font-bold text-on-surface mb-3 min-h-[40px] flex items-center">{analytics?.crossSelling?.missed || "N/A"}</p>
              <p className="text-xs font-bold text-error">{analytics?.crossSelling?.missedRate || 0}% attachment rate</p>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          
          {/* Peak Order Hours */}
          <div className="bg-[#1b4321] text-white p-8 rounded-[1.5rem] shadow-sm flex flex-col min-h-[460px]">
             <div className="w-12 h-12 bg-[#2f7831] rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white">schedule</span>
             </div>
             <h3 className="text-2xl font-bold font-headline mb-3 leading-tight">Peak Order <br/>Hours</h3>
             <p className="text-[#a3f69c] text-sm leading-relaxed mb-12 opacity-90">
                Most activity occurs between 06:00 AM and 11:59 AM.
             </p>
             
             <div className="mt-auto">
                <div className="flex justify-between items-end mb-3">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Morning<br/>Rush</span>
                   <span className="font-bold text-lg">{analytics?.peakHours?.morningPercent || 0}%<br/><span className="text-[10px] font-normal tracking-widest uppercase">volume</span></span>
                </div>
                <div className="w-full bg-[#112a14] rounded-full h-3">
                   <div className="bg-white h-3 rounded-full transition-all duration-1000" style={{ width: `${analytics?.peakHours?.morningPercent || 0}%` }}></div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-xl">person</span>
            <h2 className="text-lg font-bold font-headline">User Behavior</h2>
          </div>

          {/* User Behavior Card */}
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm border border-surface-container flex-grow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Users</p>
                <p className="text-3xl font-black text-primary font-headline">{(analytics?.userBehavior?.activeUsers || 0).toLocaleString()}</p>
              </div>
              <span className="text-[10px] font-black text-on-surface">+{analytics?.userBehavior?.activeUsersMoM || 0}% MoM</span>
            </div>

            <div className="flex h-10 gap-1 mb-8 overflow-hidden rounded-md">
              <div className="h-full bg-[#1b4321] transition-all" style={{ width: `${Math.round((analytics?.userBehavior?.recurring || 0) / Math.max(1, analytics?.userBehavior?.activeUsers || 0) * 100)}%` }}></div>
              <div className="h-full bg-[#7a9d70] transition-all" style={{ width: `${Math.round((analytics?.userBehavior?.newLeads || 0) / Math.max(1, analytics?.userBehavior?.activeUsers || 0) * 100)}%` }}></div>
              <div className="h-full bg-[#ffdad6] transition-all" style={{ width: `${Math.round((analytics?.userBehavior?.atRisk || 0) / Math.max(1, analytics?.userBehavior?.activeUsers || 0) * 100)}%` }}></div>
            </div>

            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">User Type Breakdown</p>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm whitespace-nowrap">
                <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#1b4321]"></span><span className="font-bold text-on-surface">Recurring ({Math.round(analytics.userBehavior.recurring / Math.max(1, analytics.userBehavior.activeUsers) * 100)}%)</span></div>
                <span className="text-on-surface-variant text-xs">{analytics.userBehavior.recurring.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm whitespace-nowrap">
                <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#7a9d70]"></span><span className="font-bold text-on-surface">New Leads ({Math.round(analytics.userBehavior.newLeads / Math.max(1, analytics.userBehavior.activeUsers) * 100)}%)</span></div>
                <span className="text-on-surface-variant text-xs">{analytics.userBehavior.newLeads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm whitespace-nowrap">
                <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#ffdad6]"></span><span className="font-bold text-on-surface">At Risk ({Math.round(analytics.userBehavior.atRisk / Math.max(1, analytics.userBehavior.activeUsers) * 100)}%)</span></div>
                <span className="text-on-surface-variant text-xs">{analytics.userBehavior.atRisk.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Top Re-engagement Insight</p>
            <div className="bg-[#52634f] text-white p-5 rounded-2xl text-xs leading-relaxed">
               {(analytics?.userBehavior?.atRisk || 0) > 0 ? `We noticed ${analytics?.userBehavior?.atRisk} users disengaging. Prepare a targeted push campaign today.` : "User engagement is peaking. No At-Risk drops identified."}
              <button disabled={(analytics?.userBehavior?.atRisk || 0) === 0} onClick={() => toast.success("Campaign boosted!")} className="block mt-4 underline font-bold text-[10px] uppercase tracking-widest cursor-pointer disabled:cursor-default">
                Boost Campaign
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Revenue Growth Banner Chart */}
      <div className="bg-[#1a1c18] text-white p-10 rounded-[1.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between min-h-[300px]">
        <div className="relative z-10 md:w-1/3 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold font-headline mb-3">Revenue Growth</h2>
          <p className="text-[#a1a89c] text-sm leading-relaxed mb-8">
            Detailed tracking of wholesale vs direct-to-consumer revenue aggregate.
          </p>
          <div className="flex gap-12">
            <div>
              <p className="text-[10px] font-bold text-[#72796e] uppercase tracking-widest mb-1">Wholesale Totals</p>
              <p className="text-3xl font-black font-headline tracking-tight text-[#a3f69c]">₹{analytics.revenueGrowth.wholesaleTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#72796e] uppercase tracking-widest mb-1">Consumer Net</p>
              <p className="text-3xl font-black font-headline tracking-tight text-white">₹{analytics.revenueGrowth.consumerTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Fully Interactive Recharts Stacked/Composite BarChart */}
        <div className="relative z-20 flex-grow h-[220px] md:h-auto mt-8 md:mt-0 xl:ml-12 overflow-hidden">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={analytics?.revenueGrowth?.history || []} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
               <XAxis dataKey="period" tick={{fontSize: 10, fill: "#72796e", fontWeight: "bold"}} axisLine={false} tickLine={false} dy={10} />
               <Tooltip 
                 cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                 contentStyle={{ backgroundColor: "#2a2c27", border: "1px solid #44473e", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                 itemStyle={{ fontWeight: "bold" }}
               />
               <Bar dataKey="wholesale" stackId="a" fill="#a3f69c" radius={[0, 0, 4, 4]} name="Wholesale" />
               <Bar dataKey="consumer" stackId="a" fill="#44473e" radius={[4, 4, 0, 0]} name="Consumer" />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
