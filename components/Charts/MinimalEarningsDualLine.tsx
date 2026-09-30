"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

interface WeekData {
  week: string;
  earned: number; // in thousands (₹)
  potential: number; // in thousands (₹)
}

const data: WeekData[] = [
  { week: "W1", earned: 3.2, potential: 4.5 },
  { week: "W2", earned: 5.6, potential: 4.1 },
  { week: "W3", earned: 4.8, potential: 6.2 },
  { week: "W4", earned: 7.4, potential: 8.5 },
];

export default function MinimalEarningsDualLine() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const svgWidth = 360;
  const svgHeight = 170;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;
  const maxY = 10; // 10k

  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const yEarned = padTop + chartH - (d.earned / maxY) * chartH;
    const yPotential = padTop + chartH - (d.potential / maxY) * chartH;
    return { ...d, x, yEarned, yPotential };
  });

  // Build smooth bezier curves
  const earnedPath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.yEarned}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.yEarned}, ${cx} ${pt.yEarned}, ${pt.x} ${pt.yEarned}`;
  }, "");

  const potentialPath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.yPotential}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.yPotential}, ${cx} ${pt.yPotential}, ${pt.x} ${pt.yPotential}`;
  }, "");

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between h-full">
      {/* Top Legend matching Screenshot */}
      <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Collected
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1 h-3.5 rounded-full bg-blue-600 dark:bg-sky-400" />
            <span className="text-xl font-black text-slate-900 dark:text-white">
              ₹6.72L
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Target / Potential
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1 h-3.5 rounded-full bg-emerald-500" />
            <span className="text-xl font-black text-slate-900 dark:text-white">
              ₹8.50L
            </span>
          </div>
        </div>
      </div>

      {/* The Dual Line Canvas */}
      <div className="relative py-2 select-none my-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40 overflow-visible">
          {/* Subtle grid lines */}
          {[0, 0.3, 0.6, 1].map((r, i) => {
            const y = padTop + r * chartH;
            return (
              <line
                key={i}
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="text-slate-100 dark:text-slate-800"
              />
            );
          })}

          {/* Y Axis Labels */}
          <text x={padLeft - 8} y={padTop + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">₹10L</text>
          <text x={padLeft - 8} y={padTop + chartH * 0.3 + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">₹6L</text>
          <text x={padLeft - 8} y={padTop + chartH * 0.6 + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">₹3L</text>
          <text x={padLeft - 8} y={padTop + chartH + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">₹0</text>

          {/* Line 1: Earned (Blue) */}
          <path
            d={earnedPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Line 2: Potential (Teal) */}
          <path
            d={potentialPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Nodes for Line 1 */}
          {points.map((pt, i) => (
            <circle
              key={`e-${i}`}
              cx={pt.x}
              cy={pt.yEarned}
              r={hoveredIdx === i ? 6 : 4}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={2}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* Nodes for Line 2 */}
          {points.map((pt, i) => (
            <circle
              key={`p-${i}`}
              cx={pt.x}
              cy={pt.yPotential}
              r={hoveredIdx === i ? 6 : 4}
              fill="#10b981"
              stroke="white"
              strokeWidth={2}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* X Axis Week Labels */}
          {points.map((pt, i) => (
            <text
              key={`w-${i}`}
              x={pt.x}
              y={svgHeight - 6}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-400"
            >
              {pt.week}
            </text>
          ))}
        </svg>
      </div>

      {/* Bottom Motivation Callout matching Reference Screenshot */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
        <span className="text-[11px] truncate">
          You&apos;re doing awesome! Revenue is pacing +18% above target
        </span>
      </div>
    </div>
  );
}
