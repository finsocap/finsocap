"use client";

import React from "react";
import { LucideIcon, X } from "lucide-react";

interface ModalHeaderBannerProps {
  badge?: string;
  title: string;
  description?: string;
  badgeTag?: string;
  icon?: LucideIcon;
  onClose?: () => void;
  className?: string;
}

export default function ModalHeaderBanner({
  badge,
  title,
  description,
  badgeTag,
  icon: Icon,
  onClose,
  className = "",
}: ModalHeaderBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20 ${className}`}
    >
      {/* Ambient soft glow bubbles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/10 rounded-full blur-lg pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            {badge && (
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-100 block truncate">
                {badge}
              </span>
            )}
            <h2 className="font-black text-white text-base sm:text-lg tracking-tight leading-tight truncate">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badgeTag && (
            <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-xs text-white">
              {badgeTag}
            </span>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close modal"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 ml-1"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {description && (
        <p className="text-[11px] sm:text-xs text-blue-50 font-medium mt-2 leading-relaxed relative z-10 max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}
