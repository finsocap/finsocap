"use client";

import { useState, useMemo } from "react";
import {
  Users,
  ChevronDown,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Award,
  Layers,
  Store,
  Compass,
  CheckCircle2,
  BarChart2
} from "lucide-react";

interface ServiceSlice {
  id: string;
  name: string;
  leads: number;
  percentage: number;
  color: string;
  iconBg: string;
  barColor: string;
  icon: any;
  letter?: string;
  pointerAngle: number; // In degrees for callout leader lines
  calloutPos: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "middle-left";
  leadsLabel: string;
}

interface ServiceDistributionDonutProps {
  selectedBranch?: string;
}

export default function ServiceDistributionDonut({
  selectedBranch = "All Partners",
}: ServiceDistributionDonutProps) {
  const [partnerFilter, setPartnerFilter] = useState(selectedBranch || "All Partners");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);

  // Slices configured 100% to match the screenshot:
  // Top right emerald: FSSAI (231, 24%)
  // Right amber: GST (174, 18%)
  // Bottom purple: Trademark (116, 12%)
  // Bottom-left cyan: ITR (96, 10%)
  // Middle-left rose: Shop Act (77, 8%)
  // Top-left blue: Other Services (270, 28%)
  const slices: ServiceSlice[] = useMemo(() => {
    return [
      {
        id: "fssai",
        name: "FSSAI Registration",
        leads: 231,
        percentage: 24,
        color: "#10b981", // Vibrant Emerald/Green
        iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60",
        barColor: "bg-blue-500",
        icon: FileText,
        pointerAngle: 45,
        calloutPos: "top-right",
        leadsLabel: "231",
      },
      {
        id: "gst",
        name: "GST Registration",
        leads: 174,
        percentage: 18,
        color: "#f59e0b", // Warm Amber/Orange
        iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60",
        barColor: "bg-emerald-500",
        icon: ShieldCheck,
        pointerAngle: 345,
        calloutPos: "bottom-right",
        leadsLabel: "174",
      },
      {
        id: "tm",
        name: "Trademark",
        leads: 116,
        percentage: 12,
        color: "#a855f7", // Purple/Violet
        iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 font-black",
        barColor: "bg-amber-500",
        icon: null,
        letter: "R",
        pointerAngle: 285,
        calloutPos: "bottom-right",
        leadsLabel: "116",
      },
      {
        id: "itr",
        name: "ITR Filing",
        leads: 96,
        percentage: 10,
        color: "#06b6d4", // Electric Cyan
        iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60",
        barColor: "bg-purple-500",
        icon: Award,
        pointerAngle: 225,
        calloutPos: "bottom-left",
        leadsLabel: "96",
      },
      {
        id: "trade",
        name: "Shop Act / Trade License",
        leads: 77,
        percentage: 8,
        color: "#f43f5e", // Rose Pink
        iconBg: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60",
        barColor: "bg-rose-500",
        icon: Store,
        pointerAngle: 185,
        calloutPos: "middle-left",
        leadsLabel: "77",
      },
      {
        id: "other",
        name: "Other Services",
        leads: 270,
        percentage: 28,
        color: "#2563eb", // Vibrant Blue
        iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60",
        barColor: "bg-cyan-500",
        icon: Compass,
        pointerAngle: 135,
        calloutPos: "top-left",
        leadsLabel: "270",
      },
    ];
  }, []);

  const totalLeads = 964;

  // Donut geometry for SVG
  const radius = 68;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius; // ~427.25

  let accumulatedPercent = 0;
  const renderedSlices = slices.map((slice) => {
    // Gap subtraction for elegant segmented donut look
    const sliceLength = (slice.percentage / 100) * circumference - 4;
    const strokeDasharray = `${Math.max(sliceLength, 0)} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += slice.percentage;

    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = useMemo(() => {
    return slices.find((s) => s.id === hoveredId) || null;
  }, [slices, hoveredId]);

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm h-full flex flex-col justify-between relative overflow-hidden transition-all">
      
      {/* 1. Header Bar: Service-wise Distribution with Title + Dropdown & 3-Dots */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-tight">
              TASK DISTRIBUTION
            </span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
              Service-wise Distribution
            </h2>
          </div>
        </div>

        {/* Right Partner Filter Dropdown & Menu Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <Users className="w-3 h-3 text-blue-600 dark:text-sky-400" />
              <span className="truncate max-w-[80px]">{partnerFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPartnerDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPartnerDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1 text-[11px] font-semibold animate-in fade-in zoom-in-95">
                  {["All Partners", "Delhi Hub", "Mumbai Branch", "Noida Center", "Bengaluru Tech Hub"].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPartnerFilter(p);
                        setIsPartnerDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                        partnerFilter === p
                          ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Clean, Premium Donut Chart with Dynamic Hover Readout */}
      <div className="relative flex items-center justify-center my-auto py-1">
        
        {/* Donut Container */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
          
          {/* Subtle Ambient Glow Behind Donut */}
          <div 
            className="absolute inset-4 rounded-full blur-xl opacity-20 transition-all duration-500 pointer-events-none"
            style={{ 
              backgroundColor: activeSlice ? activeSlice.color : "#3b82f6" 
            }}
          />

          {/* SVG Segmented Donut */}
          <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90 overflow-visible relative z-10">
            {renderedSlices.map((slice) => {
              const isHovered = hoveredId === slice.id;
              return (
                <circle
                  key={slice.id}
                  r={radius}
                  cx="90"
                  cy="90"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 6px ${slice.color}80)` : "none",
                  }}
                  onMouseEnter={() => setHoveredId(slice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}
          </svg>

          {/* Dynamic Center Readout (Shows active hovered slice OR total) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none z-20">
            {activeSlice ? (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[110px] block px-1">
                  {activeSlice.name}
                </span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none mt-0.5 block" style={{ color: activeSlice.color }}>
                  {activeSlice.leads}
                </span>
                <div className="inline-flex items-center gap-0.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black border"
                  style={{
                    backgroundColor: `${activeSlice.color}15`,
                    color: activeSlice.color,
                    borderColor: `${activeSlice.color}30`
                  }}
                >
                  <span>{activeSlice.percentage}% of leads</span>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                  TOTAL LEADS
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-0.5 block">
                  {totalLeads}
                </span>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>+12%</span>
                </div>
                <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
                  vs. last period
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. Sleek 2-Column Legend with Micro-Progress Indicator */}
      <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        {slices.map((slice) => {
          const isHovered = hoveredId === slice.id;
          return (
            <div
              key={slice.id}
              onMouseEnter={() => setHoveredId(slice.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex items-center justify-between py-1 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
                isHovered 
                  ? "bg-slate-100/90 dark:bg-slate-800 shadow-2xs scale-[1.02]" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                  style={{ 
                    backgroundColor: slice.color,
                    transform: isHovered ? "scale(1.3)" : "scale(1)"
                  }}
                />
                <span className={`text-[10.5px] truncate font-semibold transition-colors ${
                  isHovered 
                    ? "text-slate-900 dark:text-white font-bold" 
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                  {slice.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1.5">
                <span className="text-[9.5px] text-slate-400 font-medium">({slice.leads})</span>
                <span 
                  className="font-black text-[11px]" 
                  style={{ color: slice.color }}
                >
                  {slice.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
