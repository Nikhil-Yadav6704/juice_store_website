"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MenuPage() {
  const { data: session } = useSession();
  const { data: products, error, isLoading } = useSWR("/api/products", fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
  });
  const { data: cartData, mutate: mutateCart } = useSWR(
    session?.user ? ["/api/cart", session.user.id] : null,
    fetcher,
    { 
      dedupingInterval: 10000,
      revalidateOnFocus: false 
    }
  );
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Please log in to place an order</p>
                <div className="mt-4 flex space-x-4">
                   <Link href="/auth/login" className="text-sm font-bold text-primary" onClick={() => toast.dismiss(t.id)}>Login</Link>
                   <Link href="/auth/signup" className="text-sm font-bold text-secondary" onClick={() => toast.dismiss(t.id)}>Sign up</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ));
      return;
    }

    try {
      // Optimistic Update
      const product = products.find((p: any) => p._id === productId);
      const currentItems = cartData?.items || [];
      const itemIndex = currentItems.findIndex((i: any) => (i.productId._id || i.productId) === productId);
      
      let newItems;
      if (itemIndex > -1) {
        newItems = [...currentItems];
        newItems[itemIndex] = { ...newItems[itemIndex], quantity: newItems[itemIndex].quantity + 1 };
      } else {
        newItems = [...currentItems, { productId: product, quantity: 1 }];
      }
      
      mutateCart({ ...cartData, items: newItems }, false);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action: "add" }),
      });
      if (res.ok) {
        toast.success("Added to cart!");
        mutateCart();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to add to cart");
      mutateCart(); // Revert on failure
    }
  };

  const updateCartQuantity = async (productId: string, action: "add" | "decrement") => {
    try {
      // Optimistic Update
      const currentItems = cartData?.items || [];
      const itemIndex = currentItems.findIndex((i: any) => (i.productId._id || i.productId) === productId);
      
      if (itemIndex > -1) {
        const newItems = [...currentItems];
        const newQty = action === "add" ? newItems[itemIndex].quantity + 1 : newItems[itemIndex].quantity - 1;
        
        if (newQty <= 0) {
          newItems.splice(itemIndex, 1);
        } else {
          newItems[itemIndex] = { ...newItems[itemIndex], quantity: newQty };
        }
        
        mutateCart({ ...cartData, items: newItems }, false);
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });
      if (!res.ok) throw new Error();
      mutateCart();
    } catch {
      toast.error("Failed to update cart");
      mutateCart(); // Revert
    }
  };

  const getCartQuantity = (productId: string) => {
    if (!cartData || !cartData.items) return 0;
    const item = cartData.items.find((i: any) => i.productId._id === productId || i.productId === productId);
    return item ? item.quantity : 0;
  };

  if (isLoading) return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant font-bold">Loading harvest...</div>;
  if (error) return <div className="min-h-screen bg-surface flex items-center justify-center text-error font-bold">Failed to load menu.</div>;

  // Derive categories dynamically from the actual products in the database
  const allProducts: any[] = products || [];
  const uniqueCategories = Array.from(new Set(allProducts.map((p: any) => p.category))).sort();
  const categoryTabs = ["All", ...uniqueCategories];

  // Filter products based on selected category
  const displayProducts = selectedCategory === "All"
    ? allProducts
    : allProducts.filter((p: any) => p.category === selectedCategory);

  // Group products by category for the "All" view
  const groupedByCategory: Record<string, any[]> = {};
  for (const p of displayProducts) {
    if (!groupedByCategory[p.category]) groupedByCategory[p.category] = [];
    groupedByCategory[p.category].push(p);
  }

  // Category theme colors for visual variety
  const categoryThemes: Record<string, { accent: string; accentBg: string; accentText: string; icon: string }> = {
    "Fresh Juices": { accent: "#ff8f00", accentBg: "#fff3e0", accentText: "#e65100", icon: "local_bar" },
    "Smoothies": { accent: "#8f4e00", accentBg: "#fbdfc6", accentText: "#623400", icon: "blender" },
    "Detox": { accent: "#2e7d32", accentBg: "#e8f5e9", accentText: "#1b5e20", icon: "spa" },
    "Immunity": { accent: "#ef6c00", accentBg: "#fff8e1", accentText: "#e65100", icon: "shield" },
    "Energy": { accent: "#c62828", accentBg: "#ffebee", accentText: "#b71c1c", icon: "bolt" },
  };
  const defaultTheme = { accent: "#0d631b", accentBg: "#e8f5e9", accentText: "#1b5e20", icon: "eco" };

  return (
    <div className="min-h-screen bg-surface">
      
      {/* Hero Header */}
      <section className="px-4 sm:px-6 md:px-8 pt-20 md:pt-24 pb-10 md:pb-16 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <span className="text-[10px] font-bold text-[#b05f00] uppercase tracking-widest mb-3 md:mb-4 inline-block">Seasonal Collection</span>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold text-on-surface font-headline leading-[1] tracking-tight mb-4 md:mb-6">
            Freshly Squeezed <br/>
            <span className="text-primary italic" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>Nature.</span>
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg font-medium leading-relaxed max-w-sm">
            Explore our curated selection of cold-pressed botanicals, designed to nourish and revitalize. From orchard to glass, no shortcuts.
          </p>
        </div>
        <div 
          className="hidden lg:flex w-64 h-64 rounded-full border border-surface-container-high bg-surface-container-lowest items-center justify-center relative shadow-sm overflow-hidden"
          style={{ 
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQpPQPufZrSwnOr556tseR0bhHXW2Z1Izvz7qALlZNuNhncVPvTXqoWRfbqQsY4rSvi0YORLmJgwcj2yY96FoiTWXwqzizBjWm_Xyqd8-hWX9lwcY1UanOh3kxaCqy4sAcnlnhildquaH29Rq05-CM85ETkn92xRHIBFRdtJt_KtYqVW0YCy_ECWIYqI7Ex4lT2gQjRmtuKOtuBK3ellhHdR4IJ5tOrugUcqs87ZIkja7jAY4T09nujfV0-VgqrlPFpcufQuf2NuE')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
             <span className="text-[9px] font-black text-[#1b4321] uppercase tracking-widest text-center max-w-[100px] leading-relaxed drop-shadow-sm">
               Pure Organic <br/>Cold Pressed
             </span>
          </div>
        </div>
      </section>

      {/* Category Pills — horizontally scrollable on mobile */}
      <div className="px-0 sm:px-6 md:px-8 max-w-6xl mx-auto mb-8 md:mb-16 relative">
        <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-4 scrollbar-hide px-4 sm:px-0 mask-fade-right">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 md:px-6 py-2.5 rounded-full text-[12px] md:text-[13px] font-bold transition-all shadow-sm border whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-surface-container-lowest text-on-surface-variant border-surface-container hover:border-primary/30 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Mobile Scroll Indicator Fade */}
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none md:hidden" />
      </div>

      {/* Products */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto pb-24 md:pb-32 space-y-16 md:space-y-24">
        
        {Object.entries(groupedByCategory).map(([category, items]) => {
          const theme = categoryThemes[category] || defaultTheme;

          return (
            <section key={category}>
              {/* Section Header */}
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.accentBg }}>
                  <span className="material-symbols-outlined text-lg md:text-xl" style={{ color: theme.accentText }}>{theme.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold font-headline text-on-surface">{category}</h2>
                  <p className="text-[12px] md:text-[13px] text-on-surface-variant font-medium">{items.length} blend{items.length !== 1 ? 's' : ''} available</p>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {items.map((product: any) => {
                  const qty = getCartQuantity(product._id);
                  return (
                    <div key={product._id} className="bg-surface-container-lowest rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-surface-container flex flex-col group h-full transition-transform hover:-translate-y-1">
                      <div className="relative h-[180px] sm:h-[200px] md:h-[220px] w-full overflow-hidden">
                        {!product.isVisible && (
                          <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm z-10">Hidden</div>
                        )}
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1622597467836-f38240662c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
                        }} />
                      </div>
                      <div className="p-5 sm:p-6 md:p-7 flex flex-col flex-grow bg-white">
                        <h3 className="text-[15px] md:text-[17px] font-bold font-headline text-on-surface mb-1.5 md:mb-2">{product.name}</h3>
                        <p className="text-[12px] md:text-[13px] text-on-surface-variant leading-relaxed mb-4 md:mb-5 font-medium flex-grow line-clamp-3">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[16px] md:text-[17px] text-on-surface font-bold">₹{Number(product.price).toFixed(0)}</span>
                          
                          {qty > 0 ? (
                             <div className="flex items-center gap-2 md:gap-3 bg-surface-container rounded-full p-1 shadow-inner">
                              <button onClick={() => updateCartQuantity(product._id, "decrement")} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-on-surface shadow-sm hover:bg-surface-container-lowest transition-colors"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                              <span className="font-bold text-sm w-4 text-center">{qty}</span>
                              <button onClick={() => updateCartQuantity(product._id, "add")} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm hover:bg-[#0a4d15] transition-colors"><span className="material-symbols-outlined text-[16px]">add</span></button>
                            </div>
                          ) : (
                            <button onClick={() => handleAddToCart(product._id)} className="w-10 h-10 rounded-full bg-[#1b4321] text-white flex items-center justify-center shadow-md hover:bg-primary transition-colors">
                              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {displayProducts.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
            <p className="text-xl font-bold text-on-surface-variant">No products in this category yet.</p>
            <p className="text-on-surface-variant mt-2">Check back soon or browse all categories.</p>
          </div>
        )}

      </div>
    </div>
  );
}
