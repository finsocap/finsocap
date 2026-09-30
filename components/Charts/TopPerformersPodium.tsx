"use client";

import { useState } from "react";
import { MessageSquare, PhoneCall, CheckSquare, Clock, ArrowRight, Award } from "lucide-react";

interface Performer {
  rank: number;
  name: string;
  amount: string;
  role: string;
  avatarColor: string;
  initials: string;
  heightClass: string;
  podiumLabel: string;
}

const performers: Performer[] = [
  {
    rank: 2,
    name: "Kanhaiya",
    amount: "₹1.32L",
    role: "Senior Consultant",
    avatarColor: "bg-indigo-600 text-white",
    initials: "K",
    heightClass: "h-24",
    podiumLabel: "#2",
  },
  {
    rank: 1,
    name: "Rahul Jha",
    amount: "₹2.05L",
    role: "Top Advisor",
    avatarColor: "bg-blue-600 text-white",
    initials: "RJ",
    heightClass: "h-32",
    podiumLabel: "#1",
  },
  {
    rank: 3,
    name: "Gaurav",
    amount: "₹92.8K",
    role: "Executive",
    avatarColor: "bg-emerald-600 text-white",
    initials: "GS",
    heightClass: "h-16",
    podiumLabel: "#3",
  },
];

export default function TopPerformersPodium() {
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between h-full space-y-6">
      
      {/* 1. Header & Quick To-Do Counters matching Screenshot */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
              Action Items & To-Dos
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">List of immediate priorities</p>
          </div>
        </div>

        {/* 2 Quick Mini Badges */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
            <div>
              <p className="text-[10px] font-bold text-slate-400">New Inquiries</p>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">3 pending</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
            <div>
              <p className="text-[10px] font-bold text-slate-400">Follow-ups</p>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">4 today</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 3 This Month Podium */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-4">
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Top 3 This Month
          </span>
          <span className="text-[10px] font-bold text-slate-400">By Amount Collected</span>
        </div>

        {/* 3D Cylindrical Podiums Row matching Screenshot */}
        <div className="grid grid-cols-3 gap-2 items-end pt-4 select-none">
          {performers.map((p) => {
            const isHovered = hoveredRank === p.rank;
            return (
              <div
                key={p.rank}
                onMouseEnter={() => setHoveredRank(p.rank)}
                onMouseLeave={() => setHoveredRank(null)}
                className="flex flex-col items-center group cursor-pointer transition-all duration-200"
              >
                {/* Avatar with Ring */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-transform duration-200 ${
                  isHovered ? "scale-110" : ""
                } ${p.avatarColor}`}>
                  {p.initials}
                </div>

                {/* Name & Amount */}
                <p className="text-[11px] font-black text-slate-900 dark:text-white mt-1.5 truncate max-w-[70px]">
                  {p.name}
                </p>
                <p className="text-[10px] font-bold text-blue-600 dark:text-sky-400">
                  {p.amount}
                </p>

                {/* 3D Cylinder Podium Block */}
                <div
                  className={`w-full mt-2 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                    p.heightClass
                  } ${
                    p.rank === 1
                      ? "bg-gradient-to-b from-blue-50 to-indigo-100/60 dark:from-slate-800 dark:to-blue-950/60 border-blue-200 dark:border-blue-800 shadow-md"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs"
                  }`}
                >
                  <span className={`font-mono text-sm font-black ${
                    p.rank === 1 ? "text-blue-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
                  }`}>
                    {p.podiumLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
