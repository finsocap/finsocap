"use client";

import { useMemo, useState, useRef } from "react";
import {
  Sparkles,
  User,
  Layers,
  Activity,
  Shield,
  ArrowRight,
  Cpu,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Users,
  ChevronDown
} from "lucide-react";
import { WorkloadMetrics, SpecialistWorkload, BalancingRecommendation } from "@/types/api";

interface AllocationInfographicProps {
  workload?: WorkloadMetrics | null;
  recommendations?: BalancingRecommendation[];
  onApplyRecommendation?: (id: string) => void;
  isApplying?: boolean;
  tasks?: any[];
  users?: any[];
}

export default function AllocationInfographic({
  workload,
  recommendations = [],
  onApplyRecommendation,
  isApplying = false,
}: AllocationInfographicProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rawSpecialistsList: SpecialistWorkload[] = useMemo(() => {
    return workload?.specialists || [];
  }, [workload]);

  const activeRec: BalancingRecommendation | null = useMemo(() => {
    return recommendations && recommendations.length > 0 ? recommendations[0] : null;
  }, [recommendations]);

  const cardThemes = [
    {
      icon: User,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-100 dark:border-blue-900/60",
      arcColor: "#2563eb",
    },
    {
      icon: Layers,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60",
      arcColor: "#10b981",
    },
    {
      icon: Activity,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-100 dark:border-purple-900/60",
      arcColor: "#8b5cf6",
    },
    {
      icon: Shield,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60",
      arcColor: "#f59e0b",
    },
  ];

  // Filter specialists by search and status
  const filteredSpecialists = useMemo(() => {
    return rawSpecialistsList.filter((spec) => {
      const matchesSearch =
        spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (spec.role && spec.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (spec.employeeCode && spec.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && spec.activeTasks > 0) ||
        (statusFilter === "AVAILABLE" && spec.activeTasks === 0) ||
        (statusFilter === spec.loadStatus);

      return matchesSearch && matchesStatus;
    });
  }, [rawSpecialistsList, searchTerm, statusFilter]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Header Toolbar for Team Capacity */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 px-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Team Count */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Team Capacity &amp; Workload
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-sky-300">
                {rawSpecialistsList.length} Members
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Real-time quota tracking and queue load per specialist
            </p>
          </div>
        </div>

        {/* Right: Search, Filter, View Mode & Carousel Nav */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search member / role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Quick Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All ({rawSpecialistsList.length})</option>
            <option value="ACTIVE">Has Tasks ({rawSpecialistsList.filter(s => s.activeTasks > 0).length})</option>
            <option value="AVAILABLE">Available ({rawSpecialistsList.filter(s => s.activeTasks === 0).length})</option>
          </select>

          {/* Grid vs Carousel Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            title={isExpanded ? "Collapse to Carousel" : "Expand to Grid"}
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span>{isExpanded ? "Carousel" : "Show All"}</span>
          </button>

          {/* Carousel Arrows (only visible when not expanded) */}
          {!isExpanded && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Dynamic Specialist Capacity Cards */}
      {filteredSpecialists.length === 0 ? (
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 text-center text-slate-400 text-xs">
          No specialists found matching criteria.
        </div>
      ) : isExpanded ? (
        /* Full Expanded Multi-Row Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredSpecialists.map((spec, idx) => (
            <SpecialistCard key={spec.id || spec.employeeCode || idx} spec={spec} idx={idx} cardThemes={cardThemes} />
          ))}
        </div>
      ) : (
        /* Compact Clean Horizontal Scroll / Carousel View (Max 1 tidy row, smooth scroll) */
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scroll-smooth"
        >
          {filteredSpecialists.map((spec, idx) => (
            <div key={spec.id || spec.employeeCode || idx} className="w-[280px] shrink-0">
              <SpecialistCard spec={spec} idx={idx} cardThemes={cardThemes} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecialistCard({
  spec,
  idx,
  cardThemes,
}: {
  spec: SpecialistWorkload;
  idx: number;
  cardThemes: any[];
}) {
  const theme = cardThemes[idx % cardThemes.length];
  const pct = Math.round(
    spec.utilizationPercentage ||
      (spec.maxCapacity > 0 ? (spec.activeTasks / spec.maxCapacity) * 100 : 0)
  );
  const strokeDash = `${pct}, 100`;

  // Status badge styling
  const isOptimal = pct >= 50 && pct <= 85;
  const isOverloaded = pct > 85;
  const isUnder = pct < 50;

  const statusLabel = spec.loadStatus || (isOverloaded ? "OVERLOADED" : isOptimal ? "OPTIMAL" : "AVAILABLE");
  const badgeColor = isOverloaded
    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60"
    : isOptimal
    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60"
    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-xs flex items-center justify-between transition-all hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-900 h-full">
      {/* Left Identity */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg}`}>
          <theme.icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {spec.role || "Specialist"} • {spec.employeeCode ? spec.employeeCode.slice(0, 7) : `ID-${spec.id}`}
          </span>
          <h4 className="text-xs font-black text-slate-900 dark:text-white block mt-0.5 truncate">
            {spec.name}
          </h4>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            <strong className="text-slate-900 dark:text-white">{spec.activeTasks}</strong> / {spec.maxCapacity} tasks
          </p>
        </div>
      </div>

      {/* Right Radial Dial */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor}`}>
          {statusLabel}
        </span>

        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              stroke={theme.arcColor}
              strokeDasharray={strokeDash}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-black text-slate-800 dark:text-slate-200">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
