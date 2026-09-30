"use client";

import { useState } from "react";
import { Settings, Sparkles } from "lucide-react";

interface Segment {
  id: string;
  name: string;
  percentage: number;
  count: number;
  color: string;
}

const segments: Segment[] = [
  { id: "fssai", name: "FSSAI & Food Licenses", percentage: 48, count: 462, color: "#3b82f6" },
  { id: "gst", name: "GST & Tax Registrations", percentage: 26, count: 250, color: "#10b981" },
  { id: "ipr", name: "Trademark & Intellectual", percentage: 16, count: 154, color: "#f59e0b" },
  { id: "other", name: "Business Compliances", percentage: 10, count: 98, color: "#64748b" },
];

export default function MinimalDonutInfographic() {
  const [hovered, setHovered] = useState<Segment | null>(null);

  const radius = 68;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~427.25

  let accumulated = 0;
  const arcs = segments.map((seg) => {
    // Gap of 8px between segments for the clean floating floating segmented look
    const arcLength = (seg.percentage / 100) * circumference - 12;
    const strokeDasharray = `${arcLength} ${circumference}`;
    const strokeDashoffset = -((accumulated / 100) * circumference);
    accumulated += seg.percentage;
    return { ...seg, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between h-full">
      {/* Header matching Screenshot */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Intake Distribution
          </span>
          <span className="ml-2 text-xs font-black text-blue-600 dark:text-sky-400">
            21% unqualified
          </span>
        </div>
        <button
          className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Distribution Options"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Segmented Ring */}
      <div className="relative flex items-center justify-center py-6 select-none my-auto">
        <svg viewBox="0 0 180 180" className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90 overflow-visible">
          {/* Faint Background Full Track */}
          <circle
            r={radius}
            cx="90"
            cy="90"
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />

          {/* Segmented Floating Arcs */}
          {arcs.map((arc) => {
            const isHovered = hovered?.id === arc.id;
            return (
              <circle
                key={arc.id}
                r={radius}
                cx="90"
                cy="90"
                fill="transparent"
                stroke={arc.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${arc.color})` : undefined,
                }}
                onMouseEnter={() => setHovered(arc)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>

        {/* Center Readout matching Reference Screenshot */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hovered ? (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {hovered.name}
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {hovered.percentage}%
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 block mt-0.5">
                {hovered.count} Cases
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total number
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                964
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mini clean legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        {segments.map((seg) => (
          <div
            key={seg.id}
            onMouseEnter={() => setHovered(seg)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-600 dark:text-slate-400 truncate">{seg.name}</span>
            <span className="font-bold text-slate-900 dark:text-white ml-auto">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
