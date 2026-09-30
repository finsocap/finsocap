"use client";

import { useState, useMemo } from "react";
import { IndianRupee, Users, ChevronDown, Check } from "lucide-react";

interface DailyPoint {
  day: number;
  dateStr: string;
  leads: number;
  revenue: number;
}

const baseMonthData: DailyPoint[] = [
  { day: 1, dateStr: "01 Sep 2026", leads: 34, revenue: 48000 },
  { day: 3, dateStr: "03 Sep 2026", leads: 52, revenue: 72000 },
  { day: 5, dateStr: "05 Sep 2026", leads: 46, revenue: 64000 },
  { day: 7, dateStr: "07 Sep 2026", leads: 60, revenue: 84000 },
  { day: 9, dateStr: "09 Sep 2026", leads: 68, revenue: 98000 },
  { day: 11, dateStr: "11 Sep 2026", leads: 62, revenue: 89000 },
  { day: 13, dateStr: "13 Sep 2026", leads: 76, revenue: 112000 },
  { day: 15, dateStr: "15 Sep 2026", leads: 58, revenue: 85000 },
  { day: 17, dateStr: "17 Sep 2026", leads: 74, revenue: 119000 },
  { day: 19, dateStr: "19 Sep 2026", leads: 70, revenue: 106000 },
  { day: 21, dateStr: "21 Sep 2026", leads: 82, revenue: 134000 },
  { day: 23, dateStr: "23 Sep 2026", leads: 88, revenue: 148000 },
  { day: 25, dateStr: "25 Sep 2026", leads: 84, revenue: 152000 },
  { day: 27, dateStr: "27 Sep 2026", leads: 95, revenue: 178000 },
  { day: 29, dateStr: "29 Sep 2026", leads: 98, revenue: 195000 },
  { day: 30, dateStr: "30 Sep 2026", leads: 94, revenue: 188000 },
];

const last7DaysData: DailyPoint[] = [
  { day: 24, dateStr: "24 Sep 2026", leads: 78, revenue: 142000 },
  { day: 25, dateStr: "25 Sep 2026", leads: 84, revenue: 152000 },
  { day: 26, dateStr: "26 Sep 2026", leads: 89, revenue: 164000 },
  { day: 27, dateStr: "27 Sep 2026", leads: 95, revenue: 178000 },
  { day: 28, dateStr: "28 Sep 2026", leads: 91, revenue: 172000 },
  { day: 29, dateStr: "29 Sep 2026", leads: 98, revenue: 195000 },
  { day: 30, dateStr: "30 Sep 2026", leads: 94, revenue: 188000 },
];

const todayHoursData: DailyPoint[] = [
  { day: 1, dateStr: "09:00 AM", leads: 4, revenue: 8000 },
  { day: 2, dateStr: "11:00 AM", leads: 12, revenue: 24000 },
  { day: 3, dateStr: "01:00 PM", leads: 19, revenue: 38000 },
  { day: 4, dateStr: "03:00 PM", leads: 28, revenue: 56000 },
  { day: 5, dateStr: "05:00 PM", leads: 38, revenue: 76000 },
  { day: 6, dateStr: "07:00 PM", leads: 42, revenue: 84000 },
];

interface LeadsRevenueChartProps {
  selectedBranch?: string;
  dateRange?: string;
}

