"use client";

import useSWR from "swr";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminMenuPage() {
  const { data: products, error, isLoading, mutate } = useSWR("/api/products?all=true", fetcher);
  
  const [activeCategory, setActiveCategory] = useState("All Blends");
  const [search, setSearch] = useState("");

  // Derive categories dynamically from actual products in DB
  const dbCategories = Array.from(new Set((products || []).map((p: any) => p.category))).sort() as string[];
  const categories = ["All Blends", ...dbCategories];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isShopOnline, setIsShopOnline] = useState(true);
  const [menuPage, setMenuPage] = useState(1);
  const MENU_PER_PAGE = 10;

  // Filter state
  const [filterHiddenOnly, setFilterHiddenOnly] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);

  // Category management state
  const [newCategoryName, setNewCategoryName] = useState("");

  // Add Product form state
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addCategory, setAddCategory] = useState("Fresh Juices");
  const [addDescription, setAddDescription] = useState("");
  const [addImageUrl, setAddImageUrl] = useState("");

  // Edit Product form state
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, setUrl: (url: string) => void) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large. Max 5MB.");
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) return toast.error("Use JPEG, PNG, WebP, or GIF.");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setUrl(data.url);
        toast.success('Image uploaded!');
      } else {
        toast.error(data.error || 'Upload failed.');
      }
    } catch { toast.error('Upload failed.'); }
    finally { setUploading(false); }
  };

  const openEditModal = (product: any) => {
    setEditId(product._id);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditCategory(product.category);
    setEditDescription(product.description || "");
    setEditImageUrl(product.imageUrl || "");
    setIsEditModalOpen(true);
  };

  const handleAddProduct = async () => {
    if (!addName.trim() || !addPrice) return toast.error("Name and price are required.");
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          price: Number(addPrice),
          category: addCategory,
          description: addDescription.trim(),
          imageUrl: addImageUrl.trim() || 'https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          isVisible: true
        })
      });
      if (res.ok) {
        toast.success("Product added!");
        setAddName(""); setAddPrice(""); setAddDescription(""); setAddImageUrl(""); setAddCategory("Fresh Juices");
        setIsAddModalOpen(false);
        mutate();
      } else {
        toast.error("Failed to add product.");
      }
    } catch { toast.error("An error occurred."); }
  };

  const handleEditProduct = async () => {
    if (!editName.trim() || !editPrice) return toast.error("Name and price are required.");
    try {
      const res = await fetch(`/api/products/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          price: Number(editPrice),
          category: editCategory,
          description: editDescription.trim(),
          imageUrl: editImageUrl.trim()
        })
      });
      if (res.ok) {
        toast.success("Product updated!");
        setIsEditModalOpen(false);
        mutate();
      } else {
        toast.error("Failed to update product.");
      }
    } catch { toast.error("An error occurred."); }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`"${name}" deleted.`);
        mutate();
      } else {
        toast.error("Failed to delete product.");
      }
    } catch { toast.error("An error occurred."); }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const productsInCat = (products || []).filter((p: any) => p.category === categoryName);
    if (productsInCat.length > 0) {
      if (!confirm(`"${categoryName}" has ${productsInCat.length} product(s). They will be moved to "Uncategorized". Continue?`)) return;
      for (const p of productsInCat) {
        await fetch(`/api/products/${p._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'Uncategorized' })
        });
      }
    }
    toast.success(`Category "${categoryName}" removed.`);
    mutate();
    if (activeCategory === categoryName) setActiveCategory('All Blends');
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return toast.error("Enter a category name.");
    if (dbCategories.includes(name)) return toast.error("Category already exists.");
    // Create a placeholder product to establish the category
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `New ${name} Product`,
        price: 100,
        category: name,
        description: `A new ${name.toLowerCase()} product.`,
        imageUrl: 'https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        isVisible: false
      })
    });
    if (res.ok) {
      toast.success(`Category "${name}" created with a draft product.`);
      setNewCategoryName('');
      mutate();
    } else {
      toast.error('Failed to create category.');
    }
  };

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentStatus }),
      });
      if (res.ok) {
        toast.success(currentStatus ? "Product hidden" : "Product visible");
        mutate();
      } else {
        toast.error("Failed to update product");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  if (isLoading) return <div className="p-8 font-bold text-xl">Loading menu...</div>;
  if (error) return <div className="p-8 text-error font-bold">Failed to load menu.</div>;

  const filteredProducts = products?.filter((p: any) => {
    const categoryMatch = activeCategory === "All Blends" || p.category === activeCategory;
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
    const hiddenMatch = filterApplied && filterHiddenOnly ? !p.isVisible : true;
    return categoryMatch && searchMatch && hiddenMatch;
  });

  const totalPages = Math.max(1, Math.ceil((filteredProducts?.length || 0) / MENU_PER_PAGE));
  const paginatedProducts = filteredProducts?.slice((menuPage - 1) * MENU_PER_PAGE, menuPage * MENU_PER_PAGE);

  const activeCount = products?.filter((p:any) => p.isVisible).length || 0;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-[2.75rem] font-extrabold font-headline text-on-surface tracking-tight leading-none mb-4">Menu Management</h1>
          <p className="text-on-surface-variant font-medium">Curate your seasonal offerings and wellness blends.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Product
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Product">
        <div className="space-y-4">
           <input type="text" placeholder="Product Name" value={addName} onChange={e => setAddName(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" />
           <textarea placeholder="Product description..." value={addDescription} onChange={e => setAddDescription(e.target.value)} rows={3} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
           <input type="number" placeholder="Price (₹)" value={addPrice} onChange={e => setAddPrice(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" />
           <select value={addCategory} onChange={e => setAddCategory(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20">
             {categories.slice(1).map(c => <option key={c}>{c}</option>)}
           </select>
           <div>
             <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Product Image</label>
             <div
               onClick={() => addFileRef.current?.click()}
               onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2','ring-primary'); }}
               onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('ring-2','ring-primary'); }}
               onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('ring-2','ring-primary'); const f = e.dataTransfer.files[0]; if(f) handleFileUpload(f, setAddImageUrl); }}
               className="w-full bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
             >
               {uploading ? (
                 <div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span><span className="text-sm font-bold">Uploading...</span></div>
               ) : addImageUrl ? (
                 <img src={addImageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
               ) : (
                 <>
                   <span className="material-symbols-outlined text-3xl text-outline-variant">cloud_upload</span>
                   <p className="text-sm font-bold text-on-surface-variant">Click or drag image here</p>
                   <p className="text-[10px] text-outline-variant">JPEG, PNG, WebP, GIF — Max 5MB</p>
                 </>
               )}
             </div>
             <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleFileUpload(f, setAddImageUrl); }} />
             <div className="flex items-center gap-3 mt-3">
               <div className="flex-1 h-px bg-outline-variant"></div>
               <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">or paste url</span>
               <div className="flex-1 h-px bg-outline-variant"></div>
             </div>
             <input type="url" placeholder="https://..." value={addImageUrl} onChange={e => setAddImageUrl(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 mt-2 text-sm" />
           </div>
           <button onClick={handleAddProduct} className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold mt-2">Save Product</button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Product">
        <div className="space-y-4">
           <input type="text" placeholder="Product Name" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" />
           <textarea placeholder="Product description..." value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
           <input type="number" placeholder="Price (₹)" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20" />
           <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20">
             {categories.slice(1).map(c => <option key={c}>{c}</option>)}
           </select>
           <div>
             <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Product Image</label>
             <div
               onClick={() => editFileRef.current?.click()}
               onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2','ring-primary'); }}
               onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('ring-2','ring-primary'); }}
               onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('ring-2','ring-primary'); const f = e.dataTransfer.files[0]; if(f) handleFileUpload(f, setEditImageUrl); }}
               className="w-full bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
             >
               {uploading ? (
                 <div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span><span className="text-sm font-bold">Uploading...</span></div>
               ) : editImageUrl ? (
                 <img src={editImageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
               ) : (
                 <>
                   <span className="material-symbols-outlined text-3xl text-outline-variant">cloud_upload</span>
                   <p className="text-sm font-bold text-on-surface-variant">Click or drag image here</p>
                   <p className="text-[10px] text-outline-variant">JPEG, PNG, WebP, GIF — Max 5MB</p>
                 </>
               )}
             </div>
             <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleFileUpload(f, setEditImageUrl); }} />
             <div className="flex items-center gap-3 mt-3">
               <div className="flex-1 h-px bg-outline-variant"></div>
               <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">or paste url</span>
               <div className="flex-1 h-px bg-outline-variant"></div>
             </div>
             <input type="url" placeholder="https://..." value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 mt-2 text-sm" />
           </div>
           <button onClick={handleEditProduct} className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold mt-2">Update Product</button>
        </div>
      </Modal>

      <Modal isOpen={isEditCatModalOpen} onClose={() => setIsEditCatModalOpen(false)} title="Manage Categories">
        <div className="space-y-2">
           {dbCategories.length === 0 ? (
             <p className="text-on-surface-variant text-sm py-4 text-center">No categories yet. Add one below.</p>
           ) : dbCategories.map(c => {
             const count = (products || []).filter((p: any) => p.category === c).length;
             return (
               <div key={c} className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl">
                 <div>
                   <span className="font-bold">{c}</span>
                   <span className="text-xs text-on-surface-variant ml-2">({count} product{count !== 1 ? 's' : ''})</span>
                 </div>
                 <button onClick={() => handleDeleteCategory(c)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 text-error transition-colors" title={`Delete ${c}`}>
                   <span className="material-symbols-outlined text-sm">delete</span>
                 </button>
               </div>
             );
           })}
           <div className="flex gap-2 mt-4">
             <input type="text" placeholder="New Category Name..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} className="flex-1 bg-surface-container-low p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
             <button onClick={handleAddCategory} className="bg-primary text-on-primary px-5 py-3 rounded-xl font-bold">Add</button>
           </div>
        </div>
      </Modal>

      <Modal isOpen={isBulkEditModalOpen} onClose={() => setIsBulkEditModalOpen(false)} title="Bulk Edit Data">
        <div className="space-y-4 text-sm text-on-surface-variant">
           <p>Select multiple products from the table to adjust pricing or change categories simultaneously.</p>
           <div className="bg-[#f2f0e6] p-4 border border-[#e6e3d5] text-[#8f4e00] rounded-xl font-bold">
              Functionality locked in preview environment.
           </div>
           <button onClick={() => setIsBulkEditModalOpen(false)} className="w-full bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold">Close Editor</button>
        </div>
      </Modal>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Advanced Filters">
        <div className="space-y-4">
           <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-primary" checked={filterHiddenOnly} onChange={e => setFilterHiddenOnly(e.target.checked)} /> Hidden Products Only</label>
           <div className="flex gap-3 mt-4">
             <button onClick={() => { setFilterApplied(true); setMenuPage(1); toast.success("Filters applied"); setIsFilterModalOpen(false); }} className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold">Apply Filters</button>
             <button onClick={() => { setFilterHiddenOnly(false); setFilterApplied(false); setMenuPage(1); toast.success("Filters cleared"); setIsFilterModalOpen(false); }} className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold">Clear All</button>
           </div>
        </div>
      </Modal>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-center">
          <p className="text-[10px] font-bold text-[#b05f00] uppercase tracking-widest mb-1">Total Products</p>
          <p className="text-[2.5rem] leading-none font-black text-primary font-headline">{products?.length || 0}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-center">
          <p className="text-[10px] font-bold text-[#8f4e00] uppercase tracking-widest mb-1">Active Blends</p>
          <p className="text-[2.5rem] leading-none font-black text-primary font-headline">{activeCount}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col justify-center">
          <p className="text-[10px] font-bold text-[#8f4e00] uppercase tracking-widest mb-1">Coming Soon</p>
          <p className="text-[2.5rem] leading-none font-black text-primary font-headline">{(products?.length || 0) - activeCount}</p>
        </div>
        <div className="bg-[#fcfff9] border-2 border-primary-fixed p-6 rounded-3xl shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Low Stock Alerts</p>
          <p className="text-[2.5rem] leading-none font-black text-error font-headline">02</p>
        </div>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl">Categories</h3>
              <span onClick={() => setIsEditCatModalOpen(true)} className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer hover:text-primary transition-colors">edit</span>
            </div>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-5 py-3 rounded-2xl font-medium transition-colors ${
                    activeCategory === cat 
                    ? "bg-primary-fixed text-[#002204] font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button onClick={() => setIsEditCatModalOpen(true)} className="text-left px-5 py-3 mt-4 rounded-2xl font-bold text-on-surface-variant border-2 border-dashed border-outline-variant hover:bg-surface-container transition-colors">
                + Create New Category
              </button>
            </div>
          </div>

          <div className="bg-primary text-on-primary p-6 rounded-3xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-xl mb-2">Global Visibility</h3>
              <p className="text-primary-fixed text-sm mb-6 leading-relaxed">
                One-tap control to set your entire shop to "Coming Soon" during production runs.
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold">Shop Online</span>
                <div onClick={() => {
                   setIsShopOnline(!isShopOnline);
                   toast.success(isShopOnline ? "Storefront marked Offline" : "Storefront Live");
                }} className={`w-12 h-6 rounded-full p-1 flex cursor-pointer shadow-inner transition-colors ${isShopOnline ? 'bg-primary-fixed justify-end' : 'bg-outline justify-start'}`}>
                  <div className={`w-4 h-4 rounded-full shadow-sm ${isShopOnline ? 'bg-[#0d631b]' : 'bg-surface-container-lowest'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-surface-container">
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Search menu items..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-low border-none outline-none focus:ring-2 focus:ring-primary/20 transition-shadow text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsBulkEditModalOpen(true)} className="bg-surface-container px-4 py-2.5 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span> Bulk Edit (12)
              </button>
              <button onClick={() => setIsFilterModalOpen(true)} className="bg-surface-container px-4 py-2.5 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Product</th>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Price</th>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {paginatedProducts?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-on-surface-variant">
                      No products found.{filterApplied && ' Try clearing filters.'}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts?.map((product: any) => (
                    <tr key={product._id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-6 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container shadow-sm flex-shrink-0">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-lg">{product.name}</p>
                          <p className="text-xs text-on-surface-variant mt-1 max-w-[200px] truncate leading-relaxed">{product.description}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-[#f2f5ee] text-[#40493d] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-primary text-lg">
                        ₹{product.price}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${product.isVisible ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                          <span className="font-bold text-sm text-on-surface">{product.isVisible ? "Visible" : "Hidden"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggleVisibility(product._id, product.isVisible)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors" title="Toggle Visibility">
                            <span className="material-symbols-outlined text-[18px]">{product.isVisible ? "visibility_off" : "visibility"}</span>
                          </button>
                          <button onClick={() => openEditModal(product)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-secondary transition-colors" title="Edit Product">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteProduct(product._id, product.name)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-error transition-colors" title="Delete Product">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 border-t border-surface-container flex justify-between items-center bg-[#fcfdfa]">
            <p className="text-sm text-on-surface-variant font-medium">Showing {Math.min(menuPage * MENU_PER_PAGE, filteredProducts?.length || 0)} of {filteredProducts?.length || 0} products{filterApplied ? ' (filtered)' : ''}</p>
            <div className="flex gap-2">
              <button disabled={menuPage === 1} onClick={() => setMenuPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setMenuPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${menuPage === p ? 'bg-primary text-on-primary' : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
              ))}
              <button disabled={menuPage === totalPages} onClick={() => setMenuPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
          </div>

        </div>
      </div>
    </div>
  );
}
