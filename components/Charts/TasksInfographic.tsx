"use client";

import { useMemo } from "react";
import { 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  ClipboardList, 
  RotateCw, 
  HelpCircle, 
  ShieldCheck, 
  Shield, 
  Zap 
} from "lucide-react";
import { TaskMetrics, BackendTask } from "@/types/api";

interface TasksInfographicProps {
  metrics?: TaskMetrics | null;
  tasks?: BackendTask[] | any[];
}

export default function TasksInfographic({ metrics, tasks = [] }: TasksInfographicProps) {
  const stats = useMemo(() => {
    const list = tasks || [];
    const total = metrics?.totalTasks ?? list.length;
    const pending = metrics?.pendingReview ?? list.filter((t) => {
      const s = (t.status || "").toUpperCase();
      return s === "PENDING" || s === "PENDING_REVIEW";
    }).length;

    const inProgress = metrics?.inProgress ?? list.filter((t) => {
      const s = (t.status || "").toUpperCase();
      return s === "IN_PROGRESS";
    }).length;

    const queryRaised = metrics?.queryRaised ?? list.filter((t) => {
      const s = (t.status || "").toUpperCase();
      return s === "PENDING_FROM_CLIENT" || s.includes("QUERY");
    }).length;

    const completed = metrics?.completed ?? list.filter((t) => {
      const s = (t.status || "").toUpperCase();
      return s === "COMPLETED";
    }).length;

    const overdue = list.filter((t) => {
      if (t.dueDate && (t.status || "").toUpperCase() !== "COMPLETED") {
        const d = new Date(t.dueDate);
        return !isNaN(d.getTime()) && d < new Date();
      }
      return false;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onTimeRate = total > 0 ? Math.max(0, Math.round(((total - overdue) / total) * 100)) : 100;

    return { total, pending, inProgress, queryRaised, completed, overdue, completionRate, onTimeRate };
  }, [metrics, tasks]);

  const stages = [
    { 
      label: "Pending", 
      count: stats.pending, 
      color: "from-rose-500 to-pink-500", 
      barColor: "bg-rose-500",
      dotColor: "bg-rose-500",
      border: "border-rose-100 dark:border-rose-900/40", 
      bg: "bg-rose-50/40 dark:bg-rose-950/20",
      icon: ClipboardList,
      iconBg: "bg-rose-100/80 text-rose-500 dark:bg-rose-900/40 dark:text-rose-400"
    },
    { 
      label: "In Progress", 
      count: stats.inProgress, 
      color: "from-blue-500 to-indigo-500", 
      barColor: "bg-blue-500",
      dotColor: "bg-blue-600",
      border: "border-blue-100 dark:border-blue-900/40", 
      bg: "bg-blue-50/40 dark:bg-blue-950/20",
      icon: RotateCw,
      iconBg: "bg-blue-100/80 text-blue-600 dark:bg-blue-900/40 dark:text-sky-400"
    },
    { 
      label: "Query Raised", 
      count: stats.queryRaised, 
      color: "from-amber-500 to-orange-500", 
      barColor: "bg-amber-500",
      dotColor: "bg-amber-500",
      border: "border-amber-100 dark:border-amber-900/40", 
      bg: "bg-amber-50/40 dark:bg-amber-950/20",
      icon: HelpCircle,
      iconBg: "bg-amber-100/80 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
    },
    { 
      label: "Completed", 
      count: stats.completed, 
      color: "from-emerald-500 to-teal-500", 
      barColor: "bg-emerald-500",
      dotColor: "bg-emerald-500",
      border: "border-emerald-100 dark:border-emerald-900/40", 
      bg: "bg-emerald-50/40 dark:bg-emerald-950/20",
      icon: CheckCircle2,
      iconBg: "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Top Header matching 2nd screenshot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              TASK EXECUTION PIPELINE VELOCITY
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Real-time progression through CA fulfillment lifecycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
            <span>{stats.onTimeRate}% SLA On-Time</span>
          </span>
        </div>
      </div>

      {/* 4 Pipeline Stages with Connectors */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const progressPercent = stats.total > 0 ? Math.min(100, Math.round((st.count / stats.total) * 100)) : 0;

          return (
            <div key={st.label} className="flex-1 flex items-center gap-2 sm:gap-2.5">
              <div className={`flex-1 p-3.5 rounded-2xl ${st.bg} border ${st.border} flex flex-col justify-between transition-all hover:shadow-xs`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${st.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Stage 0{idx + 1}
                    </span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                </div>

                <div className="my-2.5 pl-0.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {st.count}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">
                    {st.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${st.barColor} transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Chevron Arrow Connector between stages */}
              {idx < stages.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Row: 3 Modern Metric Cards matching 2nd screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        
        {/* Card 1: SLA Safety Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">SLA Safety Score</span>
              <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.onTimeRate}%
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {stats.overdue} overdue filings
              </p>
            </div>
          </div>

          {/* Circular Percentage Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${stats.onTimeRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-black text-[11px] text-slate-900 dark:text-white">
              {stats.onTimeRate}%
            </span>
          </div>
        </div>

        {/* Card 2: Completion Velocity */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Completion Velocity</span>
              <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.completionRate}%
              </div>
              <p className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold mt-0.5">
                {stats.completed} of {stats.total} tasks fulfilled
              </p>
            </div>
          </div>

          {/* Circular Percentage Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                strokeDasharray={`${stats.completionRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-black text-[11px] text-blue-600 dark:text-sky-400">
              {stats.completionRate}%
            </span>
          </div>
        </div>

        {/* Card 3: Active Workload */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Active Workload</span>
              <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.inProgress + stats.pending} Active
              </div>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                Across fulfillment hubs
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-black text-base flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
            {stats.inProgress + stats.pending}
          </div>
        </div>

      </div>

    </div>
  );
}
