"use client";

import { useId, useState } from "react";

interface SparklineProps {
  data: number[];
  color?: "sky" | "purple" | "amber" | "emerald" | "rose";
  height?: number;
  width?: number | string;
  isFullWidth?: boolean;
}

export default function AnimatedSparkline({
  data = [12, 18, 14, 25, 20, 32, 28, 42],
  color = "sky",
  height = 48,
  width = 130,
  isFullWidth = false,
}: SparklineProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const viewWidth = typeof width === "number" ? width : 130;

  // Build SVG points
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (viewWidth - 12) + 6;
    const y = height - ((val - min) / range) * (height - 16) - 8;
    return { x, y, val };
  });

  // Smooth bezier curve path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  // Area closing path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const colorStyles = {
    sky: {
      stroke: "#0ea5e9",
      gradientStart: "rgba(14, 165, 233, 0.4)",
      dotColor: "#0284c7",
      glow: "drop-shadow(0 4px 6px rgba(14, 165, 233, 0.35))",
    },
    purple: {
      stroke: "#a855f7",
      gradientStart: "rgba(168, 85, 247, 0.4)",
      dotColor: "#9333ea",
      glow: "drop-shadow(0 4px 6px rgba(168, 85, 247, 0.35))",
    },
    amber: {
      stroke: "#f59e0b",
      gradientStart: "rgba(245, 158, 11, 0.4)",
      dotColor: "#d97706",
      glow: "drop-shadow(0 4px 6px rgba(245, 158, 11, 0.35))",
    },
    emerald: {
      stroke: "#10b981",
      gradientStart: "rgba(16, 185, 129, 0.4)",
      dotColor: "#059669",
      glow: "drop-shadow(0 4px 6px rgba(16, 185, 129, 0.35))",
    },
    rose: {
      stroke: "#f43f5e",
      gradientStart: "rgba(244, 63, 94, 0.4)",
      dotColor: "#e11d48",
      glow: "drop-shadow(0 4px 6px rgba(244, 63, 94, 0.35))",
    },
  }[color];

  const lastPoint = points[points.length - 1];

  return (
    <div className={`relative group/spark ${isFullWidth ? "w-full" : "inline-block"}`}>
      <svg
        viewBox={`0 0 ${viewWidth} ${height}`}
        className="overflow-visible"
        style={{ width: isFullWidth ? "100%" : `${viewWidth}px`, height: `${height}px` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorStyles.gradientStart} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Animated stroke line with glowing drop shadow */}
        <path
          d={pathD}
          fill="none"
          stroke={colorStyles.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: colorStyles.glow }}
          className="animate-path-draw"
        />

        {/* Pulsing peak point */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4"
          fill={colorStyles.dotColor}
          stroke="white"
          strokeWidth="2"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="8"
          fill={colorStyles.stroke}
          className="animate-ping opacity-35"
        />

        {/* Hover detection overlay */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="10"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>

      {/* Floating Value Tooltip on Hover */}
      {hoverIndex !== null && (
        <div
          className="absolute -top-7 px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold shadow-xl pointer-events-none transform -translate-x-1/2 z-30 transition-all duration-150 animate-in fade-in zoom-in-95"
          style={{ left: `${(points[hoverIndex].x / viewWidth) * 100}%` }}
        >
          {points[hoverIndex].val}
        </div>
      )}
    </div>
  );
}
