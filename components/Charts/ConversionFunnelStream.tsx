"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Info,
  ChevronRight,
  TrendingDown,
} from "lucide-react";

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  dropOff?: string;
  dropCount?: number;
  conversion: string;
  retention: string;
  avgTime: string;
  dropReason?: string;
  iconName: "users" | "check" | "file" | "clock" | "shield" | "award";
}

interface ConversionFunnelStreamProps {
  salesPerson?: string;
}

const defaultStages: FunnelStage[] = [
  {
    id: "leads",
    name: "Inquiries",
    count: 1248,
    dropOff: "-16.7%",
    dropCount: 208,
    conversion: "100%",
    retention: "83.3%",
    avgTime: "0.4 days",
    dropReason: "Unresponsive / Invalid phone",
    iconName: "users",
  },
  {
    id: "qualified",
    name: "Qualified",
    count: 1040,
    dropOff: "-14.4%",
    dropCount: 150,
    conversion: "83.3%",
    retention: "85.6%",
    avgTime: "0.9 days",
    dropReason: "Budget mismatch / Not ready",
    iconName: "check",
  },
  {
    id: "docs",
    name: "Docs Sent",
    count: 890,
    dropOff: "-14.6%",
    dropCount: 130,
    conversion: "71.3%",
    retention: "85.4%",
    avgTime: "1.2 days",
    dropReason: "Pending client KYC documents",
    iconName: "file",
  },
  {
    id: "assigned",
    name: "Assigned CA",
    count: 760,
    dropOff: "-10.5%",
    dropCount: 80,
    conversion: "60.9%",
    retention: "89.5%",
    avgTime: "1.6 days",
    dropReason: "Re-allocation / Complexity review",
    iconName: "clock",
  },
  {
    id: "review",
    name: "Dept Review",
    count: 680,
    dropOff: "-13.5%",
    dropCount: 92,
    conversion: "54.5%",
    retention: "86.5%",
    avgTime: "2.1 days",
    dropReason: "Govt portal discrepancy / Query raised",
    iconName: "shield",
  },
  {
    id: "approved",
    name: "Approved",
    count: 588,
    conversion: "47.1%",
    retention: "100%",
    avgTime: "2.4 days",
    iconName: "award",
  },
];

