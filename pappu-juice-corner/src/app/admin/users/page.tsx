"use client";

import useSWR from "swr";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { exportToCSV } from "@/lib/exportCsv";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminUsersPage() {
  const { data: users, error, isLoading, mutate } = useSWR("/api/admin/users", fetcher, {
    dedupingInterval: 30000,
    revalidateOnFocus: false
  });
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 10;

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Consumer / Standard");
  const [tempPassword, setTempPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleExport = () => {
    if (!users) return toast.error("No directory to export");
    const exportData = users.map((u: any) => ({
      ID: u._id,
      FullName: u.fullName,
      Email: u.email,
      Phone: u.phone || "N/A",
      Status: u.status,
      Role: u.role,
      TotalOrders: u.ordersCount || 0,
      RegistrationDate: new Date(u.createdAt).toISOString().split('T')[0]
    }));
    exportToCSV(exportData, `orchard_users_${new Date().toISOString().split('T')[0]}`);
    toast.success("Users CSV export completed.");
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`User access ${newStatus}`);
        mutate();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleCreateUser = async () => {
    if (!fullName || !email) return toast.error("Name and Email are required");
    
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, role }),
      });

      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.tempPassword);
        setIsNewUserModalOpen(false);
        setIsPasswordModalOpen(true);
        // Clear form
        setFullName("");
        setEmail("");
        setRole("Consumer / Standard");
        mutate();
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch {
      toast.error("An error occurred while creating the user");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <div className="p-8 font-bold text-xl">Loading directory...</div>;
  if (error) return <div className="p-8 text-error font-bold">Failed to load users.</div>;

  const filteredUsers = users?.filter((u: any) => {
    const statusMatch = filter === "All" || u.status === filter.toLowerCase();
    const searchMatch = search === "" || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activeUsers = users?.filter((u:any) => u.status === 'active').length || 0;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-[2.75rem] font-extrabold font-headline text-on-surface tracking-tight leading-none mb-4">User Directory</h1>
          <p className="text-on-surface-variant font-medium">Manage your community and oversee account activities.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExport} className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-full font-bold text-sm hover:bg-outline-variant transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
          <button onClick={() => setIsNewUserModalOpen(true)} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">person_add</span> New User
          </button>
        </div>
      </div>

      <Modal isOpen={isNewUserModalOpen} onClose={() => setIsNewUserModalOpen(false)} title="Register New User">
        <div className="space-y-4">
           <input 
             type="text" 
             placeholder="Full Name" 
             value={fullName}
             onChange={(e) => setFullName(e.target.value)}
             className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" 
           />
           <input 
             type="email" 
             placeholder="Email Address" 
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" 
           />
           <select 
             value={role}
             onChange={(e) => setRole(e.target.value)}
             className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20"
           >
             <option>Consumer / Standard</option>
             <option>System Administrator</option>
           </select>
           <button 
             onClick={handleCreateUser}
             disabled={isCreating}
             className={`w-full bg-primary text-on-primary py-3 rounded-xl font-bold mt-2 cursor-pointer ${isCreating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
           >
             {isCreating ? "Creating..." : "Create User"}
           </button>
        </div>
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="User Created Successfully">
        <div className="space-y-4 py-4">
          <p className="text-sm text-on-surface-variant">Please share this temporary password with the user. They can change it via their profile page after logging in.</p>
          <div className="bg-surface-container-highest p-6 rounded-2xl flex items-center justify-between group">
            <span className="text-2xl font-mono font-bold tracking-widest text-primary">{tempPassword}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                toast.success("Password copied to clipboard");
              }}
              className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center hover:bg-outline-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
            </button>
          </div>
          <button 
            onClick={() => setIsPasswordModalOpen(false)}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold mt-4 hover:shadow-lg transition-all cursor-pointer"
          >
            I've noted the password
          </button>
        </div>
      </Modal>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Directory Filters">
        <div className="space-y-4">
           <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4 accent-primary" /> High Value Only ({'>'}10 Orders)</label>
           <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4 accent-primary" /> Recently Blocked</label>
           <button onClick={() => { toast.success("Filters applied"); setIsFilterModalOpen(false); }} className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold mt-4 cursor-pointer">Apply Search Query</button>
        </div>
      </Modal>

      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="System Security Logs">
        <div className="space-y-3 font-mono text-xs bg-[#1a1c18] text-[#a3f69c] p-4 rounded-xl h-64 overflow-y-auto">
           <p>[08:42:11] SSL Handshake Confirmed.</p>
           <p>[09:12:04] User auth token expired: usr_89xA</p>
           <p className="text-error">[11:59:21] FAILED LOGIN: IP 192.168.1.1</p>
           <p>[12:01:00] Webhook push resolved.</p>
        </div>
      </Modal>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm flex flex-col justify-between border border-surface-container">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#e0ffd9] flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-[#0d631b]">group</span>
            </div>
            <span className="bg-[#a3f69c] text-[#005312] px-3 py-1 rounded-full text-xs font-black font-label">
              +12%
            </span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Members</p>
            <p className="text-[3.5rem] leading-none font-black text-on-surface font-headline">{users?.length || 0}</p>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm flex flex-col justify-between border border-surface-container">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#ffe4c4] flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-[#8f4e00]">shopping_cart</span>
            </div>
            <span className="bg-[#ffdcc2] text-[#8f4e00] px-3 py-1 rounded-full text-xs font-black font-label">
              High Value
            </span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Subscribers</p>
            <p className="text-[3.5rem] leading-none font-black text-on-surface font-headline">{activeUsers}</p>
          </div>
        </div>

        <div className="bg-primary p-8 rounded-[1.5rem] shadow-sm text-on-primary flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-headline font-bold text-xl mb-3">Growth Milestone</h3>
            <p className="text-primary-fixed text-sm mb-6 leading-relaxed max-w-[220px]">
              You have reached 85% of your monthly registration goal. Keep going!
            </p>
            <div className="w-full bg-[#0a4d15] rounded-full h-3">
              <div className="bg-primary-fixed h-3 rounded-full w-[85%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-4 rounded-2xl bg-surface-container-lowest border-none shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow text-sm"
          />
        </div>
        <div className="flex gap-2 bg-surface-container-lowest p-1.5 rounded-[1.125rem] shadow-sm flex-shrink-0">
          {["All", "Active", "Blocked"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                filter === status 
                ? "bg-[#a3f69c] text-[#005312]" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button onClick={() => setIsFilterModalOpen(true)} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden border border-surface-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#fcfdfa]">
              <tr>
                <th className="px-8 py-6 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Full Name</th>
                <th className="px-8 py-6 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-6 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Registration</th>
                <th className="px-8 py-6 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Total Orders</th>
                <th className="px-8 py-6 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-on-surface-variant">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user: any) => {
                  const isTopTier = user.ordersCount > 10;
                  const initials = user.fullName.split(' ').map((n:any)=>n[0]).join('').substring(0,2).toUpperCase();
                  
                  return (
                    <tr key={user._id} className="hover:bg-surface-container/30 transition-colors group">
                      {/* Name Cell */}
                      <td className="px-8 py-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          user.status === 'blocked' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#c4eed0] text-[#0f5223]'
                        }`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-[15px]">{user.fullName}</p>
                          <p className="text-xs text-on-surface-variant mt-1">ID: #{user._id.substring(0,5).toUpperCase()}</p>
                        </div>
                      </td>
                      
                      {/* Contact Info */}
                      <td className="px-8 py-6">
                        <p className="font-medium text-on-surface text-sm">{user.email}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{user.phone || "+1 (555) 000-0000"}</p>
                      </td>
                      
                      {/* Registration */}
                      <td className="px-8 py-6">
                        <p className="font-medium text-on-surface text-sm">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {new Date(user.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      
                      {/* Orders */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-on-surface text-lg">{user.ordersCount || 0}</span>
                          {(user.ordersCount > 10) ? (
                            <span className="bg-[#e4ebdd] text-[#40493d] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-outline-variant/30">Top Tier</span>
                          ) : (user.ordersCount === 0) ? (
                            <span className="bg-[#ffe4c4] text-[#8f4e00] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-outline-variant/30">New</span>
                          ) : null}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          user.status === 'active' ? 'bg-[#a3f69c] text-[#005312]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-[#005312]' : 'bg-[#ba1a1a]'}`}></span>
                          <span className="capitalize">{user.status}</span>
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-8 py-6 text-right">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handleStatusToggle(user._id, user.status)}
                              className={`font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                                user.status === 'active' 
                                ? "bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white" 
                                : "bg-[#a3f69c] text-[#005312] hover:bg-[#005312] hover:text-[#a3f69c]"
                               }`}
                            >
                              {user.status === 'active' ? 'Block Access' : 'Unblock'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-surface-container flex justify-between items-center bg-[#fcfdfa]">
          <p className="text-sm text-on-surface-variant font-medium">Showing <span className="font-bold text-on-surface">{Math.min(USERS_PER_PAGE, filteredUsers?.length || 0)}</span> of {users?.length || 0} users</p>
          <div className="flex gap-2">
            {(() => { const tp = Math.max(1, Math.ceil((filteredUsers?.length || 0) / USERS_PER_PAGE)); return (<>
              <button disabled={userPage === 1} onClick={() => setUserPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              {Array.from({ length: Math.min(3, tp) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setUserPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${userPage === p ? 'bg-primary text-on-primary' : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
              ))}
              {tp > 3 && <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant font-bold">...</span>}
              {tp > 3 && <button onClick={() => setUserPage(tp)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${userPage === tp ? 'bg-primary text-on-primary' : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}`}>{tp}</button>}
              <button disabled={userPage === tp} onClick={() => setUserPage(p => Math.min(tp, p + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </>); })()}
          </div>
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Chart */}
        <div className="lg:col-span-2 bg-[#f0f3ec] p-8 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-[#fcfdfa]/40 blur-3xl rounded-full -mt-20 -mr-20"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold font-headline text-primary mb-2">User Acquisition by Source</h3>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Understanding where your community comes from helps in tailoring marketing campaigns and organic outreach efforts.
            </p>
          </div>

          <div className="relative z-10 flex items-end gap-6 mt-12 h-32 ml-4">
            <div className="flex flex-col items-center gap-2 h-full">
              <div className="w-10 bg-primary rounded-t-xl h-full shadow-inner"></div>
              <span className="text-xs font-bold text-on-surface">Organic</span>
            </div>
            <div className="flex flex-col items-center gap-2 h-[60%]">
              <div className="w-10 bg-[#7a9d70] rounded-t-xl h-full shadow-inner"></div>
              <span className="text-xs font-bold text-on-surface max-w-[50px] truncate text-center">Social</span>
            </div>
            <div className="flex flex-col items-center gap-2 h-[110%] -mt-3">
              <div className="w-10 bg-[#8cb382] rounded-t-xl h-full shadow-inner"></div>
              <span className="text-xs font-bold text-on-surface max-w-[50px] truncate text-center">Referral</span>
            </div>
            <div className="flex flex-col items-center gap-2 h-[40%]">
              <div className="w-10 bg-[#b6d0ad] rounded-t-xl h-full shadow-inner"></div>
              <span className="text-xs font-bold text-on-surface max-w-[50px] truncate text-center">Direct</span>
            </div>
          </div>
        </div>

        {/* Right Cards Stack */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] flex-grow shadow-sm border border-surface-container relative">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#8f4e00] text-xl">auto_awesome</span>
              <h3 className="font-bold font-headline text-lg">Admin Insights</h3>
            </div>
            
            <div className="flex flex-col gap-6 relative">
              <div className="absolute left-[2px] top-2 bottom-6 w-[2px] bg-outline-variant/30"></div>
              
              <div className="relative pl-4 border-l-2 border-primary">
                <p className="text-sm font-bold text-on-surface mb-1">Retention High</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  User retention is up by 4% compared to last week.
                </p>
              </div>
              
              <div className="relative pl-4 border-l-2 border-[#8f4e00]">
                <p className="text-sm font-bold text-on-surface mb-1">Unusual Activity</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  3 new accounts flagged for bulk ordering from same IP.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#2f7831] text-white p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[160px]">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-primary-fixed uppercase tracking-widest mb-1">Security Status</p>
              <p className="text-xl font-headline font-bold mb-4">All Systems Secure</p>
            </div>
            <button onClick={() => setIsLogModalOpen(true)} className="relative z-10 w-full bg-[#c4eed0] text-[#0f5223] py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#a3f69c] transition-colors cursor-pointer">
              View Log
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
