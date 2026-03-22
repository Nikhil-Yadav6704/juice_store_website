import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7faf3] flex flex-col items-center justify-center px-4 py-20 text-center">
      {/* Decorative number */}
      <div className="relative mb-6 md:mb-8">
        <span className="text-[120px] sm:text-[160px] md:text-[200px] font-black font-headline text-[#e4ebdd] leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#1b4321] rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl md:text-4xl">search_off</span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-3 md:mb-4">
        Page Not Found
      </h1>
      <p className="text-on-surface-variant text-base md:text-lg font-medium max-w-md mb-8 md:mb-10 leading-relaxed">
        Looks like this juice blend doesn&apos;t exist yet. Let&apos;s get you back to something fresh.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <Link
          href="/"
          className="bg-[#1b4321] text-white px-7 py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Back to Home
        </Link>
        <Link
          href="/menu"
          className="bg-[#e4ebdd] text-[#1b4321] px-7 py-3.5 rounded-full text-sm font-bold hover:bg-[#d1ecb4] transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">local_bar</span>
          Browse Juices
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-on-surface-variant font-medium">
        <Link href="/about" className="hover:text-[#1b4321] transition-colors">Our Story</Link>
        <Link href="/contact" className="hover:text-[#1b4321] transition-colors">Contact Us</Link>
        <Link href="/orders" className="hover:text-[#1b4321] transition-colors">My Orders</Link>
      </div>
    </div>
  );
}
