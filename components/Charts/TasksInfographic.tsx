"use client";

import { useMemo } from "react";
import { 
  ClipboardList, CheckCircle2, Clock, AlertTriangle, 
  ArrowRight, ShieldCheck, Flame, UserCheck 
} from "lucide-react";
import { TaskModel } from "@/lib/crmStore";

export default function TasksInfographic({ tasks }: { tasks: TaskModel[] }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const review = tasks.filter((t) => t.status === "Sent for Review").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const overdue = tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onTimeRate = total > 0 ? Math.round(((total - overdue) / (total || 1)) * 100) : 100;

    return { total, pending, inProgress, review, completed, overdue, completionRate, onTimeRate };
  }, [tasks]);

  const stages = [
    { label: "Pending", count: stats.pending, color: "from-rose-500 to-pink-500", border: "border-rose-200 dark:border-rose-900/50" },
    { label: "In Progress", count: stats.inProgress, color: "from-sky-500 to-blue-600", border: "border-sky-200 dark:border-sky-900/50" },
    { label: "Under Review", count: stats.review, color: "from-amber-500 to-orange-500", border: "border-amber-200 dark:border-amber-900/50" },
    { label: "Completed", count: stats.completed, color: "from-emerald-500 to-teal-500", border: "border-emerald-200 dark:border-emerald-900/50" },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      
      {/* Top Row: Pipeline Stage Funnel Ribbon */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Task Execution Pipeline Velocity
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Real-time progression through CA fulfillment lifecycle
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              {stats.onTimeRate}% SLA On-Time
            </span>
          </div>
        </div>

        {/* 4 Pipeline Ribbon Boxes with connecting arrows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stages.map((st, idx) => (
            <div
              key={st.label}
              className={`relative p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border ${st.border} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Stage 0{idx + 1}
                </span>
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${st.color}`} />
              </div>

              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {st.count}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1.5">
                  {st.label}
                </span>
              </div>

              {/* Progress mini indicator */}
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${st.color} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(12, (st.count / (stats.total || 1)) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: SLA Compliance Radar & Weekly Throughput Sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 items-center">
        
        {/* On-Time Adherence Dial */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">SLA Safety Score</span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.onTimeRate}%
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {stats.overdue} overdue filings
            </p>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path className="text-slate-200 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500" strokeDasharray={`${stats.onTimeRate}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <ShieldCheck className="w-4 h-4 text-emerald-500 absolute" />
          </div>
        </div>

        {/* Turnaround Velocity */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Average Resolution</span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              2.4 Days
            </div>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
              +18% faster than benchmark
            </p>
          </div>
          <div className="flex items-end gap-1 h-8 w-16">
            {[30, 50, 40, 70, 60, 85, 95, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Closed Pipeline</span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.completed} Done
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Out of {stats.total} total cases
            </p>
          </div>
          <div className="flex items-end gap-1 h-8 w-16">
            {[45, 65, 55, 75, 70, 90, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/70 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
