"use client";

import { useMemo } from "react";
import { Boxes, CheckCircle2, TrendingUp, Clock, ShieldCheck, Zap } from "lucide-react";
import { CatalogService } from "@/types/api";

interface ServicesInfographicProps {
  services: (CatalogService | any)[];
}

export default function ServicesInfographic({ services = [] }: ServicesInfographicProps) {
  const stats = useMemo(() => {
    const list = services || [];
    const total = list.length;
    const active = list.filter((s) => s.active === true || s.status === "Active").length;
    const inactive = total - active;
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    
    const totalPrice = list.reduce((acc, s) => acc + (s.startingClientPrice ?? s.price ?? 0), 0);
    const avgPrice = total > 0 ? Math.round(totalPrice / total) : 0;
    
    const totalTat = list.reduce((acc, s) => acc + (s.estimatedTurnaroundDays ?? 4), 0);
    const avgTat = total > 0 ? (totalTat / total).toFixed(1) : "3.0";

    // Category distribution
    const catMap: Record<string, number> = {};
    list.forEach((s) => {
      const cat = (s.category || "GENERAL")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const topCategories = Object.entries(catMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / (total || 1)) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return { total, active, inactive, activePct, avgPrice, avgTat, topCategories };
  }, [services]);

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Top Row: Mini Stat Badges with Micro-Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Metric 1: Total Catalog */}
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
              <div key={i} className="flex-1 bg-indigo-500/70 rounded-full" style={{ height: `${stats.total > 0 ? h : 10}%` }} />
            ))}
          </div>
        </div>

        {/* Metric 2: Active Rate */}
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
              <div key={i} className="flex-1 bg-emerald-500/70 rounded-full" style={{ height: `${stats.active > 0 ? h : 10}%` }} />
            ))}
          </div>
        </div>

        {/* Metric 3: Average Price */}
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
              <div key={i} className="flex-1 bg-purple-500/70 rounded-full" style={{ height: `${stats.avgPrice > 0 ? h : 10}%` }} />
            ))}
          </div>
        </div>

        {/* Metric 4: Avg Turnaround */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Avg Turnaround</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.avgTat}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-1.5">Days TAT</span>
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[50, 70, 60, 80, 75, 90, 65, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-amber-500/70 rounded-full" style={{ height: `${Number(stats.avgTat) > 0 ? h : 10}%` }} />
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
              Top Catalog Categories Share
            </span>
            <span className="text-[11px] font-bold text-slate-400">Portfolio Weight</span>
          </div>

          <div className="space-y-2">
            {stats.topCategories.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center">No catalog services available.</div>
            ) : (
              stats.topCategories.map((cat, idx) => {
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
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rate Card Health Badge (4 cols) */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border border-indigo-100 dark:border-indigo-950 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase">Rate Card Health</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.activePct}% Live
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Active services instantly synced across all franchise partner branch portals.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
