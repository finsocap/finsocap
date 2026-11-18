"use client";

import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import AnimatedCounter from "@/components/Global/AnimatedCounter";

interface BotrixSparklineCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  delta: string;
  deltaPositive?: boolean;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  barColor: string; // e.g. "bg-indigo-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500"
  barHeights?: number[]; // list of heights 10-100%
}

export default function BotrixSparklineCard({
  title,
  value,
  isCurrency = false,
  delta,
  deltaPositive = true,
  subtitle,
  icon,
  iconBg,
  barColor,
  barHeights = [30, 45, 25, 60, 40, 75, 50, 90, 65, 80, 45, 70, 85, 95, 60, 75, 90, 100, 70, 85],
}: BotrixSparklineCardProps) {
  return (
    <div className="group bg-white dark:bg-[#0c1427] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between">
      {/* Top Row: Title, Value, Icon */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isCurrency && "₹"}
                {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black ${
                  deltaPositive
                    ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400"
                }`}
              >
                {deltaPositive ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                {delta}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 truncate">
              {subtitle}
            </p>
          </div>

          {/* Icon Badge */}
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${iconBg}`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Bottom Row: Micro-Bar Audio-Wave Sparkline matching Botrix */}
      <div className="pt-4 mt-2">
        <div className="flex items-end gap-1 h-7 w-full overflow-hidden">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full ${barColor} opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-y-110 origin-bottom`}
              style={{
                height: `${h}%`,
                transitionDelay: `${i * 12}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
