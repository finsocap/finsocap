"use client";

import { useMemo } from "react";
import { Award, CheckCircle2, Clock, ShieldCheck, Zap, TrendingUp, AlertTriangle } from "lucide-react";

export default function ServiceDeliveryInfographic() {
  const departments = [
    { name: "FSSAI Food Licensing", rate: "99.6%", tat: "2.1d", color: "from-emerald-500 to-teal-500", pct: 99.6 },
    { name: "GST Returns & Invoicing", rate: "99.1%", tat: "1.8d", color: "from-blue-600 to-indigo-600", pct: 99.1 },
    { name: "MCA Corporate Filings", rate: "98.2%", tat: "3.4d", color: "from-purple-600 to-indigo-500", pct: 98.2 },
    { name: "Trademark IP Registry", rate: "94.5%", tat: "4.8d", color: "from-amber-500 to-orange-500", pct: 94.5 },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Service Delivery Turnaround Time (TAT) & Compliance SLA
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              Gold SLA Standard
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Turnaround velocity, first-time-right accuracy, and departmental delivery metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            588 Cases Completed
          </span>
        </div>
      </div>

      {/* Grid: 3 Metric Cards + Department Velocity Bars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Left Metric Dials (5 cols) */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3">
          
          {/* Dial 1 */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Filing TAT</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              2.8 Days
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              ✓ 44% faster than norm
            </p>
          </div>

          {/* Dial 2 */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">First-Time Right</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              99.4%
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Zero resubmission
            </p>
          </div>

          {/* Dial 3 */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Collection Rate</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              81.8%
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              ₹3.86L collected
            </p>
          </div>

          {/* Dial 4 */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Client CSAT</span>
            <div className="text-2xl font-black text-amber-500 mt-1">
              4.92 / 5
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              320 verified reviews
            </p>
          </div>

        </div>

        {/* Right Department Velocity Bars (7 cols) */}
        <div className="md:col-span-7 space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
              Department Performance Velocity
            </span>
            <span className="text-[11px] font-bold text-slate-400">Approval Rate & SLA</span>
          </div>

          <div className="space-y-2.5">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="truncate">{dept.name}</span>
                  <div className="flex items-center gap-2 text-[11px] shrink-0">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{dept.rate}</span>
                    <span className="text-slate-400 font-medium">({dept.tat} avg)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${dept.color}`}
                    style={{ width: `${dept.pct}%` }}
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
