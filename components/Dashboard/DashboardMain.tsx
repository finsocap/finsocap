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
    <main className={`flex-1 overflow-y-auto relative ${isBlogStudio ? "p-0" : "p-8"}`}>
      {children}
    </main>
  );
}
