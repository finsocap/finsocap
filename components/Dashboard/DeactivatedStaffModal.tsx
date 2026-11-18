"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, Lock, AlertTriangle, PhoneCall } from "lucide-react";
import { useCrmStore } from "@/lib/crmStore";

export function isStaffDeactivated(user: any, users: any[]): boolean {
  if (!user) return false;
  const role = String(user.role || "").toUpperCase();
  // Admin cannot be deactivated
  if (role === "ADMIN") return false;

  const userEmail = (user.email || "").toLowerCase().trim();
  const userName = (user.name || "").toLowerCase().trim();
  const userId = String(user.id || "").trim();

  // 1. Check in local storage sync key for cross-tab instant broadcast
  if (typeof window !== "undefined") {
    try {
      const deactList = JSON.parse(localStorage.getItem("finsocap_deactivated_accounts") || "[]");
      if (Array.isArray(deactList)) {
        if (
          deactList.includes(userEmail) ||
          deactList.includes(userName) ||
          deactList.includes(userId)
        ) {
          return true;
        }
      }
    } catch (e) {}
  }

  // 2. Check in CRM store users list
  const matched = users.find((u) => {
    const uEmail = (u.email || "").toLowerCase().trim();
    const uName = (u.name || "").toLowerCase().trim();
    const uId = String(u.id || "").trim();
    return (
      (userEmail && uEmail === userEmail) ||
      (userName && uName === userName) ||
      (userId && uId === userId)
    );
  });

  if (matched && (matched.status === "Deactivated" || matched.active === false)) {
    return true;
  }

  return false;
}

export default function DeactivatedStaffModal({ user }: { user: any }) {
  const router = useRouter();
  const { users } = useCrmStore();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const isLocked = isStaffDeactivated(user, users);
      setLocked(isLocked);
    };

    checkStatus();
    // Re-check periodically & listen to cross-tab storage changes
    const interval = setInterval(checkStatus, 2000);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "finsocap_deactivated_accounts") {
        checkStatus();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [user, users]);

  // Prevent background scrolling and keyboard dismissals while locked
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      window.addEventListener("keydown", handleKeyDown, true);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [locked]);

  if (!locked) return null;

  const handleLogout = () => {
    try {
      localStorage.removeItem("finsocap_user_session");
      sessionStorage.clear();
    } catch (e) {}
    router.replace("/dashboard/login");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="bg-white dark:bg-[#0c1427] border border-rose-200 dark:border-rose-900/60 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center">
        
        {/* Subtle Ambient Red Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        {/* Security Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center mb-5 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Access Suspended
        </h2>

        {/* Role & Name Badge */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-mono text-xs font-bold border border-rose-200 dark:border-rose-800">
          <Lock className="w-3.5 h-3.5" />
          <span>{user?.name || "Staff Member"} • {user?.role || "Specialist"}</span>
        </div>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-4 max-w-md">
          Your workspace privileges have been deactivated by the System Administrator. 
          You no longer have permission to access active cases, client documents, or statutory tools.
        </p>

        {/* Support Callout Box */}
        <div className="w-full mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left space-y-1">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Need Immediate Assistance?</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            If you believe this suspension is in error or require credential reassignment, please contact your central Finsocap Administrator.
          </p>
        </div>

        {/* Sign Out Action Button */}
        <div className="w-full mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 px-5 rounded-2xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Workspace</span>
          </button>
        </div>

      </div>
    </div>
  );
}

