"use client";

import { useMemo } from "react";
import { Users, TrendingUp, ShieldCheck, Building2, UserCheck, Star } from "lucide-react";
import { ClientMetrics, ClientProfile } from "@/types/api";

interface ClientsInfographicProps {
  metrics?: ClientMetrics | null;
  clients?: ClientProfile[] | any[];
}

export default function ClientsInfographic({ metrics, clients = [] }: ClientsInfographicProps) {
  const stats = useMemo(() => {
    const list: ClientProfile[] = clients || [];
    const total = metrics?.totalClients ?? list.length;
    const pvtLtd =
      metrics?.privateLimited ??
      list.filter((c) => (c.constitutionType || "").toUpperCase().includes("PRIVATE") || (c.constitutionType || "").includes("OPC")).length;
    const llp =
      metrics?.partnershipsAndLlps ??
      list.filter((c) => (c.constitutionType || "").toUpperCase().includes("LLP") || (c.constitutionType || "").toUpperCase().includes("PARTNER")).length;
    const prop =
      metrics?.proprietorships ??
      list.filter((c) => (c.constitutionType || "").toUpperCase().includes("PROP")).length;

    const pvtPct = total > 0 ? Math.round((pvtLtd / total) * 100) : 0;
    const llpPct = total > 0 ? Math.round((llp / total) * 100) : 0;
    const propPct = total > 0 ? Math.max(0, 100 - pvtPct - llpPct) : 0;

    // Active cases or active status
    const activeClients = list.filter((c) => c.latestStatus !== "CANCELLED" && c.latestStatus !== "REJECTED").length;
    const retentionRate = total > 0 ? Math.round((activeClients / total) * 100) : 100;

    // Sparklines dynamic bars based on real counts
    const genBars = (val: number) => {
      if (val === 0) return [0, 0, 0, 0, 0, 0, 0, 0];
      const base = Math.min(100, Math.max(20, val * 10));
      return [
        Math.round(base * 0.4),
        Math.round(base * 0.6),
        Math.round(base * 0.5),
        Math.round(base * 0.8),
        Math.round(base * 0.7),
        Math.round(base * 0.95),
        Math.round(base * 0.85),
        base,
      ];
    };

    return {
      total,
      pvtLtd,
      llp,
      prop,
      pvtPct,
      llpPct,
      propPct,
      activeClients,
      retentionRate,
      barsTotal: genBars(total),
      barsPvt: genBars(pvtLtd),
      barsProp: genBars(prop),
      barsLlp: genBars(llp),
    };
  }, [metrics, clients]);

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
              Verified Records
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Breakdown of corporate entities, partnership firms, and legal constitution structures
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{stats.retentionRate}% Active Ratio</span>
        </div>
      </div>

      {/* Grid: 4 Metric Cards with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Businesses */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Total Entities</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.total}
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {stats.barsTotal.map((h, i) => (
              <div key={i} className="flex-1 bg-purple-500/70 rounded-full" style={{ height: `${Math.max(15, h)}%` }} />
            ))}
          </div>
        </div>

        {/* Card 2: Pvt Ltd / OPC */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Pvt Ltd &amp; OPC</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.pvtLtd}
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {stats.barsPvt.map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-500/70 rounded-full" style={{ height: `${Math.max(15, h)}%` }} />
            ))}
          </div>
        </div>

        {/* Card 3: Proprietorships */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Proprietorships</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.prop}
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {stats.barsProp.map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/70 rounded-full" style={{ height: `${Math.max(15, h)}%` }} />
            ))}
          </div>
        </div>

        {/* Card 4: Partnerships & LLPs */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">LLP / Partnership</span>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {stats.llp}
          </div>
          <div className="flex items-end gap-0.5 h-3 mt-2">
            {stats.barsLlp.map((h, i) => (
              <div key={i} className="flex-1 bg-sky-500/70 rounded-full" style={{ height: `${Math.max(15, h)}%` }} />
            ))}
          </div>
        </div>

      </div>

      {/* Segmented Constitution Bars */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Private Ltd / OPC ({stats.pvtPct}%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> LLP / Partnership ({stats.llpPct}%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sole Proprietorship ({stats.propPct}%)</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          {stats.total > 0 ? (
            <>
              <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${stats.pvtPct}%` }} />
              <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${stats.llpPct}%` }} />
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats.propPct}%` }} />
            </>
          ) : (
            <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
          )}
        </div>
      </div>

    </div>
  );
}
