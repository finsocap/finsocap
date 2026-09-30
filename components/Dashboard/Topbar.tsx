"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, Search, User, Check, CheckCheck, X, 
  ChevronRight, ShieldCheck, Settings, LogOut, 
  Receipt, AlertCircle, Building, CreditCard, 
  Clock, Users, IndianRupee, Sparkles,
  MessageSquare, Radio, CheckSquare, Command
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

type NotificationItem = {
  id: string;
  type: "chat" | "support" | "blog" | "task" | "social" | "payment" | "invoice" | "service" | "compliance";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionUrl: string;
};

export default function Topbar({ user }: { user?: any }) {
  const router = useRouter();

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const prevNotifIdsRef = useRef<Set<string> | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // User DP State
  const [userDp, setUserDp] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load notifications from API on mount
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

          if (prevNotifIdsRef.current !== null) {
            const hasNewUnread = serverNotifs.some(n => !n.isRead && !prevNotifIdsRef.current?.has(n.id));
            if (hasNewUnread) {
              soundEffects.playNotification();
            }
          }
          prevNotifIdsRef.current = new Set(serverNotifs.map(n => n.id));

          setNotifications(serverNotifs);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    fetchRealNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchRealNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Synchronize user DP
  useEffect(() => {
    const userEmail = user?.email;

    const loadUserScopedDp = () => {
      if (userEmail) {
        try {
          const userSpecificDp = localStorage.getItem(`finsocap_user_dp_${userEmail}`);
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
  }, [user?.email]);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem("finsocap_notifications", JSON.stringify(items));
    } catch (err) {}
  };

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
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotifications(updated);
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
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

  const userName = user?.name || "Ankit Sharma";
  const userRole = (user as any)?.role || "Admin";
  const userEmail = user?.email || "ankit@finsocap.com";

  return (
    <header className="h-[74px] bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-50 transition-colors">
      
      {/* 1. SEARCH BAR matching Reference Screenshot */}
      <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2 w-72 sm:w-96 transition-all focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search leads, clients, services, tasks, documents..." 
          className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 w-full text-xs font-semibold placeholder:text-slate-400"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-black text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded-md border border-slate-300/60 dark:border-slate-700">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </form>

      {/* 2. RIGHT CONTROLS */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Franchise Live Kiosk Chip */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 radar-live-dot" />
          <span>48 Kiosks Online</span>
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
            <div className="absolute right-0 top-full mt-3 w-84 sm:w-96 bg-white dark:bg-[#0d1527] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              
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
                        router.push(notif.actionUrl);
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
                {userRole} &bull; Executive
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
            <div className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-[#0d1527] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              
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
                      <span>{userRole} Operations Admin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-2 text-xs font-bold text-slate-700 dark:text-slate-300 space-y-0.5">
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
    </header>
  );
}
