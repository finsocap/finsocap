"use client";

import { useState, useMemo } from "react";

interface CategorySlice {
  id: string;
  name: string;
  percentage: number;
  leads: number;
  color: string;
}

const defaultSlices: CategorySlice[] = [
  { id: "fssai", name: "FSSAI Registration", percentage: 24, leads: 231, color: "#0ea5e9" },
  { id: "gst", name: "GST Registration", percentage: 18, leads: 174, color: "#10b981" },
  { id: "tm", name: "Trademark", percentage: 12, leads: 116, color: "#f59e0b" },
  { id: "itr", name: "ITR Filing", percentage: 10, leads: 96, color: "#8b5cf6" },
  { id: "trade", name: "Shop Act / Trade License", percentage: 8, leads: 77, color: "#ec4899" },
  { id: "other", name: "Other Services", percentage: 28, leads: 270, color: "#64748b" },
];

interface ServiceDistributionDonutProps {
  selectedBranch?: string;
}

export default function ServiceDistributionDonut({
  selectedBranch = "All Branches",
}: ServiceDistributionDonutProps) {
  const [hoveredSlice, setHoveredSlice] = useState<CategorySlice | null>(null);

  const activeSlices = useMemo(() => {
    if (selectedBranch === "Delhi HQ") {
      return [
        { id: "fssai", name: "FSSAI Registration", percentage: 32, leads: 164, color: "#0ea5e9" },
        { id: "gst", name: "GST Registration", percentage: 22, leads: 112, color: "#10b981" },
        { id: "tm", name: "Trademark", percentage: 14, leads: 72, color: "#f59e0b" },
        { id: "itr", name: "ITR Filing", percentage: 12, leads: 61, color: "#8b5cf6" },
        { id: "trade", name: "Shop Act / Trade License", percentage: 10, leads: 51, color: "#ec4899" },
        { id: "other", name: "Other Services", percentage: 10, leads: 52, color: "#64748b" },
      ];
    }
    if (selectedBranch === "Mumbai Regional") {
      return [
        { id: "fssai", name: "FSSAI Registration", percentage: 16, leads: 46, color: "#0ea5e9" },
        { id: "gst", name: "GST Registration", percentage: 24, leads: 68, color: "#10b981" },
        { id: "tm", name: "Trademark", percentage: 28, leads: 80, color: "#f59e0b" },
        { id: "itr", name: "ITR Filing", percentage: 14, leads: 40, color: "#8b5cf6" },
        { id: "trade", name: "Shop Act / Trade License", percentage: 6, leads: 18, color: "#ec4899" },
        { id: "other", name: "Other Services", percentage: 12, leads: 34, color: "#64748b" },
      ];
    }
    if (selectedBranch === "Noida Branch") {
      return [
        { id: "fssai", name: "FSSAI Registration", percentage: 28, leads: 63, color: "#0ea5e9" },
        { id: "gst", name: "GST Registration", percentage: 26, leads: 58, color: "#10b981" },
        { id: "tm", name: "Trademark", percentage: 10, leads: 22, color: "#f59e0b" },
        { id: "itr", name: "ITR Filing", percentage: 16, leads: 36, color: "#8b5cf6" },
        { id: "trade", name: "Shop Act / Trade License", percentage: 8, leads: 18, color: "#ec4899" },
        { id: "other", name: "Other Services", percentage: 12, leads: 27, color: "#64748b" },
      ];
    }
    if (selectedBranch === "Bengaluru Tech Hub") {
      return [
        { id: "fssai", name: "FSSAI Registration", percentage: 15, leads: 20, color: "#0ea5e9" },
        { id: "gst", name: "GST Registration", percentage: 20, leads: 27, color: "#10b981" },
        { id: "tm", name: "Trademark", percentage: 22, leads: 30, color: "#f59e0b" },
        { id: "itr", name: "ITR Filing", percentage: 18, leads: 25, color: "#8b5cf6" },
        { id: "trade", name: "Shop Act / Trade License", percentage: 5, leads: 7, color: "#ec4899" },
        { id: "other", name: "Other Services", percentage: 20, leads: 27, color: "#64748b" },
      ];
    }
    if (selectedBranch === "Kolkata Hub") {
      return [
        { id: "fssai", name: "FSSAI Registration", percentage: 30, leads: 27, color: "#0ea5e9" },
        { id: "gst", name: "GST Registration", percentage: 25, leads: 23, color: "#10b981" },
        { id: "tm", name: "Trademark", percentage: 8, leads: 7, color: "#f59e0b" },
        { id: "itr", name: "ITR Filing", percentage: 12, leads: 11, color: "#8b5cf6" },
        { id: "trade", name: "Shop Act / Trade License", percentage: 15, leads: 13, color: "#ec4899" },
        { id: "other", name: "Other Services", percentage: 10, leads: 9, color: "#64748b" },
      ];
    }
    return defaultSlices;
  }, [selectedBranch]);

  const totalLeads = useMemo(() => {
    return activeSlices.reduce((sum, s) => sum + s.leads, 0);
  }, [activeSlices]);

  const radius = 54;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius; // ~339.29

  let accumulatedPercent = 0;
  const renderedSlices = activeSlices.map((slice) => {
    const sliceLen = (slice.percentage / 100) * circumference - 3;
    const strokeDasharray = `${sliceLen} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += slice.percentage;
    return { ...slice, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header matching Reference Screenshot */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
          Service-wise Distribution
        </h3>
        {selectedBranch !== "All Branches" && (
          <span className="text-[10px] font-bold text-slate-400">
            {selectedBranch}
          </span>
        )}
      </div>

      {/* Side-by-Side Content matching Reference Screenshot */}
      <div className="flex items-center justify-between gap-4 py-2 my-auto">
        {/* Left: Donut with Center Text */}
        <div className="relative shrink-0 flex items-center justify-center select-none">
          <svg viewBox="0 0 140 140" className="w-32 h-32 sm:w-36 sm:h-36 transform -rotate-90 overflow-visible">
            {renderedSlices.map((slice) => {
              const isHovered = hoveredSlice?.id === slice.id;
              return (
                <circle
                  key={slice.id}
                  r={radius}
                  cx="70"
                  cy="70"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}
          </svg>

          {/* Dynamic / Default Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {hoveredSlice ? (
              <div className="animate-in fade-in zoom-in-95 duration-100">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {hoveredSlice.percentage}%
                </span>
                <p className="text-[9px] font-bold text-sky-600 dark:text-sky-400 truncate max-w-[85px]">
                  {hoveredSlice.name}
                </p>
                <p className="text-[8px] font-semibold text-slate-400">
                  {hoveredSlice.leads} leads
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {totalLeads}
                </span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                  Total Leads
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Legend list matching Reference Screenshot */}
        <div className="flex-1 space-y-1.5 text-xs">
          {activeSlices.map((slice) => {
            const isHovered = hoveredSlice?.id === slice.id;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between py-0.5 px-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? "bg-slate-50 dark:bg-slate-800/80 font-bold" : ""
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold text-[11px] truncate">
                    {slice.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    ({slice.leads})
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                    {slice.percentage}%
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
