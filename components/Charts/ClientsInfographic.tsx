"use client";

import { useMemo } from "react";
import { Users, TrendingUp, ShieldCheck, Building2, UserCheck, Star } from "lucide-react";
import { ClientModel } from "@/lib/crmStore";

export default function ClientsInfographic({ clients }: { clients: ClientModel[] }) {
  const stats = useMemo(() => {
    const total = clients.length || 842;
    const active = Math.round(total * 0.94);
    const retentionRate = 96.4;
    const avgLtv = "₹18,400";

    return { total, active, retentionRate, avgLtv };
  }, [clients]);

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Client Portfolio & Enterprise Constitution
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              KYC Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Breakdown of corporate entities, partnership firms, and recurring customer lifetime value
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
          <span>4.9 CSAT Rating</span>
        </div>
      </div>

      {/* Grid: 4 Metric Cards with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Total Businesses</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.total}
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[40, 60, 50, 80, 70, 95, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-purple-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Retention Ratio</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.retentionRate}%
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[80, 85, 90, 92, 95, 96, 95, 97].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Average LTV</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.avgLtv}
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[30, 45, 60, 50, 75, 80, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Monthly Net Inflow</span>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            +48 New
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {[50, 60, 45, 70, 80, 75, 90, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-sky-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

      </div>

      {/* Segmented Constitution Bars */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Private Ltd / OPC (54%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> LLP / Partnership (26%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sole Proprietorship (20%)</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div className="h-full bg-indigo-600" style={{ width: "54%" }} />
          <div className="h-full bg-purple-500" style={{ width: "26%" }} />
          <div className="h-full bg-emerald-500" style={{ width: "20%" }} />
        </div>
      </div>

    </div>
  );
}
