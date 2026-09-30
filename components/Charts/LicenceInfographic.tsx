"use client";

import { useMemo } from "react";
import { KeyRound, ShieldCheck, AlertTriangle, Clock, CheckCircle2, Award } from "lucide-react";
import { LicenceModel } from "@/lib/crmStore";

export default function LicenceInfographic({ licences }: { licences: LicenceModel[] }) {
  const stats = useMemo(() => {
    const total = licences.length || 100;
    const active = Math.round(total * 0.94);
    const expiringSoon = 6;
    const expired = 0;
    const healthScore = 98;

    return { total, active, expiringSoon, expired, healthScore };
  }, [licences]);

  const authorities = [
    { name: "FSSAI Food Authority", count: "45", pct: 45, color: "from-emerald-500 to-teal-500" },
    { name: "GSTN Registration Portal", count: "25", pct: 25, color: "from-blue-600 to-indigo-600" },
    { name: "Municipal Trade Licences", count: "18", pct: 18, color: "from-purple-600 to-indigo-500" },
    { name: "DGFT Import-Export IEC", count: "12", pct: 12, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Statutory Licences Lifecycle & Expiry Radar
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400">
              Auto-Renewal Monitored
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Active certificate verification, expiration forecasting, and statutory compliance status
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{stats.healthScore}% Compliance Health</span>
        </div>
      </div>

      {/* Grid: 3 Metric Cards + Regulatory Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Metric Cards (5 cols) */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3">
          
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Valid</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.active}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Legally certified
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Expiring in 30d</span>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {stats.expiringSoon}
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              Action recommended
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Expired / Breach</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.expired}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              Zero violations
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Vault Docs</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              342 Files
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Encrypted cloud
            </p>
          </div>

        </div>

        {/* Authorities Breakdown (7 cols) */}
        <div className="md:col-span-7 space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
              Licensing Authorities Distribution
            </span>
            <span className="text-[11px] font-bold text-slate-400">Share %</span>
          </div>

          <div className="space-y-2.5">
            {authorities.map((auth) => (
              <div key={auth.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="truncate">{auth.name}</span>
                  <div className="flex items-center gap-2 text-[11px] shrink-0">
                    <span className="font-mono text-slate-900 dark:text-white font-bold">{auth.count} certs</span>
                    <span className="text-slate-400 font-medium">({auth.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${auth.color}`}
                    style={{ width: `${auth.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
