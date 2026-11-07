"use client";

import { useMemo } from "react";
import {
  Trophy,
  Crown,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Briefcase,
  Zap,
  CheckCircle2,
  Users,
  Award
} from "lucide-react";
import { TeamMetrics, Specialist, SpecialistReportRow } from "@/types/api";

interface TeamInfographicProps {
  metrics?: TeamMetrics | null;
  specialists?: Specialist[] | any[];
  reportRows?: SpecialistReportRow[] | any[];
  users?: any[];
  tasks?: any[];
}

export default function TeamInfographic({
  metrics,
  specialists = [],
  reportRows = [],
  users = [],
  tasks = [],
}: TeamInfographicProps) {
  const stats = useMemo(() => {
    const list: Specialist[] = specialists.length > 0 ? specialists : (users as any[]);
    const total = metrics?.totalSpecialists ?? list.length;
    const avgUtilization = metrics?.avgUtilization ?? 
      (list.length > 0 ? Math.round(list.reduce((acc, s) => acc + (s.utilizationPercentage || 0), 0) / list.length) : 0);

    // Department counts directly from specialists API
    // 1. Accounting / CA / Tax
    const accountingDeptCount = list.filter(s => {
      const d = (s.department || "").toUpperCase();
      const r = (s.designation || (s as any).role || "").toUpperCase();
      return d.includes("ACCOUNT") || d.includes("TAX") || r.includes("CA") || r.includes("ACCOUNTANT");
    }).length;

    // 2. Legal / Compliance / Advocates
    const legalDeptCount = list.filter(s => {
      const d = (s.department || "").toUpperCase();
      const r = (s.designation || (s as any).role || "").toUpperCase();
      return d.includes("LEGAL") || r.includes("ADVOCATE") || r.includes("LEGAL") || r.includes("CS") || r.includes("COMPLIANCE");
    }).length;

    // 3. Operations / Staff / Other Departments
    const operationsDeptCount = list.filter(s => {
      const d = (s.department || "").toUpperCase();
      const r = (s.designation || (s as any).role || "").toUpperCase();
      return d.includes("OPERATIONS") || d.includes("MANAGEMENT") || d.includes("TEST") || r.includes("STAFF") || r.includes("SPECIALIST") || r.includes("ASSOCIATE");
    }).length;

    // Use actual active tasks from real tasks array or specialists API
    const inFlightCases = tasks && tasks.length > 0
      ? tasks.filter(t => !["Completed", "Cancelled"].includes(t.status) && Boolean(t.assignee)).length
      : ((metrics as any)?.activeCaseloadInFlight ?? list.reduce((acc, s) => acc + (s.activeTasks || 0), 0));

    // Compute top performers strictly based on completed tasks
    // If a staff member hasn't completed any task (completed === 0), they shouldn't appear on the podium!
    let performers: { name: string; count: number; role: string; initials: string }[] = [];

    // Map each specialist/user to their completed tasks from live tasks and reportRows
    const userCompletionMap = new Map<string, number>();

    // 1. From real live tasks array (status === "Completed")
    if (tasks && tasks.length > 0) {
      tasks.forEach((t) => {
        if (t.status === "Completed" && t.assignee) {
          const key = t.assignee.toLowerCase().trim();
          userCompletionMap.set(key, (userCompletionMap.get(key) || 0) + 1);
        }
      });
    }

    // 2. From reportRows if completed > 0
    if (reportRows && reportRows.length > 0) {
      reportRows.forEach((r) => {
        if (r.employeeName && (r.completed || 0) > 0) {
          const key = r.employeeName.toLowerCase().trim();
          const curr = userCompletionMap.get(key) || 0;
          userCompletionMap.set(key, Math.max(curr, r.completed));
        }
      });
    }

    // Construct valid completed performers list
    list.forEach((s: any) => {
      const name = s.fullName || s.name || "";
      if (!name) return;
      const key = name.toLowerCase().trim();
      const completedCount = userCompletionMap.get(key) || 0;
      if (completedCount > 0) {
        performers.push({
          name,
          count: completedCount,
          role: s.designation || s.role || "Specialist",
          initials: name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
        });
      }
    });

    // Sort descending by completed tasks
    performers.sort((a, b) => b.count - a.count);

    const first = performers[0] || null;
    const second = performers[1] || null;
    const third = performers[2] || null;

    // Highest completed count for dynamic height scaling
    const maxCompleted = first?.count || 1;

    // Check if anyone has actually completed any cases
    const hasAnyActivity = Boolean(first && first.count > 0);

    return {
      total,
      avgUtilization,
      accountingDeptCount,
      legalDeptCount,
      operationsDeptCount,
      opsCount: operationsDeptCount,
      legalCount: legalDeptCount,
      accCount: accountingDeptCount,
      inFlightCases,
      performers,
      first,
      second,
      third,
      maxCompleted,
      hasAnyActivity,
    };
  }, [metrics, specialists, reportRows, users, tasks]);

  return (
    <div className="space-y-4">
      {/* MAIN 3-CARD GRID: PODIUM (Col 1) | 3 METRIC TILES (Col 2) | UTILIZATION (Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* === CARD 1: TOP CLOSERS THIS MONTH (PODIUM) - 5 Cols === */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-amber-500 stroke-[2.2]" />
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Top Performing Specialists
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Live ranking from performance reports
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              Active Team
            </span>
          </div>

          {/* 3D Olympic Podium Pedestals or Empty State */}
          {!stats.hasAnyActivity ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2.5">
                <Crown className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                No Completed Tasks Yet
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Leaderboard rankings will activate dynamically once team specialists complete their assigned client tasks.
              </p>
            </div>
          ) : (
            <div className="flex items-end justify-center gap-3 sm:gap-4 pt-10 pb-1">
              
              {/* Rank #2: Silver (Appears only if 2nd specialist has completed >= 1 task) */}
              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                {stats.second ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-200 via-blue-50 to-white dark:from-slate-700 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-sm">
                      {stats.second.initials}
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2 block text-center truncate max-w-[95px]">
                      {stats.second.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                      {stats.second.count} {stats.second.count === 1 ? "Completed" : "Completed"}
                    </span>

                    <div
                      style={{
                        height: `${Math.max(64, Math.round((stats.second.count / stats.maxCompleted) * 110))}px`,
                      }}
                      className="w-full rounded-xl bg-gradient-to-b from-[#e8eef8] to-[#dbe4f3] dark:from-slate-800 dark:to-slate-900 border border-slate-300/80 dark:border-slate-700 shadow-md flex flex-col items-center justify-center p-2 transition-all duration-500"
                    >
                      <span className="text-2xl font-black text-slate-600 dark:text-slate-300">#2</span>
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">SILVER</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                      —
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1 mb-2">Awaiting 2nd</span>
                    <div className="w-full h-16 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400">#2</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rank #1: Gold (Grows higher dynamically as tasks are completed) */}
              <div className="flex flex-col items-center flex-1 max-w-[130px]">
                {stats.first && (
                  <>
                    <div className="relative flex flex-col items-center">
                      <Crown className="w-5 h-5 text-amber-500 fill-amber-400 drop-shadow-sm mb-1" />
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-100 border-2 border-amber-300 shadow-md shadow-amber-500/20 flex items-center justify-center font-black text-amber-950 text-base">
                        {stats.first.initials}
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white mt-1.5 block text-center truncate max-w-[110px]">
                      {stats.first.name}
                    </span>
                    <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/60 px-2 py-0.5 rounded-full mt-0.5 mb-2 border border-amber-300/40">
                      {stats.first.count} {stats.first.count === 1 ? "Completed" : "Completed"}
                    </span>

                    <div
                      style={{
                        height: `${Math.min(180, Math.max(100, 100 + stats.first.count * 15))}px`,
                      }}
                      className="w-full rounded-xl bg-gradient-to-b from-[#ffea8a] via-[#f7d356] to-[#ecb828] border-2 border-[#e6a817] shadow-xl shadow-amber-500/25 flex flex-col items-center justify-center p-2 relative overflow-hidden transition-all duration-500"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/70" />
                      <Trophy className="w-5 h-5 text-amber-950 mb-0.5" />
                      <span className="text-3xl font-black text-amber-950">#1</span>
                      <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest mt-0.5">TOP PERFORMER</span>
                    </div>
                  </>
                )}
              </div>

              {/* Rank #3: Bronze (Appears only if 3rd specialist has completed >= 1 task) */}
              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                {stats.third ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f6d7be] to-[#fae9db] dark:from-amber-950/60 dark:to-slate-800 border-2 border-amber-300/60 dark:border-amber-700/60 shadow-sm flex items-center justify-center font-black text-amber-900 dark:text-amber-200 text-sm">
                      {stats.third.initials}
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2 block text-center truncate max-w-[95px]">
                      {stats.third.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                      {stats.third.count} {stats.third.count === 1 ? "Completed" : "Completed"}
                    </span>

                    <div
                      style={{
                        height: `${Math.max(54, Math.round((stats.third.count / stats.maxCompleted) * 90))}px`,
                      }}
                      className="w-full rounded-xl bg-gradient-to-b from-[#fcd3b6] to-[#e4a780] dark:from-amber-950 dark:to-slate-900 border border-amber-600/40 dark:border-amber-700 shadow-md flex flex-col items-center justify-center p-2 transition-all duration-500"
                    >
                      <span className="text-2xl font-black text-amber-950 dark:text-amber-400">#3</span>
                      <span className="text-[9px] font-black text-amber-950/80 dark:text-amber-400 uppercase tracking-widest mt-0.5">BRONZE</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                      —
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1 mb-2">Awaiting 3rd</span>
                    <div className="w-full h-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400">#3</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* === CARD 2: 3 STACKED METRIC CARDS (CENTER) - 3.5 Cols === */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          
          {/* Tile 1: Accounting & Tax Department */}
          <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    ACCOUNTING &amp; CA DEPT
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {stats.accountingDeptCount} Specialists
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 2: Total Active Personnel */}
          <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    TOTAL TEAM SPECIALISTS
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {stats.total} Active Staff
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 3: Active Caseload In-Flight */}
          <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  ACTIVE CASELOAD IN-FLIGHT
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {stats.inFlightCases} Cases
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live Queue
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* === CARD 3: TEAM UTILIZATION GAUGE (RIGHT) - 4 Cols === */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/20" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Team Utilization
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {stats.avgUtilization}% Avg
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-600 dark:text-indigo-400" strokeDasharray={`${stats.avgUtilization}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">{stats.avgUtilization}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">LOAD</span>
              </div>
            </div>

            <div className="space-y-2 flex-1 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Operations</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.opsCount} staff</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Legal &amp; MCA</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.legalCount} staff</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Accounting &amp; Tax</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.accCount} staff</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 font-medium">
            Total active roster: <span className="font-black text-slate-900 dark:text-white">{stats.total} Specialists</span>
          </div>
        </div>

      </div>

      {/* 4 BOTTOM METRIC COUNTER TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Total Specialists</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Operations Dept</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.opsCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Legal Dept</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.legalCount}</div>
        </div>
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Avg Utilization</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.avgUtilization}%</div>
        </div>
      </div>
    </div>
  );
}
