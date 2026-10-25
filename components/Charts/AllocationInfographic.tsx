"use client";

import { useMemo } from "react";
import {
  Sparkles,
  User,
  Layers,
  Activity,
  Shield,
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { TaskModel, UserModel } from "@/lib/crmStore";

export default function AllocationInfographic({ tasks, users }: { tasks: TaskModel[]; users: UserModel[] }) {
  const staffCards = useMemo(() => {
    return [
      {
        id: "1",
        badge: "EXECUTIVE",
        name: "Ankit Kumar",
        assigned: 3,
        max: 15,
        pct: 20,
        icon: User,
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-100 dark:border-blue-900/60",
        arcColor: "#2563eb",
      },
      {
        id: "2",
        badge: "Team Member",
        name: "Pooja Mehta",
        assigned: 2,
        max: 15,
        pct: 13,
        icon: Layers,
        iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60",
        arcColor: "#10b981",
      },
      {
        id: "3",
        badge: "Support",
        name: "Rohit Jain",
        assigned: 1,
        max: 15,
        pct: 7,
        icon: Activity,
        iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-100 dark:border-purple-900/60",
        arcColor: "#8b5cf6",
      },
      {
        id: "4",
        badge: "Legal",
        name: "Neha Verma",
        assigned: 1,
        max: 15,
        pct: 7,
        icon: Shield,
        iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60",
        arcColor: "#f59e0b",
      },
    ];
  }, [tasks, users]);

  return (
    <div className="space-y-4">
      {/* 1. 4 Individual Capacity Team Cards matching user screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffCards.map((card) => {
          const strokeDash = `${card.pct}, 100`;

          return (
            <div
              key={card.id}
              className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs flex items-center justify-between transition-all hover:shadow-sm"
            >
              {/* Left Identity */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {card.badge}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                    {card.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    <strong className="text-slate-900 dark:text-white">{card.assigned}</strong> / {card.max} tasks
                  </p>
                </div>
              </div>

              {/* Right Radial Dial & 3-Dots */}
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-300 p-0.5 transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <div className="relative w-12 h-12 flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      stroke={card.arcColor}
                      strokeDasharray={strokeDash}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-slate-800 dark:text-slate-200">
                    {card.pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Smart Balancing Recommendation Pill Bar */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:px-4 sm:py-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-black text-slate-900 dark:text-white tracking-tight">
            Smart Balancing Recommendation
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Shift 3 unallocated FSSAI cases to Neha Verma (45% load) to prevent bottlenecks.
          </span>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="self-start md:self-auto px-4 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>Apply Suggestion</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
