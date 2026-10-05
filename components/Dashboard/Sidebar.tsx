"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAssetUrl } from "@/lib/brandConfig";
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
  TrendingUp,
  Handshake,
  X
} from "lucide-react";
import DeveloperProfileModal from "../Global/DeveloperProfileModal";
import { useTheme } from "@/components/Providers/ThemeProvider";

import { useCrmStore } from "@/lib/crmStore";

function normalizePath(rawPath?: string | null): string {
  if (!rawPath) return "";
  const noQuery = rawPath.split("?")[0];
  const trimmed = noQuery.replace(/\/+$/, "");
  return trimmed || "/";
}

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
  
  // Track active report tab with fallback to URL query param
  const [activeReportTab, setActiveReportTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlTab = new URLSearchParams(window.location.search).get("tab");
      if (urlTab && ["service", "sales", "licence"].includes(urlTab)) return urlTab;
      if (window.location.pathname.includes("/licence")) return "licence";
      if (window.location.pathname.includes("/sales")) return "sales";
    }
    const param = searchParams.get("tab");
    if (param && ["service", "sales", "licence"].includes(param)) return param;
    return "service";
  });

  // Mobile drawer state (<lg screens)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, searchParams]);

  // Listen to mobile toggle event from Topbar hamburger button
  useEffect(() => {
    const handleToggleMobile = () => {
      setIsMobileOpen(prev => !prev);
    };
    window.addEventListener("finsocap-toggle-mobile-sidebar", handleToggleMobile);
    return () => window.removeEventListener("finsocap-toggle-mobile-sidebar", handleToggleMobile);
  }, []);

  // Sync activeReportTab whenever pathname or searchParams change
  useEffect(() => {
    setOptimisticHref(null);
    const paramTab = searchParams.get("tab");
    if (paramTab && ["service", "sales", "licence"].includes(paramTab)) {
      setActiveReportTab(paramTab);
      return;
    }
    if (typeof window !== "undefined") {
      const urlTab = new URLSearchParams(window.location.search).get("tab");
      if (urlTab && ["service", "sales", "licence"].includes(urlTab)) {
        setActiveReportTab(urlTab);
        return;
      }
    }
    const norm = normalizePath(pathname);
    if (norm === "/dashboard/licence") {
      setActiveReportTab("licence");
      return;
    }
    if (norm === "/dashboard/reports") {
      setActiveReportTab("service");
    }
  }, [pathname, searchParams]);

  // Real-time synchronization when report tabs change (from page banner or sidebar)
  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && ["service", "sales", "licence"].includes(customEvent.detail)) {
        setActiveReportTab(customEvent.detail);
        setOptimisticHref(null);
      }
    };
    window.addEventListener("finsocap-switch-report-tab", handleSwitch);
    return () => window.removeEventListener("finsocap-switch-report-tab", handleSwitch);
  }, []);

  const isItemActive = (href: string) => {
    const normalizedCurrent = normalizePath(pathname);
    const [rawItemBase, itemQuery] = href.split("?");
    const normalizedItemBase = normalizePath(rawItemBase);

    // Optimistic fast UI feedback
    if (optimisticHref) {
      if (optimisticHref === href) return true;
      const [optBase] = optimisticHref.split("?");
      if (normalizePath(optBase) === normalizedCurrent && optimisticHref !== href) {
        return false;
      }
    }

    // 1. Dashboard root item: must match ONLY /dashboard exactly
    if (normalizedItemBase === "/dashboard") {
      return normalizedCurrent === "/dashboard";
    }

    // 2. Report tabs (/dashboard/reports?tab=... or /dashboard/licence)
    if (normalizedItemBase === "/dashboard/reports" || normalizedItemBase === "/dashboard/licence") {
      let itemTab = "service";
      if (itemQuery && itemQuery.includes("tab=sales")) itemTab = "sales";
      else if (itemQuery && itemQuery.includes("tab=licence")) itemTab = "licence";
      else if (normalizedItemBase === "/dashboard/licence") itemTab = "licence";

      // If user is currently on the reports page
      if (normalizedCurrent === "/dashboard/reports") {
        return activeReportTab === itemTab;
      }
      // If user visited /dashboard/licence directly
      if (normalizedCurrent === "/dashboard/licence") {
        return itemTab === "licence";
      }
      // Also match standalone report routes if visited directly
      if (itemTab === "service" && normalizedCurrent === "/dashboard/service-report") return true;
      if (itemTab === "sales" && normalizedCurrent === "/dashboard/sales") return true;

      return false;
    }

    // 3. Other core items: exact match OR nested route (e.g. /dashboard/tasks/T-1001)
    return (
      normalizedCurrent === normalizedItemBase ||
      normalizedCurrent.startsWith(normalizedItemBase + "/")
    );
  };

  const coreNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Products / Services", href: "/dashboard/services", icon: Boxes, badge: services.length ? `${services.length}` : undefined },
    { label: "Tasks", href: "/dashboard/tasks", icon: ClipboardList, badge: openTasksCount > 0 ? `${openTasksCount}` : undefined },
    { label: "Task Allocation", href: "/dashboard/allocation", icon: UserCheck, badge: unassignedTasksCount > 0 ? `${unassignedTasksCount}` : undefined },
    { label: "Partners", href: "/dashboard/partners", icon: Handshake },
    { label: "Clients", href: "/dashboard/clients", icon: Users },
    { label: "Team", href: "/dashboard/team", icon: ShieldCheck },
  ];

  const reportNavItems = [
    { label: "Service Team Report", href: "/dashboard/reports?tab=service", icon: Award },
    { label: "Franchise Partner Report", href: "/dashboard/reports?tab=sales", icon: TrendingUp },
    { label: "Licence Report", href: "/dashboard/reports?tab=licence", icon: KeyRound },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay (<lg screens) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col bg-white dark:bg-[#0c1222] border-r border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-300 shadow-xl lg:shadow-xs transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } w-72 max-w-[85vw] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Collapse Toggle Button - Visible only on Desktop (lg:) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle Sidebar"
          className="hidden lg:flex absolute -right-3 top-[25px] w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full items-center justify-center transition-all z-[60] cursor-pointer hover:scale-110 active:scale-95"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> : <ChevronLeft className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />}
        </button>

        {/* Brand Header with Finsocap Favicon & Mobile Close Button */}
        <div className={`flex items-center justify-between h-[74px] border-b border-slate-100 dark:border-slate-800/80 ${isCollapsed ? "lg:justify-center px-4 lg:px-2" : "px-5"}`}>
          {/* Mobile Close Button (<lg screens) */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 order-last cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        {isCollapsed ? (
          <Link href="/dashboard" className="flex items-center justify-center group" title="Finsocap Financial Services">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <img 
                src={getAssetUrl("/apple-touch-icon.png")} 
                alt="Finsocap Favicon" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl("/Finsocap_logo.png");
                }}
              />
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            {/* Official Finsocap Favicon Logo */}
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
              <img 
                src={getAssetUrl("/apple-touch-icon.png")} 
                alt="Finsocap Favicon" 
                width={44} 
                height={44} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl("/Finsocap_logo.png");
                }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl lg:text-[26px] tracking-tight leading-none">
                Finsocap
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-3 flex flex-col justify-between overflow-y-auto no-scrollbar py-2 ${isCollapsed ? "px-2" : ""}`}>
        {/* Top Section: Nav Items */}
        <div className="space-y-1.5 2xl:space-y-2">
          {/* Core Operations Section */}
          {!isCollapsed && (
            <div className="pt-1.5 pb-1 px-3.5">
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
                className={`flex items-center justify-between py-3 2xl:py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
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
            <div className="pt-5 2xl:pt-6 pb-1 px-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Analytics & Reports
              </span>
            </div>
          ) : (
            <div className="my-2.5 border-t border-slate-200 dark:border-slate-800" />
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
                  const tab = item.href.includes("tab=sales") 
                    ? "sales" 
                    : item.href.includes("tab=licence") 
                    ? "licence" 
                    : "service";
                  setActiveReportTab(tab);
                  window.dispatchEvent(new CustomEvent("finsocap-switch-report-tab", { detail: tab }));
                  if (normalizePath(pathname) === "/dashboard/reports") {
                    e.preventDefault();
                    router.push(item.href);
                  }
                }}
                title={isCollapsed ? item.label : ""}
                className={`flex items-center justify-between py-3 2xl:py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
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
        </div>

        {/* Bottom Section: Operational SLA & Progress Widget - Anchored right above footer */}
        {!isCollapsed && (
          <div className="mt-auto pt-4 pb-1">
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
            onClick={() => setOptimisticHref("/dashboard/chat")}
            className={`relative overflow-hidden flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 group cursor-pointer ${
              normalizePath(pathname) === "/dashboard/chat"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 border-transparent shadow-lg shadow-blue-500/30 scale-[1.02]"
                : "bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 dark:from-[#0b1226] dark:via-[#0e1c44]/60 dark:to-[#080d1a] border-blue-200/80 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/15"
            }`}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full blur-xl" />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                normalizePath(pathname) === "/dashboard/chat"
                  ? "bg-white/25 text-white ring-2 ring-white/30"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30 ring-2 ring-blue-500/10"
              }`}>
                <Headphones className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-wider leading-tight ${
                  normalizePath(pathname) === "/dashboard/chat" ? "text-white" : "text-slate-900 dark:text-white"
                }`}>
                  Need Help?
                </span>
                <span className={`text-[10px] font-bold mt-0.5 ${
                  normalizePath(pathname) === "/dashboard/chat" ? "text-blue-100" : "text-blue-600 dark:text-sky-400"
                }`}>
                  24/7 Priority Support
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 relative z-10 ${
              normalizePath(pathname) === "/dashboard/chat"
                ? "text-white"
                : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400"
            }`} />
          </Link>
        ) : (
          <Link
            href="/dashboard/chat"
            onClick={() => setOptimisticHref("/dashboard/chat")}
            title="Need Help? Contact Support"
            className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center cursor-pointer transition-all ${
              normalizePath(pathname) === "/dashboard/chat"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <Headphones className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
    </>
  );
}
