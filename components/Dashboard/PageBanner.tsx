"use client";

import React, { ReactNode } from "react";
import { Sparkles, LucideIcon } from "lucide-react";

interface PageBannerProps {
  icon: LucideIcon;
  badge: string;
  badgeMeta?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  bottomMeta?: string;
}

export default function PageBanner({
  icon: Icon,
  badge,
  badgeMeta,
  title,
  description,
  actions,
  bottomMeta,
}: PageBannerProps) {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 dark:from-[#0b1226] dark:via-[#0e1c44]/80 dark:to-[#080d1a] border border-blue-200/70 dark:border-blue-900/40 shadow-sm shadow-blue-500/5">
      {/* Ambient Brand Glow Mesh - Strictly clipped inside banner shape without clipping outer dropdowns */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none z-0">
        <div className="absolute -top-24 -left-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 sm:gap-5">
        {/* Brand Identity & Title */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#0e1c44] via-blue-600 to-sky-400 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 ring-2 sm:ring-4 ring-blue-500/10">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0b1226] rounded-full ring-2 ring-emerald-500/20 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 dark:text-sky-400" />
                <span>{badge}</span>
              </span>
              {badgeMeta && (
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • {badgeMeta}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
              {description}
            </p>
          </div>
        </div>

        {/* Right Action / Controls - Elevated z-index so dropdowns float over bottom sub-bar */}
        {actions && (
          <div className="relative z-30 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Bottom Sub-bar (Lower z-index than actions so dropdowns never get obstructed) */}
      <div className="relative z-10 mt-5 pt-3.5 border-t border-blue-100/80 dark:border-blue-900/40 flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-Time Sync Active
          </span>
          {bottomMeta && (
            <>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className="hidden sm:inline">{bottomMeta}</span>
            </>
          )}
        </div>
        <span className="px-2.5 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 font-bold text-[10px] border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
          Finsocap v2.4 Enterprise
        </span>
      </div>
    </div>
  );
}
