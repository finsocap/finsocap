"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Home, 
  Boxes,
  ClipboardList,
  Users, 
  BarChart3, 
  UserCheck, 
  Award, 
  KeyRound, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Plus,
  Headphones,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import DeveloperProfileModal from "../Global/DeveloperProfileModal";
import { useTheme } from "@/components/Providers/ThemeProvider";

import { useCrmStore } from "@/lib/crmStore";

export default function Sidebar({ userRole = "ADMIN" }: { userRole?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null);
  const { config } = useTheme();
  const { tasks, services } = useCrmStore();

  const openTasksCount = tasks.filter(t => !["Completed", "Cancelled"].includes(t.status)).length;
  const unassignedTasksCount = tasks.filter(t => !t.assignee && t.status !== "Completed").length;
  const currentTab = searchParams.get("tab");

  useEffect(() => {
    setOptimisticHref(null);
  }, [pathname, currentTab]);

  const isItemActive = (href: string) => {
    if (optimisticHref) return optimisticHref === href;
    if (href === "/dashboard") return pathname === "/dashboard";
    
    // Explicit report tabs matching - only one active at a time
    if (href === "/dashboard/reports?tab=service") {
      return pathname === "/dashboard/reports" && (!currentTab || currentTab === "service");
    }
    if (href === "/dashboard/reports?tab=sales") {
      return pathname === "/dashboard/reports" && currentTab === "sales";
    }
    if (href === "/dashboard/reports?tab=licence") {
      return pathname === "/dashboard/reports" && currentTab === "licence";
    }
    
    return pathname.startsWith(href);
  };

  const coreNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Products / Services", href: "/dashboard/services", icon: Boxes, badge: services.length ? `${services.length}` : undefined },
    { label: "Tasks", href: "/dashboard/tasks", icon: ClipboardList, badge: openTasksCount > 0 ? `${openTasksCount}` : undefined },
    { label: "Task Allocation", href: "/dashboard/allocation", icon: UserCheck, badge: unassignedTasksCount > 0 ? `${unassignedTasksCount}` : undefined },
    { label: "Clients", href: "/dashboard/clients", icon: Users },
    { label: "Team", href: "/dashboard/team", icon: ShieldCheck },
  ];

  const reportNavItems = [
    { label: "Service Team Report", href: "/dashboard/reports?tab=service", icon: Award },
    { label: "Sales Team Report", href: "/dashboard/reports?tab=sales", icon: TrendingUp },
    { label: "Licence Report", href: "/dashboard/reports?tab=licence", icon: KeyRound },
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white dark:bg-[#0c1222] border-r border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-300 flex flex-col h-screen sticky top-0 transition-all duration-300 relative z-40 shadow-xs`}
    >
      {/* Collapse Toggle Button - Stacked above Topbar with z-50 */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label="Toggle Sidebar"
        className="absolute -right-3 top-[25px] w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full flex items-center justify-center transition-all z-50 cursor-pointer hover:scale-110 active:scale-95"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> : <ChevronLeft className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />}
      </button>

      {/* Brand Header with Finsocap Favicon */}
      <div className={`flex items-center h-[74px] border-b border-slate-100 dark:border-slate-800/80 ${isCollapsed ? "justify-center px-2" : "px-5"}`}>
        {isCollapsed ? (
          <Link href="/dashboard" className="flex items-center justify-center group" title="Finsocap Financial Services">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <Image 
                src="/apple-touch-icon.png" 
                alt="Finsocap Favicon" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            {/* Official Finsocap Favicon Logo */}
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
              <Image 
                src="/apple-touch-icon.png" 
                alt="Finsocap Favicon" 
                width={32} 
                height={32} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-tight">
                Finsocap
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight leading-none mt-0.5">
                Financial Services
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-3 space-y-1 mt-3 overflow-y-auto no-scrollbar ${isCollapsed ? "px-2" : ""}`}>
        {/* Core Operations Section */}
        {!isCollapsed && (
          <div className="pt-1 pb-1.5 px-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Core Operations
            </span>
          </div>
        )}

        {coreNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOptimisticHref(item.href)}
              title={isCollapsed ? item.label : ""}
              className={`flex items-center justify-between py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isCollapsed ? "justify-center px-0" : "px-3.5"
              } ${
                active
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 border border-blue-400/20 scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                {!isCollapsed && <span className="text-xs">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Reports Header */}
        {!isCollapsed ? (
          <div className="pt-4 pb-1.5 px-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Analytics & Reports
            </span>
          </div>
        ) : (
          <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
        )}

        {reportNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                setOptimisticHref(item.href);
                if (item.href.includes("tab=service")) {
                  window.dispatchEvent(new CustomEvent("finsocap-switch-report-tab", { detail: "service" }));
                } else if (item.href.includes("tab=sales")) {
                  window.dispatchEvent(new CustomEvent("finsocap-switch-report-tab", { detail: "sales" }));
                } else if (item.href.includes("tab=licence")) {
                  window.dispatchEvent(new CustomEvent("finsocap-switch-report-tab", { detail: "licence" }));
                } else if (item.href === "/dashboard/reports") {
                  window.dispatchEvent(new CustomEvent("finsocap-switch-report-tab", { detail: "service" }));
                }
                if (pathname === "/dashboard/reports") {
                  e.preventDefault();
                  router.push(item.href);
                }
              }}
              title={isCollapsed ? item.label : ""}
              className={`flex items-center justify-between py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isCollapsed ? "justify-center px-0" : "px-3.5"
              } ${
                active
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 border border-blue-400/20 scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                {!isCollapsed && <span className="text-xs">{item.label}</span>}
              </div>
            </Link>
          );
        })}

        {/* Operational SLA & Progress Widget (Fills empty space with valuable live data) */}
        {!isCollapsed && (
          <div className="pt-5 pb-2">
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-slate-900/60 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Progress
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                  87.2%
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <span>₹8.72L</span>
                  <span className="text-slate-400 font-medium">₹10.0L Goal</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: "87.2%" }}
                  />
                </div>
              </div>

              {/* Live CA & SLA Counters */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>12/14 CAs Online</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-sky-400">
                  99.2% SLA
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom: "Need Help? Contact Support" matching reference screenshot */}
      <div className={`p-3 border-t border-slate-200/90 dark:border-slate-800/90 ${isCollapsed ? "px-2" : ""}`}>
        {!isCollapsed ? (
          <Link
            href="/dashboard/chat"
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-800 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Need Help?
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  24/7 Priority Support
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ) : (
          <Link
            href="/dashboard/chat"
            title="Need Help? Contact Support"
            className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          >
            <Headphones className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
}
