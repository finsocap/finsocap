"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, FileText, Mail, Share2, Users, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

interface AccessDeniedProps {
  title?: string;
  description?: string;
  allowedRole?: string;
}

export default function AccessDenied({
  title = "You Don't Have Access",
  description = "Aapke paas is section ya page ka access nahi hai. Ye section administrators aur managers ke liye reserved hai.",
  allowedRole = "Admin / Manager",
}: AccessDeniedProps) {
  const { data: session } = useSession();
  const currentRole = (session?.user as any)?.role || "User";
  const userName = session?.user?.name || "Team Member";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1b2b5a]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Icon */}
        <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-bounce duration-1000" />
        </div>

        {/* Badges */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Access Restricted • Role: {currentRole}</span>
        </div>

        {/* Title */}
        <h2 className="relative z-10 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="relative z-10 text-sm text-slate-600 leading-relaxed mb-6">
          {description}
        </p>

        {/* Role Information Card */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 mb-8 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-500">Logged in as:</span>
            <span className="font-bold text-slate-900">{userName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-500">Your Current Role:</span>
            <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">{currentRole}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-500">Required Role:</span>
            <span className="px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700">{allowedRole}</span>
          </div>
        </div>

        {/* Permitted destinations for Writer */}
        <div className="relative z-10 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available sections for your role:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/dashboard/blogs"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-[#1b2b5a] hover:text-white border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm group"
            >
              <FileText className="w-4 h-4 text-[#0da687] group-hover:text-emerald-300" />
              <span>Blog Posts</span>
            </Link>

            <Link
              href="/dashboard/mail"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-[#1b2b5a] hover:text-white border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm group"
            >
              <Mail className="w-4 h-4 text-[#0da687] group-hover:text-emerald-300" />
              <span>Webmail & Inbox</span>
            </Link>

            <Link
              href="/dashboard/social"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-[#1b2b5a] hover:text-white border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm group"
            >
              <Share2 className="w-4 h-4 text-[#0da687] group-hover:text-emerald-300" />
              <span>Social Media Hub</span>
            </Link>

            <Link
              href="/dashboard/team"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-[#1b2b5a] hover:text-white border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm group"
            >
              <Users className="w-4 h-4 text-[#0da687] group-hover:text-emerald-300" />
              <span>Team</span>
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1b2b5a] to-[#0da687] text-white text-xs font-bold shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
