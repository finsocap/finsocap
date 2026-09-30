"use client";

import { useMemo } from "react";
import { Users, Award, ShieldCheck, Flame, Zap, Trophy } from "lucide-react";
import { UserModel, TaskModel } from "@/lib/crmStore";

export default function TeamInfographic({ users, tasks }: { users: UserModel[]; tasks: TaskModel[] }) {
  const stats = useMemo(() => {
    const total = users.length || 14;
    const active = users.filter(u => u.status === "Active").length;
    const utilization = 84;

    // Top 3 Performers
    const performers = [
      { name: "Rahul Jha", role: "Chartered Accountant", count: 48, rank: "1", color: "from-amber-400 to-amber-600", height: "h-24" },
      { name: "Kanhaiya", role: "Sr. Legal Consultant", count: 39, rank: "2", color: "from-slate-300 to-slate-400", height: "h-20" },
      { name: "Gaurav", role: "Company Secretary", count: 31, rank: "3", color: "from-amber-700 to-amber-900", height: "h-16" },
    ];

    return { total, active, utilization, performers };
  }, [users, tasks]);

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Team Productivity & Performer Podium
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              Q3 Benchmark
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Operational throughput, peer rankings, and overall department utilization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            {stats.active} of {stats.total} Team Members Active
          </span>
        </div>
      </div>

      {/* Grid: 3D Top Performers Podium (7 cols) + Utilization Gauge (5 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Left: 3D Podium for Top 3 (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight mb-4 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            Top Closers This Month
          </span>

          <div className="flex items-end justify-center gap-4 sm:gap-6 pt-4 pb-1">
            
            {/* Rank 2: Kanhaiya */}
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block truncate max-w-[85px]">
                  {stats.performers[1].name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block">
                  {stats.performers[1].count} Cases
                </span>
              </div>
              <div className="w-20 sm:w-24 h-20 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-t-4 border-slate-400 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xl font-black text-slate-500 dark:text-slate-300">#2</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Silver</span>
              </div>
            </div>

            {/* Rank 1: Rahul Jha (Tallest) */}
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 block truncate max-w-[95px]">
                  👑 {stats.performers[0].name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block">
                  {stats.performers[0].count} Cases
                </span>
              </div>
              <div className="w-24 sm:w-28 h-28 rounded-t-2xl bg-gradient-to-t from-amber-200 to-amber-100 dark:from-amber-950/80 dark:to-amber-900/60 border-t-4 border-amber-500 flex flex-col items-center justify-center shadow-md">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">#1</span>
                <span className="text-[10px] font-black text-amber-600 uppercase">Gold CA</span>
              </div>
            </div>

            {/* Rank 3: Gaurav */}
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block truncate max-w-[85px]">
                  {stats.performers[2].name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block">
                  {stats.performers[2].count} Cases
                </span>
              </div>
              <div className="w-20 sm:w-24 h-16 rounded-t-2xl bg-gradient-to-t from-amber-100 to-amber-50 dark:from-slate-900 dark:to-amber-950/30 border-t-4 border-amber-700 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-black text-amber-700 dark:text-amber-500">#3</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Bronze</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Team Capacity & Workload Index (5 cols) */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Team Utilization</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Optimal Load</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path className="text-slate-200 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-600" strokeDasharray={`${stats.utilization}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-xs font-black text-slate-800 dark:text-slate-200">
                {stats.utilization}%
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                14 Certified Professionals
              </p>
              <p className="text-[11px] text-slate-400">
                4 CAs • 3 CS • 4 Legal • 3 Ops Execs
              </p>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" style={{ width: `${stats.utilization}%` }} />
          </div>
        </div>

      </div>

    </div>
  );
}
