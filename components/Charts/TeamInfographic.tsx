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
  CheckCircle,
  Hourglass,
  BarChart3,
  Award
} from "lucide-react";
import { UserModel, TaskModel } from "@/lib/crmStore";

export default function TeamInfographic({ users, tasks }: { users: UserModel[]; tasks: TaskModel[] }) {
  const stats = useMemo(() => {
    const total = users.length || 14;
    const active = users.filter((u) => u.status === "Active").length;
    const utilization = 84;

    return { total, active, utilization };
  }, [users, tasks]);

  return (
    <div className="space-y-4">
      {/* MAIN 3-CARD GRID: PODIUM (Col 1) | 3 METRIC TILES (Col 2) | UTILIZATION (Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* === CARD 1: TOP CLOSERS THIS MONTH (PODIUM) - 5 Cols === */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          {/* Card Title & Subtitle */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-amber-500 stroke-[2.2]" />
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Top Closers This Month
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Based on total cases closed
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              +14% MoM
            </span>
          </div>

          {/* 3D Olympic Podium Pedestals */}
          <div className="flex items-end justify-center gap-3 sm:gap-4 pt-10 pb-1">
            
            {/* Rank #2: Silver (Kanhaiya) */}
            <div className="flex flex-col items-center flex-1 max-w-[110px]">
              {/* Avatar circle */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-200 via-blue-50 to-white dark:from-slate-700 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-sm">
                K
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2 block text-center truncate max-w-[95px]">
                Kanhaiya
              </span>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                39 Cases
              </span>

              {/* 3D Silver Pedestal Block */}
              <div className="w-full h-24 sm:h-26 rounded-xl bg-gradient-to-b from-[#e8eef8] to-[#dbe4f3] dark:from-slate-800 dark:to-slate-900 border border-slate-300/80 dark:border-slate-700 shadow-md flex flex-col items-center justify-center p-2">
                <span className="text-2xl font-black text-slate-600 dark:text-slate-300">#2</span>
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">SILVER</span>
                {/* Silver Ribbon / Badge icon */}
                <div className="w-5 h-5 rounded-full border border-slate-400/80 flex items-center justify-center mt-1.5 opacity-60">
                  <span className="text-[8px] font-bold text-slate-500">🎗</span>
                </div>
              </div>
            </div>

            {/* Rank #1: Gold CA (Rahul Jha) - Center & Tallest */}
            <div className="flex flex-col items-center flex-1 max-w-[130px]">
              <div className="relative flex flex-col items-center">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-400 drop-shadow-sm mb-1" />
                {/* Gold Avatar Circle */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-100 border-2 border-amber-300 shadow-md shadow-amber-500/20 flex items-center justify-center font-black text-amber-950 text-base">
                  RJ
                </div>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-1.5 block text-center truncate max-w-[110px]">
                Rahul Jha
              </span>
              <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/60 px-2 py-0.5 rounded-full mt-0.5 mb-2 border border-amber-300/40">
                48 Cases
              </span>

              {/* 3D Gold Pedestal Block */}
              <div className="w-full h-34 sm:h-38 rounded-xl bg-gradient-to-b from-[#ffea8a] via-[#f7d356] to-[#ecb828] border-2 border-[#e6a817] shadow-xl shadow-amber-500/25 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-white/70" />
                <Trophy className="w-5 h-5 text-amber-950 mb-0.5" />
                <span className="text-3xl font-black text-amber-950">#1</span>
                <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest mt-0.5">GOLD CA</span>
              </div>
            </div>

            {/* Rank #3: Bronze (Gaurav Sharma) */}
            <div className="flex flex-col items-center flex-1 max-w-[110px]">
              {/* Bronze Avatar Circle */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f6d7be] to-[#fae9db] dark:from-amber-950/60 dark:to-slate-800 border-2 border-amber-300/60 dark:border-amber-700/60 shadow-sm flex items-center justify-center font-black text-amber-900 dark:text-amber-200 text-sm">
                GS
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2 block text-center truncate max-w-[95px]">
                Gaurav Sharma
              </span>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                31 Cases
              </span>

              {/* 3D Bronze Pedestal Block */}
              <div className="w-full h-20 sm:h-22 rounded-xl bg-gradient-to-b from-[#fcd3b6] to-[#e4a780] dark:from-amber-950 dark:to-slate-900 border border-amber-600/40 dark:border-amber-700 shadow-md flex flex-col items-center justify-center p-2">
                <span className="text-2xl font-black text-amber-950 dark:text-amber-400">#3</span>
                <span className="text-[9px] font-black text-amber-950/80 dark:text-amber-400 uppercase tracking-widest mt-0.5">BRONZE</span>
                <div className="w-5 h-5 rounded-full border border-amber-700/60 flex items-center justify-center mt-1 opacity-70">
                  <span className="text-[8px] font-bold text-amber-800">🎗</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* === CARD 2: 3 STACKED METRIC CARDS (CENTER) - 3.5 Cols === */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          
          {/* Tile 1: Avg. Resolution Speed */}
          <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    AVG. RESOLUTION SPEED
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      2.4 hrs
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md border border-emerald-500/20">
                      <TrendingUp className="w-2.5 h-2.5" />
                      +18%
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Sparkline Graphic (Blue Wave) */}
            <div className="mt-2 pt-1 flex justify-end">
              <svg viewBox="0 0 100 24" className="w-24 h-6 overflow-visible text-blue-500" fill="none">
                <path
                  d="M0 18 Q 20 22, 35 14 T 70 10 T 100 4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Tile 2: First-Time Right SLA */}
          <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    FIRST-TIME RIGHT SLA
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      99.1%
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md border border-emerald-500/20">
                      <TrendingUp className="w-2.5 h-2.5" />
                      +4.2%
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Sparkline Graphic (Emerald Wave) */}
            <div className="mt-2 pt-1 flex justify-end">
              <svg viewBox="0 0 100 24" className="w-24 h-6 overflow-visible text-emerald-500" fill="none">
                <path
                  d="M0 16 Q 25 18, 45 12 T 75 8 T 100 3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Tile 3: Active Caseload In-Flight */}
          <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  ACTIVE CASELOAD IN-FLIGHT
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    84 Cases
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live Queue
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

        </div>

        {/* === CARD 3: TEAM UTILIZATION GAUGE (RIGHT) - 3.5 Cols === */}
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
              Optimal Load
            </span>
          </div>

          {/* Radial Ring + Department breakdown */}
          <div className="flex items-center gap-4 py-2">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray="84, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="url(#gradient-team-circle)"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <defs>
                  <linearGradient id="gradient-team-circle" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  84%
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest -mt-0.5">
                  CAPACITY
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                14 Certified Professionals
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                4 CAs • 3 CS • 4 Legal • 3 Ops Execs
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Zero queue bottlenecks
                </span>
              </div>
            </div>
          </div>

          {/* Department Workload Bar */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Department Workload</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold">118 / 140 hrs booked</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full"
                style={{ width: "84%" }}
              />
            </div>
            <div className="flex justify-end">
              <span className="text-[10px] font-black text-slate-400">84%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM 4 COMPACT STAT TILES (Exactly matching the design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        
        {/* Stat 1: Total Specialists */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">Total Specialists</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">6</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">All team members are operational</p>
          </div>
        </div>

        {/* Stat 2: Cases Closed */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">Cases Closed</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">163</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">vs. last month</p>
          </div>
        </div>

        {/* Stat 3: Avg. Resolution Time */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Hourglass className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">Avg. Resolution Time</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">2.4 hrs</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" />
                +18%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Faster than last month</p>
          </div>
        </div>

        {/* Stat 4: Team Capacity */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">Team Capacity</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">84%</span>
              <span className="inline-flex items-center text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/20">
                Optimal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">118 / 140 hrs booked</p>
          </div>
        </div>

      </div>
    </div>
  );
}