export default function LeadsRevenueChart({
  selectedBranch = "All Branches",
  dateRange = "01 Sep 2026 - 30 Sep 2026",
}: LeadsRevenueChartProps) {
  const [activeRange, setActiveRange] = useState<"This Month" | "Last Month" | "This Quarter">("This Month");
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<DailyPoint | null>(null);

  // Compute branch multiplier
  const branchMultiplier = useMemo(() => {
    switch (selectedBranch) {
      case "Delhi HQ":
        return 0.41;
      case "Mumbai Regional":
        return 0.25;
      case "Noida Branch":
        return 0.18;
      case "Bengaluru Tech Hub":
        return 0.11;
      case "Kolkata Hub":
        return 0.07;
      default:
        return 1.0;
    }
  }, [selectedBranch]);

  // Choose dataset based on global dateRange or internal activeRange
  const activeDataset = useMemo(() => {
    let sourceData = baseMonthData;
    if (dateRange.includes("Today") || dateRange.includes("Yesterday")) {
      sourceData = todayHoursData;
    } else if (dateRange.includes("Last 7 Days")) {
      sourceData = last7DaysData;
    } else if (activeRange === "Last Month" || dateRange.includes("Aug")) {
      sourceData = baseMonthData.map((d) => ({
        ...d,
        dateStr: d.dateStr.replace("Sep", "Aug"),
        leads: Math.round(d.leads * 0.88),
        revenue: Math.round(d.revenue * 0.85),
      }));
    } else if (activeRange === "This Quarter") {
      sourceData = baseMonthData.map((d) => ({
        ...d,
        leads: Math.round(d.leads * 1.15),
        revenue: Math.round(d.revenue * 1.2),
      }));
    }

    return sourceData.map((pt) => ({
      ...pt,
      leads: Math.max(1, Math.round(pt.leads * branchMultiplier)),
      revenue: Math.max(500, Math.round(pt.revenue * branchMultiplier)),
    }));
  }, [dateRange, activeRange, branchMultiplier]);

  const svgWidth = 560;
  const svgHeight = 185;
  const paddingLeft = 38;
  const paddingRight = 44;
  const paddingTop = 15;
  const paddingBottom = 22;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxLeads = useMemo(() => {
    const highest = Math.max(...activeDataset.map((d) => d.leads), 10);
    return Math.ceil(highest / 20) * 20;
  }, [activeDataset]);

  const maxRevenue = useMemo(() => {
    const highest = Math.max(...activeDataset.map((d) => d.revenue), 10000);
    return Math.ceil(highest / 50000) * 50000;
  }, [activeDataset]);

  const coords = activeDataset.map((pt, i) => {
    const x =
      activeDataset.length > 1
        ? paddingLeft + (i / (activeDataset.length - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    const barHeight = Math.max(4, (pt.leads / maxLeads) * chartHeight);
    const barY = paddingTop + chartHeight - barHeight;
    const lineY = paddingTop + chartHeight - (pt.revenue / maxRevenue) * chartHeight;
    return { ...pt, x, barY, barHeight, lineY };
  });

  const lineD = coords.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.lineY}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.lineY}, ${cx} ${pt.lineY}, ${pt.x} ${pt.lineY}`;
  }, "");

  const areaD = `${lineD} L ${coords[coords.length - 1]?.x || chartWidth} ${
    paddingTop + chartHeight
  } L ${coords[0]?.x || paddingLeft} ${paddingTop + chartHeight} Z`;

  const formatRevenueY = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between h-full relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
            Leads & Revenue Overview
          </h3>
          {selectedBranch !== "All Branches" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-sky-400">
              {selectedBranch}
            </span>
          )}
        </div>

        {/* Legend & Range Dropdown */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-[11px]">Leads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span className="text-[11px]">Revenue (₹)</span>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
            >
              <span>{activeRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRangeOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-40 py-1 text-[11px] font-semibold animate-in fade-in zoom-in-95 duration-100">
                {(["This Month", "Last Month", "This Quarter"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setActiveRange(r);
                      setIsRangeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                      activeRange === r
                        ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-sky-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{r}</span>
                    {activeRange === r && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative py-2 select-none">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
          <defs>
            {/* Revenue Area Gradient */}
            <linearGradient id="neonRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>

            {/* Bar Pill Gradient */}
            <linearGradient id="vibrantBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="vibrantBarGradHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            return (
              <line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="text-slate-100 dark:text-slate-800/80"
              />
            );
          })}

          {/* Y Axis Labels Left (Leads) */}
          <text x={paddingLeft - 8} y={paddingTop + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">
            {maxLeads}
          </text>
          <text x={paddingLeft - 8} y={paddingTop + chartHeight * 0.5 + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">
            {Math.round(maxLeads * 0.5)}
          </text>
          <text x={paddingLeft - 8} y={paddingTop + chartHeight + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">
            0
          </text>

          {/* Y Axis Labels Right (Revenue ₹) */}
          <text x={svgWidth - paddingRight + 8} y={paddingTop + 4} className="text-[10px] font-bold fill-slate-400">
            {formatRevenueY(maxRevenue)}
          </text>
          <text x={svgWidth - paddingRight + 8} y={paddingTop + chartHeight * 0.5 + 4} className="text-[10px] font-bold fill-slate-400">
            {formatRevenueY(maxRevenue * 0.5)}
          </text>
          <text x={svgWidth - paddingRight + 8} y={paddingTop + chartHeight + 4} className="text-[10px] font-bold fill-slate-400">
            ₹0
          </text>

          {/* Hover highlight column */}
          {hoveredPoint && (
            <rect
              x={(coords.find((c) => c.day === hoveredPoint.day)?.x || 0) - 12}
              y={paddingTop}
              width="24"
              height={chartHeight}
              rx="6"
              className="fill-slate-100/80 dark:fill-slate-800/60 pointer-events-none transition-all duration-150"
            />
          )}

          {/* Revenue Area Fill */}
          <path d={areaD} fill="url(#neonRevenueGrad)" className="transition-all duration-300" />

          {/* Bars */}
          {coords.map((pt, i) => {
            const isHovered = hoveredPoint?.day === pt.day;
            const barWidth = Math.min(14, Math.max(8, chartWidth / (coords.length * 2)));
            return (
              <rect
                key={i}
                x={pt.x - barWidth / 2}
                y={pt.barY}
                width={barWidth}
                height={pt.barHeight}
                rx="5"
                fill={isHovered ? "url(#vibrantBarGradHover)" : "url(#vibrantBarGrad)"}
                className="transition-all duration-200 cursor-pointer"
              />
            );
          })}

          {/* Revenue Curve */}
          <path
            d={lineD}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Points on Curve */}
          {coords.map((pt, i) => {
            const isHovered = hoveredPoint?.day === pt.day;
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.lineY}
                r={isHovered ? 6 : 3.5}
                fill="#8b5cf6"
                stroke="white"
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-150 cursor-pointer"
              />
            );
          })}

          {/* Hover Tracking Rectangles */}
          {coords.map((pt, i) => {
            const sliceWidth = chartWidth / coords.length;
            return (
              <rect
                key={i}
                x={pt.x - sliceWidth / 2}
                y={paddingTop}
                width={sliceWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip inside chart area */}
        {hoveredPoint && (
          <div
            className="absolute top-1 pointer-events-none z-30 transition-all duration-75"
            style={{
              left: `${Math.min(
                Math.max(16, ((coords.find((c) => c.day === hoveredPoint.day)?.x || 0) / svgWidth) * 100),
                84
              )}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-md text-white dark:text-slate-900 px-3 py-1.5 rounded-xl shadow-xl border border-slate-700/60 dark:border-slate-300 text-[11px] font-bold whitespace-nowrap flex items-center gap-3">
              <span className="text-[10px] text-slate-300 dark:text-slate-600 uppercase font-black">
                {hoveredPoint.dateStr}
              </span>
              <span className="flex items-center gap-1 text-sky-400 dark:text-sky-600 font-extrabold">
                <Users className="w-3 h-3" /> {hoveredPoint.leads} Leads
              </span>
              <span className="flex items-center gap-1 text-purple-300 dark:text-purple-600 font-extrabold">
                <IndianRupee className="w-3 h-3" /> ₹{hoveredPoint.revenue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* X Axis Date Steps */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-6 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
        {activeDataset.length <= 8 ? (
          activeDataset.map((d, i) => (
            <span key={i} className="truncate max-w-[50px]">
              {d.dateStr.replace(" 2026", "")}
            </span>
          ))
        ) : (
          <>
            <span>01 Sep</span>
            <span>05 Sep</span>
            <span>10 Sep</span>
            <span>15 Sep</span>
            <span>20 Sep</span>
            <span>25 Sep</span>
            <span>30 Sep</span>
          </>
        )}
      </div>
    </div>
  );
}
