export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f7faf3] flex flex-col items-center justify-center px-4">
      {/* Pulsing juice glass loader */}
      <div className="relative mb-8">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#e4ebdd] animate-pulse flex items-center justify-center">
          <span className="material-symbols-outlined text-[#1b4321] text-3xl md:text-4xl animate-bounce">
            local_bar
          </span>
        </div>
        {/* Ripple rings */}
        <div className="absolute inset-0 rounded-full border-2 border-[#d1ecb4] animate-ping opacity-30"></div>
      </div>
      
      <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest animate-pulse">
        Pressing fresh...
      </p>
    </div>
  );
}
