import React from "react";
import Image from "next/image";

interface FinsocapLoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg" | "fullscreen";
}

/**
 * Ultra-Clean Minimalist Animated Loader for Finsocap
 * Uses crisp favicon in the center with modern rotating energy rings.
 * Zero clutter / No heavy paragraphs.
 */
export default function FinsocapLoader({
  label = "Loading...",
  size = "md",
}: FinsocapLoaderProps) {
  if (size === "sm") {
    return (
      <div className="inline-flex items-center gap-2 select-none">
        <div className="relative w-4 h-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin" />
        </div>
        {label && <span className="text-xs font-semibold text-slate-500">{label}</span>}
      </div>
    );
  }

  const isFullscreen = size === "fullscreen";

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        isFullscreen
          ? "fixed inset-0 z-[99999] bg-[#f8fafc]/90 backdrop-blur-md"
          : "w-full min-h-[300px] p-6"
      }`}
    >
      {/* Central Rotating Energy Rings + Favicon */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Radial Blur Glow */}
        <div className="absolute w-48 h-48 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />

        {/* Outer Orbit Arc (Clockwise) */}
        <div className="w-32 h-32 rounded-full border-[3px] border-blue-500/15 border-t-blue-600 animate-[spin_1.2s_linear_infinite]" />

        {/* Inner Reverse Arc (Counter-Clockwise) */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-indigo-500/20 border-b-indigo-500 animate-[spin_1.6s_linear_infinite_reverse]" />

        {/* Center Favicon (No white background - high-res transparent favicon) */}
        <div className="absolute flex items-center justify-center transition-transform animate-pulse">
          <Image
            src="/icon-192.png"
            alt="Finsocap Icon"
            width={56}
            height={56}
            className="w-13 h-13 object-contain drop-shadow-lg select-none"
            priority
          />
        </div>
      </div>

      {/* Clean & Short Label */}
      {label && (
        <p className="mt-6 text-[13px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
          {label}
        </p>
      )}
    </div>
  );
}