export default function ConversionFunnelStream({
  salesPerson = "ALL",
}: ConversionFunnelStreamProps) {
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  // If a specific sales person is selected, adjust numbers proportionally
  const stages = defaultStages.map((s) => {
    let multiplier = 1.0;
    if (salesPerson === "Rahul Jha") multiplier = 0.38;
    else if (salesPerson === "Kanhaiya") multiplier = 0.26;
    else if (salesPerson === "Gaurav") multiplier = 0.18;
    else if (salesPerson === "Roshan") multiplier = 0.11;
    else if (salesPerson === "Roshni") multiplier = 0.07;

    return {
      ...s,
      count: Math.round(s.count * multiplier),
      dropCount: s.dropCount ? Math.round(s.dropCount * multiplier) : undefined,
    };
  });

  const topStageCount = stages[0].count;
  const finalStageCount = stages[stages.length - 1].count;
  const overallWinRate = ((finalStageCount / topStageCount) * 100).toFixed(1);

  // SVG Geometry Calculation for Seamless Connected Funnel Stream
  const svgWidth = 900;
  const svgHeight = 120;
  const numStages = stages.length;
  const colWidth = svgWidth / numStages;

  // Calculate top & bottom bounds for each stage
  const stageBounds = stages.map((s, i) => {
    const ratio = s.count / topStageCount; // 1.0 down to ~0.47
    const h = 28 + ratio * 72; // height from 100px down to 62px
    const topY = (svgHeight - h) / 2;
    const botY = topY + h;
    const leftX = i * colWidth;
    const rightX = (i + 1) * colWidth;
    const centerX = leftX + colWidth / 2;
    return { leftX, rightX, centerX, topY, botY, height: h, ratio };
  });

  const getStageIcon = (name: string) => {
    switch (name) {
      case "users":
        return <Users className="w-3.5 h-3.5" />;
      case "check":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "file":
        return <FileText className="w-3.5 h-3.5" />;
      case "clock":
        return <Clock className="w-3.5 h-3.5" />;
      case "shield":
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case "award":
        return <Award className="w-3.5 h-3.5" />;
      default:
        return <Users className="w-3.5 h-3.5" />;
    }
  };

  const hoveredStage = stages.find((s) => s.id === hoveredStageId) || null;

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-6 overflow-hidden">
      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        {/* Metric 1: Conversion Rate */}
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Conversion Rate
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>+4.2% MoM</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              58.8%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              (Qualified &rarr; Won)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Overall lead-to-close win rate: <strong>{overallWinRate}%</strong>
          </p>
        </div>

        {/* Metric 2: Avg Response Time */}
        <div className="flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-4 sm:pt-0 sm:pl-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Avg Response Time
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800/60">
              Target: &lt; 3.0 Days
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              2.4
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              days SLA
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>99.2% requests resolved within SLA</span>
          </p>
        </div>

        {/* Metric 3: Total Pipeline */}
        <div className="flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-4 sm:pt-0 sm:pl-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Total Pipeline Volume
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
              ₹8.72L Value
            </span>
          </div>
          <div className="flex items-center gap-5 mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                842
              </span>
              <span className="text-xs font-bold text-slate-400">active</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-sky-400 tracking-tight">
                240
              </span>
              <span className="text-xs font-bold text-blue-500">new</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active sales applications across all Indian hubs
          </p>
        </div>
      </div>

      {/* 2. Interactive Stage Step Headers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {stages.map((stage, i) => {
          const isHovered = hoveredStageId === stage.id;
          const isFinal = i === stages.length - 1;
          return (
            <div
              key={stage.id}
              onMouseEnter={() => setHoveredStageId(stage.id)}
              onMouseLeave={() => setHoveredStageId(null)}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isHovered
                  ? "bg-blue-50/70 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-md scale-[1.02]"
                  : isFinal
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/70"
                  : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isFinal
                      ? "bg-emerald-500 text-white"
                      : isHovered
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {getStageIcon(stage.iconName)}
                </div>
                <span className="text-[10px] font-black text-slate-400">
                  #{i + 1}
                </span>
              </div>

              <div className="mt-2.5">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                  {stage.name}
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stage.count.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Mini stage conversion indicator */}
              <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-semibold">
                  {stage.conversion}
                </span>
                {stage.dropOff && (
                  <span className="font-bold text-rose-500 dark:text-rose-400">
                    {stage.dropOff}
                  </span>
                )}
                {isFinal && (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Won
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. The Modern Flowing Connected Pipeline Stream SVG */}
      <div className="relative pt-2 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-24 sm:h-28 overflow-visible"
        >
          <defs>
            {/* Gradients for each segment transitioning smoothly */}
            <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="streamGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="streamGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="streamGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="1" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="streamGrad5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>

            {/* Glowing drop shadow filter */}
            <filter id="streamShadow" x="-5%" y="-15%" width="110%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1e40af" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Guide grid vertical lines */}
          {stageBounds.map((b, i) => (
            <line
              key={i}
              x1={b.centerX}
              y1={4}
              x2={b.centerX}
              y2={svgHeight - 4}
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-slate-100 dark:text-slate-800/80"
            />
          ))}

          {/* Render continuous connected trapezoid ribbon segments across all 6 columns */}
          {stageBounds.map((curr, i) => {
            if (i === stageBounds.length - 1) return null;
            const next = stageBounds[i + 1];
            const isHovered =
              hoveredStageId === stages[i].id || hoveredStageId === stages[i + 1].id;

            // Generate clean smooth bezier connector between column i and column i+1
            const x1 = curr.centerX;
            const x2 = next.centerX;
            const cx = (x1 + x2) / 2;

            const d = `
              M ${x1} ${curr.topY}
              C ${cx} ${curr.topY}, ${cx} ${next.topY}, ${x2} ${next.topY}
              L ${x2} ${next.botY}
              C ${cx} ${next.botY}, ${cx} ${curr.botY}, ${x1} ${curr.botY}
              Z
            `;

            return (
              <path
                key={i}
                d={d}
                fill={`url(#streamGrad${Math.min(i + 1, 5)})`}
                filter="url(#streamShadow)"
                className={`transition-all duration-200 cursor-pointer ${
                  isHovered ? "brightness-110 opacity-100" : "opacity-90"
                }`}
                onMouseEnter={() => setHoveredStageId(stages[i].id)}
                onMouseLeave={() => setHoveredStageId(null)}
              />
            );
          })}

          {/* Stage Core Column Node Bars */}
          {stageBounds.map((b, i) => {
            const isHovered = hoveredStageId === stages[i].id;
            const isFinal = i === stageBounds.length - 1;
            const barW = 14;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStageId(stages[i].id)}
                onMouseLeave={() => setHoveredStageId(null)}
              >
                <rect
                  x={b.centerX - barW / 2}
                  y={b.topY}
                  width={barW}
                  height={b.height}
                  rx="7"
                  fill={isFinal ? "#10b981" : isHovered ? "#1d4ed8" : "#2563eb"}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Center Node Dot */}
                <circle
                  cx={b.centerX}
                  cy={svgHeight / 2}
                  r={isHovered ? 6 : 4}
                  fill="white"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Transition Drop-Off Badges placed precisely between columns */}
        <div className="w-full grid grid-cols-5 px-6 sm:px-12 -mt-7 sm:-mt-8 pointer-events-none relative z-10">
          {stages.slice(0, 5).map((stage, i) => {
            return (
              <div key={stage.id} className="flex justify-center">
                {stage.dropOff && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-700 shadow-sm text-[10px] font-bold text-slate-700 dark:text-slate-200 backdrop-blur-md">
                    <span className="text-rose-500 font-extrabold">
                      {stage.dropOff}
                    </span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Stage Details Tooltip / Callout Bar */}
      {hoveredStage ? (
        <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/90 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              {getStageIcon(hoveredStage.iconName)}
            </div>
            <div>
              <span className="font-bold text-blue-950 dark:text-sky-200">
                Stage: {hoveredStage.name}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({hoveredStage.count.toLocaleString("en-IN")} leads &bull; {hoveredStage.conversion} retention)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Avg Time: <strong>{hoveredStage.avgTime}</strong></span>
            </div>
            {hoveredStage.dropReason && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                <span>Top drop cause: <strong>{hoveredStage.dropReason}</strong></span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Default Pipeline Summary Footer */
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <strong>588 Applications Approved</strong> out of 1,248 initial inquiries ({overallWinRate}% Win Rate)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Hover over any stage for detailed drop-off causes and SLA velocity
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
