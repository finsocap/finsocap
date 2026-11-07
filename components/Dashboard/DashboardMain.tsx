"use client";

import { usePathname } from "next/navigation";

export default function DashboardMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Blog editor studio (creating /dashboard/blogs/new or editing /dashboard/blogs/[id]) 
  // requires full-bleed p-0 so the action header is 100% flush at the top with zero gaps.
  const isBlogStudio = 
    pathname?.includes("/dashboard/blogs/new") || 
    (pathname?.startsWith("/dashboard/blogs/") && pathname !== "/dashboard/blogs");

  return (
    <main className={`flex-1 overflow-y-auto relative ${isBlogStudio ? "p-0" : "p-3.5 sm:p-5 lg:p-6 lg:pb-6"}`}>
      {/* Ambient Gradient Mesh Background (Matches Reference UI in Finsocap Brand Palette) */}
      {!isBlogStudio && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          {/* Top-left soft warm sunshine/gold glow */}
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-amber-200/35 via-yellow-100/25 to-transparent blur-[110px]" />
          
          {/* Top-center / middle electric brand sky-blue & indigo aura */}
          <div className="absolute top-1/4 left-1/3 w-[640px] h-[500px] rounded-full bg-gradient-to-br from-blue-400/15 via-indigo-300/15 to-transparent blur-[130px]" />
          
          {/* Right / bottom soft rose & violet pastel diffusion */}
          <div className="absolute top-1/3 -right-24 w-[560px] h-[560px] rounded-full bg-gradient-to-bl from-rose-200/25 via-purple-200/20 to-transparent blur-[120px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[450px] rounded-full bg-gradient-to-t from-sky-200/20 via-blue-100/15 to-transparent blur-[120px]" />
        </div>
      )}

      {/* Main Page Content Layer */}
      <div className="relative">
        {children}
      </div>
    </main>
  );
}
