"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, Search, User, Check, CheckCheck, X, 
  ChevronRight, ShieldCheck, Settings, LogOut, 
  Receipt, AlertCircle, Building, CreditCard, 
  Clock, Calendar, Users, IndianRupee, Sparkles,
  MessageSquare, Radio, CheckSquare, Command, Menu,
  Sun, Moon, Calculator as CalcIcon
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";
import { useTheme } from "@/components/Providers/ThemeProvider";
import { useCrmStore } from "@/lib/crmStore";
import BusinessCalculatorModal from "@/components/Dashboard/BusinessCalculatorModal";
import PartnerProfileModal from "@/components/Dashboard/PartnerProfileModal";
import { partnerPortalService, PartnerProfileData } from "@/lib/api/partnerPortalService";

type NotificationItem = {
  id: string;
  type: "chat" | "support" | "blog" | "task" | "social" | "payment" | "invoice" | "service" | "compliance";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionUrl: string;
  assignedToName?: string;
  assignedToId?: number | null;
  partnerName?: string;
  clientName?: string;
};

export default function Topbar({ user }: { user?: any }) {
  const router = useRouter();
  const { resolvedMode, toggleTheme } = useTheme();
  const { tasks } = useCrmStore();

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [partnerProfileData, setPartnerProfileData] = useState<PartnerProfileData | null>(null);
  const [isPartnerProfileOpen, setIsPartnerProfileOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const prevNotifIdsRef = useRef<Set<string> | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Live Date and Time State
  const [currentDateTime, setCurrentDateTime] = useState<{
    day: string;
    date: string;
    time: string;
    seconds: string;
    period: string;
  } | null>(null);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      const day = now.toLocaleDateString("en-IN", { weekday: "short" });
      const date = now.toLocaleDateString("en-IN", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });

      // 12-hour format with ticking seconds
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const formattedHours = String(hours).padStart(2, "0");

      setCurrentDateTime({
        day,
        date,
        time: `${formattedHours}:${minutes}`,
        seconds,
        period,
      });
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // User DP State
  const [userDp, setUserDp] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Trigger mobile drawer toggle via window event
  const handleToggleMobileSidebar = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("finsocap-toggle-mobile-sidebar"));
    }
  };

  // Read live session from localStorage so logged-in Staff name and role are reflected
  const [currentUser, setCurrentUser] = useState<any>(user || null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("finsocap_user_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.user) {
          setCurrentUser(parsed.user);
        } else if (parsed?.role) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const userName = currentUser?.name || user?.name || "Admin";
  const userRole = (currentUser?.role || (user as any)?.role || "ADMIN").toUpperCase().trim();
  const userEmail = currentUser?.email || user?.email || "admin@finsocap.com";

  // Helpers to get and set dismissed/read notification IDs per user
  const getReadNotificationIds = (): Set<string> => {
    try {
      const stored = localStorage.getItem(`finsocap_notif_read_${userEmail}`);
      if (stored) return new Set(JSON.parse(stored));
    } catch (e) {}
    return new Set<string>();
  };

  const getDismissedNotificationIds = (): Set<string> => {
    try {
      const stored = localStorage.getItem(`finsocap_notif_dismissed_${userEmail}`);
      if (stored) return new Set(JSON.parse(stored));
    } catch (e) {}
    return new Set<string>();
  };

  // Load notifications from API on mount and sync with user dismissals
  useEffect(() => {
    const fetchRealNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          let serverNotifs: NotificationItem[] = data.notifications || [];

          serverNotifs = serverNotifs.filter(
            n => !n.id.startsWith("notif-1") && 
                 !n.id.startsWith("notif-2") && 
                 !n.id.startsWith("notif-3") && 
                 !n.id.startsWith("notif-4")
          );

          // Role-based notification filtering:
          // ADMIN sees global compliance & operations notifications
          // Non-admin roles (STAFF, SPECIALIST, EXECUTIVE, PARTNER, CLIENT) only see their personal assigned notifications
          if (userRole !== "ADMIN") {
            const myName = (userName || "").toLowerCase().trim();
            const myEmail = (userEmail || "").toLowerCase().trim();
            const isStaff = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole);
            const isPartner = userRole === "PARTNER";
            const isClient = userRole === "CLIENT";

            serverNotifs = serverNotifs.filter(n => {
              const assignedName = (n.assignedToName || "").toLowerCase().trim();
              const notifPartner = (n.partnerName || "").toLowerCase().trim();
              const notifClient = (n.clientName || "").toLowerCase().trim();

              if (isStaff) {
                // Must be directly assigned to this staff member
                const matchesAssignee = myName && assignedName && (assignedName.includes(myName) || myName.includes(assignedName));
                return Boolean(matchesAssignee);
              }

              if (isPartner) {
                // Must belong to this partner
                const matchesPartner = (myName && notifPartner && (notifPartner.includes(myName) || myName.includes(notifPartner))) ||
                                       (myEmail && notifPartner.includes(myEmail));
                return Boolean(matchesPartner);
              }

              if (isClient) {
                // Must belong to this client
                const matchesClient = (myName && notifClient && (notifClient.includes(myName) || myName.includes(notifClient))) ||
                                      (myEmail && notifClient.includes(myEmail));
                return Boolean(matchesClient);
              }

              return false;
            });
          }

          // Apply persisted dismissed & read states
          const dismissedSet = getDismissedNotificationIds();
          const readSet = getReadNotificationIds();

          const activeNotifs = serverNotifs
            .filter(n => !dismissedSet.has(n.id))
            .map(n => ({
              ...n,
              isRead: n.isRead || readSet.has(n.id),
            }));

          if (prevNotifIdsRef.current !== null) {
            const hasNewUnread = activeNotifs.some(n => !n.isRead && !prevNotifIdsRef.current?.has(n.id));
            if (hasNewUnread) {
              soundEffects.playNotification();
            }
          }
          prevNotifIdsRef.current = new Set(activeNotifs.map(n => n.id));

          setNotifications(activeNotifs);
        }
      } catch (err) {
        // Fallback keep local notifications
      }
    };

    fetchRealNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchRealNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userRole, userEmail, userName]);

  // Synchronize user DP
  useEffect(() => {
    const emailToUse = userEmail;

    const loadUserScopedDp = () => {
      if (emailToUse) {
        try {
          const userSpecificDp = localStorage.getItem(`finsocap_user_dp_${emailToUse}`);
          if (userSpecificDp) {
            setUserDp(userSpecificDp);
            return;
          }
        } catch (err) {}
      }
      setUserDp(null);
    };

    loadUserScopedDp();

    const handleDpUpdate = () => loadUserScopedDp();
    window.addEventListener("user-dp-updated", handleDpUpdate);
    window.addEventListener("storage", handleDpUpdate);
    return () => {
      window.removeEventListener("user-dp-updated", handleDpUpdate);
      window.removeEventListener("storage", handleDpUpdate);
    };
  }, [userEmail]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    try {
      const allIds = updated.map(n => n.id);
      localStorage.setItem(`finsocap_notif_read_${userEmail}`, JSON.stringify(allIds));
    } catch (err) {}
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    try {
      const readSet = getReadNotificationIds();
      readSet.add(id);
      localStorage.setItem(`finsocap_notif_read_${userEmail}`, JSON.stringify(Array.from(readSet)));
    } catch (err) {}
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    try {
      const dismissedSet = getDismissedNotificationIds();
      dismissedSet.add(id);
      localStorage.setItem(`finsocap_notif_dismissed_${userEmail}`, JSON.stringify(Array.from(dismissedSet)));
    } catch (err) {}
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications([]);
    try {
      const dismissedSet = getDismissedNotificationIds();
      allIds.forEach(id => dismissedSet.add(id));
      localStorage.setItem(`finsocap_notif_dismissed_${userEmail}`, JSON.stringify(Array.from(dismissedSet)));
    } catch (err) {}
  };

  const filteredNotifications = notifFilter === "all" 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/tasks?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getNotifIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "chat":
      case "support":
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case "task":
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
        );
      case "payment":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <header className="h-[74px] bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-3.5 sm:px-6 lg:px-8 sticky top-0 z-30 transition-colors">
      
      {/* 1. LEFT CONTROLS: Mobile Toggle Button + SEARCH BAR */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl mr-2">
        {/* Mobile Hamburger Toggle (hidden on lg: screens) */}
        <button
          type="button"
          onClick={handleToggleMobileSidebar}
          aria-label="Open Mobile Menu"
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 text-blue-600 dark:text-sky-400" />
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3 sm:px-3.5 py-2 w-full max-w-[220px] sm:max-w-xs md:max-w-sm lg:w-96 transition-all focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search leads, clients, services..." 
            className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 w-full text-xs font-semibold placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-black text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded-md border border-slate-300/60 dark:border-slate-700">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </form>
      </div>

      {/* 2. RIGHT CONTROLS */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* LIVE MINIMAL DATE & TIME (BEFORE NOTIFICATION BELL) */}
        {currentDateTime && (
          <div className="hidden lg:flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 select-none pr-1">
            {/* Calendar: Day, DD MMM YYYY */}
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{currentDateTime.day},</span>
              <span className="text-slate-500 dark:text-slate-400">{currentDateTime.date}</span>
            </div>

            {/* Minimal Dot Divider */}
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>

            {/* Clock: HH:MM:SS AM/PM */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {currentDateTime.time}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                :{currentDateTime.seconds}
              </span>
              <span className="text-[10px] font-bold tracking-tight text-slate-400 dark:text-slate-500 ml-0.5">
                {currentDateTime.period}
              </span>
            </div>
          </div>
        )}

        {/* Financial Business Calculator Button (Global Header Floating Popup) */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCalculatorOpen(!isCalculatorOpen);
              setIsNotifOpen(false);
              setIsProfileOpen(false);
            }}
            className={`relative p-2 rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
              isCalculatorOpen
                ? "bg-slate-900 border-slate-900 shadow-md shadow-slate-900/30 ring-2 ring-blue-500/40"
                : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
            }`}
            title="Finsocap Business Calculator (Basic, GST, EMI, %)"
          >
            {/* Apple / Modern iOS-style 4-circle Calculator Icon */}
            <div className="w-[22px] h-[22px] rounded-[7px] bg-[#22252e] p-[2.5px] grid grid-cols-2 gap-[1.5px] shadow-sm select-none">
              {/* Top-Left: + */}
              <div className="rounded-full bg-[#464c5a] flex items-center justify-center text-[8px] font-bold text-white leading-none">
                +
              </div>
              {/* Top-Right: - */}
              <div className="rounded-full bg-[#464c5a] flex items-center justify-center text-[9px] font-bold text-white leading-none">
                −
              </div>
              {/* Bottom-Left: × */}
              <div className="rounded-full bg-[#464c5a] flex items-center justify-center text-[8px] font-bold text-white leading-none">
                ×
              </div>
              {/* Bottom-Right: = (Orange) */}
              <div className="rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#f47c00] flex items-center justify-center text-[8px] font-black text-white leading-none shadow-[0_1px_2px_rgba(244,124,0,0.5)]">
                =
              </div>
            </div>
          </button>
        </div>

        {/* Notification Center */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
              isNotifOpen 
                ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-sky-400 border-blue-300 dark:border-blue-700 shadow-sm" 
                : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION CENTER MODAL */}
          {isNotifOpen && (
            <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[75px] sm:top-full mt-0 sm:mt-3 w-auto sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0d1527] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400 rounded-xl">
                    <Bell className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 dark:text-sky-400 hover:underline font-bold flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-2 bg-white dark:bg-[#0d1527] gap-3 text-xs">
                <button
                  onClick={() => setNotifFilter("all")}
                  className={`pb-2.5 font-bold border-b-2 transition-all cursor-pointer ${
                    notifFilter === "all"
                      ? "border-blue-600 text-blue-600 dark:text-sky-400"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter("unread")}
                  className={`pb-2.5 font-bold border-b-2 transition-all cursor-pointer ${
                    notifFilter === "unread"
                      ? "border-blue-600 text-blue-600 dark:text-sky-400"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">All caught up!</p>
                    <p className="text-[11px] text-slate-400">No new notifications in this view.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        setIsNotifOpen(false);
                        let targetUrl = notif.actionUrl || "/dashboard";
                        // If non-admin user clicks a notification targeting admin-only areas, gracefully route to their tasks
                        if (userRole !== "ADMIN") {
                          if (
                            targetUrl.includes("/dashboard/allocation") ||
                            targetUrl.includes("/dashboard/partners") ||
                            targetUrl.includes("/dashboard/team") ||
                            targetUrl.includes("/dashboard/clients")
                          ) {
                            targetUrl = "/dashboard/tasks";
                          }
                        }
                        router.push(targetUrl);
                      }}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative group ${
                        !notif.isRead ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      {getNotifIcon(notif.type)}

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2 font-medium">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-bold">
                          {notif.time}
                        </span>
                      </div>

                      <button
                        onClick={(e) => removeNotification(notif.id, e)}
                        className="absolute right-3 top-3 p-1 rounded-md text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <Link
                  href="/dashboard/chat"
                  onClick={() => setIsNotifOpen(false)}
                  className="font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  View Live Chats <ChevronRight className="w-3 h-3" />
                </Link>

                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-slate-400 hover:text-red-600 font-bold transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-800 hover:opacity-95 transition-opacity text-left cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                {userName}
              </p>
              <p className="text-[10px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider mt-0.5">
                {userRole}
              </p>
            </div>
            
            {userDp ? (
              <img
                src={userDp}
                alt={userName}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-blue-500 shadow-md flex-shrink-0 transition-transform active:scale-95"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/25 flex-shrink-0 transition-transform active:scale-95">
                {userName ? userName.charAt(0).toUpperCase() : "S"}
              </div>
            )}
          </button>

          {/* USER PROFILE DROPDOWN PANEL */}
          {isProfileOpen && (
            <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[75px] sm:top-full mt-0 sm:mt-3 w-auto sm:w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0d1527] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="p-4 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-[#0c1427] dark:to-blue-950/40 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {userDp ? (
                    <img
                      src={userDp}
                      alt={userName}
                      className="w-11 h-11 rounded-2xl object-cover border border-blue-400 shadow-md"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow-md shadow-blue-500/25">
                      {userName ? userName.charAt(0).toUpperCase() : "S"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {userName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                      {userEmail}
                    </p>
                    <div className="inline-flex items-center gap-1 text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 px-2 py-0.5 rounded-full mt-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                      <span>{userRole}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-2 text-xs font-bold text-slate-700 dark:text-slate-300 space-y-0.5">
                {userRole === "PARTNER" ? (
                  <button
                    onClick={async () => {
                      setIsProfileOpen(false);
                      try {
                        const res = await partnerPortalService.auth.getProfile();
                        if (res?.success && res.data) {
                          setPartnerProfileData(res.data);
                          setIsPartnerProfileOpen(true);
                        }
                      } catch (e) {
                        router.push("/dashboard/settings");
                      }
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-blue-500" /> Partner Profile & KYC (Op 04)
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-blue-500" /> My Profile & Security
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                )}

                <Link
                  href="/dashboard/tasks"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-indigo-500" /> Operations Queue
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Logout Footer */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <button
                  onClick={() => {
                    try {
                      sessionStorage.removeItem("finsocap_session_login_logged");
                      localStorage.removeItem("finsocap_user_session");
                    } catch (e) {}
                    router.push("/dashboard/login");
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout from Finsocap</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Finsocap Business Calculator Modal */}
      <BusinessCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Partner Profile & KYC Modal (Op 04) */}
      {isPartnerProfileOpen && partnerProfileData && (
        <PartnerProfileModal
          profile={partnerProfileData}
          onClose={() => setIsPartnerProfileOpen(false)}
        />
      )}
    </header>
  );
}
