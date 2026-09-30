"use client";

import { useMemo } from "react";
import { Boxes, CheckCircle2, TrendingUp, Clock, ShieldCheck, Zap } from "lucide-react";
import { ServiceModel } from "@/lib/crmStore";

export default function ServicesInfographic({ services }: { services: ServiceModel[] }) {
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === "Active").length;
    const inactive = services.filter((s) => s.status === "Inactive").length;
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    const avgPrice = total > 0 ? Math.round(services.reduce((acc, s) => acc + s.price, 0) / total) : 0;
    
    // Category distribution
    const catMap: Record<string, number> = {};
    services.forEach(s => {
      catMap[s.category] = (catMap[s.category] || 0) + 1;
    });

    const topCategories = Object.entries(catMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / (total || 1)) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return { total, active, inactive, activePct, avgPrice, topCategories };
  }, [services]);

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Top Row: Mini Stat Badges with Micro-Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Metric 1 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Total Catalog</span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 ml-1.5">Services</span>
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[40, 60, 30, 80, 50, 90, 70, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Active Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.activePct}%
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">{stats.active} live</span>
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[60, 75, 80, 85, 90, 95, 92, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Average Price</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ₹{stats.avgPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[30, 50, 40, 70, 60, 85, 90, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-purple-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Avg Turnaround</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              3 - 7
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-1.5">Days TAT</span>
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[50, 70, 60, 80, 75, 90, 65, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-amber-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

      </div>

      {/* Middle Row: Visual Category Radial Distribution + Health Ratio Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Category Breakdown (8 cols) */}
        <div className="md:col-span-8 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
              Top Categories Share
            </span>
            <span className="text-[11px] font-bold text-slate-400">Portfolio Weight</span>
          </div>

          <div className="space-y-2">
            {stats.topCategories.map((cat, idx) => {
              const colors = [
                "from-indigo-600 to-blue-500",
                "from-purple-600 to-indigo-500",
                "from-emerald-500 to-teal-400",
                "from-amber-500 to-orange-400",
              ];
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="truncate">{cat.name}</span>
                    <span className="font-mono text-[11px]">{cat.count} services ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-500`}
                      style={{ width: `${Math.max(cat.pct, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circular Health Dial (4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/20 dark:from-slate-900/60 dark:to-blue-950/20 border border-slate-100 dark:border-slate-800/80">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700"
                strokeDasharray={`${stats.activePct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                {stats.activePct}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                Active
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-2 text-center">
            Catalog Reliability Score
          </span>
        </div>

      </div>

    </div>
  );
}
