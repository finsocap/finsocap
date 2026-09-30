"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  RotateCcw,
  CalendarDays,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  CalendarRange,
} from "lucide-react";

export interface DateRangeValue {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCustom?: boolean;
}

export const DATE_PRESETS: DateRangeValue[] = [
  {
    id: "today",
    label: "Today",
    startDate: "2026-09-30",
    endDate: "2026-09-30",
  },
  {
    id: "yesterday",
    label: "Yesterday",
    startDate: "2026-09-29",
    endDate: "2026-09-29",
  },
  {
    id: "last7days",
    label: "Last 7 Days",
    startDate: "2026-09-24",
    endDate: "2026-09-30",
  },
  {
    id: "thisMonth",
    label: "01 Sep 2026 - 30 Sep 2026",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
  },
  {
    id: "lastMonth",
    label: "01 Aug 2026 - 31 Aug 2026",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
  },
  {
    id: "thisQuarter",
    label: "This Quarter (Q3 2026)",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
  },
  {
    id: "fy2026",
    label: "Financial Year (FY 2026-27)",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
  },
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = [2025, 2026, 2027];

interface DateRangeFilterProps {
  value: string;
  onChange: (preset: DateRangeValue) => void;
  className?: string;
}

function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return "";
  try {
    const parts = isoDate.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return `${String(d).padStart(2, "0")} ${MONTHS_SHORT[m]} ${y}`;
    }
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function getLastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function DateRangeFilter({
  value,
  onChange,
  className = "",
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "dates" | "months">("presets");

  // State for "Date to Date" manual selector
  const [customStart, setCustomStart] = useState("2026-09-01");
  const [customEnd, setCustomEnd] = useState("2026-09-30");
  const [calMonth, setCalMonth] = useState(8); // September (0-indexed)
  const [calYear, setCalYear] = useState(2026);
  const [selectingStep, setSelectingStep] = useState<"start" | "end">("start");

  // State for "Month to Month" selector
  const [fromMonth, setFromMonth] = useState(7); // August (0-indexed)
  const [fromYear, setFromYear] = useState(2026);
  const [toMonth, setToMonth] = useState(8); // September (0-indexed)
  const [toYear, setToYear] = useState(2026);

  const [errorMessage, setErrorMessage] = useState("");
  const [popoverAlign, setPopoverAlign] = useState<"right" | "left">("right");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamically calculate alignment to prevent overflow or sticking to right screen edge
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 375;
      const screenPadding = 24;

      // If opening to the right (left-aligned) would stick or overflow right edge:
      if (rect.left + popoverWidth > window.innerWidth - screenPadding) {
        setPopoverAlign("right");
      } else if (rect.right - popoverWidth < screenPadding) {
        setPopoverAlign("left");
      } else {
        setPopoverAlign("right"); // Default to right-aligned so it flows inward
      }
    }
  }, [isOpen]);

  // Close when clicking outside or pressing ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectPreset = (preset: DateRangeValue) => {
    onChange(preset);
    setIsOpen(false);
  };

  // Calendar Day Click Handler
  const handleCalendarDayClick = (day: number) => {
    const dayStr = String(day).padStart(2, "0");
    const monthStr = String(calMonth + 1).padStart(2, "0");
    const clickedIso = `${calYear}-${monthStr}-${dayStr}`;

    if (selectingStep === "start") {
      setCustomStart(clickedIso);
      setCustomEnd(clickedIso);
      setSelectingStep("end");
      setErrorMessage("");
    } else {
      if (clickedIso < customStart) {
        // If clicked date is before start date, treat as new start
        setCustomStart(clickedIso);
        setCustomEnd(clickedIso);
        setSelectingStep("end");
      } else {
        setCustomEnd(clickedIso);
        setSelectingStep("start");
      }
      setErrorMessage("");
    }
  };

  // Apply Manual Date-to-Date Range
  const handleApplyCustomDates = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customStart || !customEnd) {
      setErrorMessage("Please select both start and end dates");
      return;
    }
    if (customStart > customEnd) {
      setErrorMessage("Start date cannot be after end date");
      return;
    }

    const formattedStart = formatDateDisplay(customStart);
    const formattedEnd = formatDateDisplay(customEnd);
    const customLabel =
      formattedStart === formattedEnd
        ? formattedStart
        : `${formattedStart} - ${formattedEnd}`;

    onChange({
      id: "custom-date",
      label: customLabel,
      startDate: customStart,
      endDate: customEnd,
      isCustom: true,
    });
    setErrorMessage("");
    setIsOpen(false);
  };

  // Apply Manual Month-to-Month Range
  const handleApplyMonthRange = () => {
    const startVal = fromYear * 12 + fromMonth;
    const endVal = toYear * 12 + toMonth;

    if (startVal > endVal) {
      setErrorMessage("Start month cannot be after end month");
      return;
    }

    const startDayStr = "01";
    const startMonthStr = String(fromMonth + 1).padStart(2, "0");
    const startIso = `${fromYear}-${startMonthStr}-${startDayStr}`;

    const lastDay = getLastDayOfMonth(toYear, toMonth);
    const endDayStr = String(lastDay).padStart(2, "0");
    const endMonthStr = String(toMonth + 1).padStart(2, "0");
    const endIso = `${toYear}-${endMonthStr}-${endDayStr}`;

    const startLabel = `${startDayStr} ${MONTHS_SHORT[fromMonth]} ${fromYear}`;
    const endLabel = `${endDayStr} ${MONTHS_SHORT[toMonth]} ${toYear}`;
    const label = `${startLabel} - ${endLabel}`;

    onChange({
      id: "month-range",
      label,
      startDate: startIso,
      endDate: endIso,
      isCustom: true,
    });
    setErrorMessage("");
    setIsOpen(false);
  };

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 is Sun
    const totalDays = getLastDayOfMonth(calYear, calMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  }, [calYear, calMonth]);

  const isDefault = value === "01 Sep 2026 - 30 Sep 2026";

  return (
    <>
      {/* Background Overlay when dropdown is open - Full screen overlay behind the dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 w-screen h-screen bg-slate-950/30 dark:bg-slate-950/60 backdrop-blur-[1px] z-40 transition-all duration-150 animate-in fade-in cursor-pointer"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        ref={containerRef}
        className={`relative inline-block ${isOpen ? "z-50" : "z-10"} ${className}`}
      >
        {/* Trigger Button - Exactly preserves the screenshot aesthetic */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#0c1427] border text-xs font-semibold shadow-xs cursor-pointer transition-all duration-150 select-none ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20 text-blue-600 dark:text-sky-400 relative z-50 shadow-md"
              : !isDefault
              ? "border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 text-blue-700 dark:text-sky-300"
              : "border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
        <Calendar
          className={`w-3.5 h-3.5 transition-colors ${
            isOpen || !isDefault
              ? "text-blue-500 dark:text-sky-400"
              : "text-slate-400"
          }`}
        />
        <span className="truncate max-w-[190px] sm:max-w-[240px]">{value}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-500 dark:text-sky-400" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-[min(375px,calc(100vw-2rem))] bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            popoverAlign === "right" ? "right-0 left-auto" : "left-0 right-auto"
          }`}
        >
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Filter by Date Range
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Custom dates or month ranges
                </span>
              </div>
            </div>

            {!isDefault && (
              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    DATE_PRESETS.find((p) => p.id === "thisMonth")!
                  )
                }
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset to default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 3 Nav Tabs: Presets | Date-to-Date | Month-to-Month */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("presets");
                  setErrorMessage("");
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer text-center text-[11px] ${
                  activeTab === "presets"
                    ? "bg-white dark:bg-[#0c1427] text-blue-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ⚡ Presets
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("dates");
                  setErrorMessage("");
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer text-center text-[11px] ${
                  activeTab === "dates"
                    ? "bg-white dark:bg-[#0c1427] text-blue-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                📅 Date to Date
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("months");
                  setErrorMessage("");
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer text-center text-[11px] ${
                  activeTab === "months"
                    ? "bg-white dark:bg-[#0c1427] text-blue-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🗓️ By Month
              </button>
            </div>
          </div>

          {/* TAB 1: Quick Presets */}
          {activeTab === "presets" && (
            <div className="p-2.5 space-y-1 max-h-[320px] overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Standard Periods</span>
                <span className="text-[9px] text-slate-400 font-semibold">1-Click Apply</span>
              </div>
              {DATE_PRESETS.map((preset) => {
                const isSelected = value === preset.label;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 font-bold border border-blue-200/60 dark:border-blue-800/60"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? "bg-blue-600 dark:bg-sky-400"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />
                      <span>{preset.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {preset.id === "thisMonth" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Current
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: "Is Date Se Is Date Tak" (Date-to-Date Manual Range & Calendar) */}
          {activeTab === "dates" && (
            <div className="p-3.5 space-y-3.5 animate-in fade-in duration-150">
              {/* Start & End Date Direct Input Boxes */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      From Date
                    </label>
                    {selectingStep === "start" && (
                      <span className="text-[9px] font-bold text-blue-600 dark:text-sky-400">
                        Pick Start
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => {
                      setCustomStart(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      To Date
                    </label>
                    {selectingStep === "end" && (
                      <span className="text-[9px] font-bold text-blue-600 dark:text-sky-400">
                        Pick End
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => {
                      setCustomEnd(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Interactive Calendar Month Picker */}
              <div className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1427]">
                {/* Month & Year Navigator */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear(calYear - 1);
                      } else {
                        setCalMonth(calMonth - 1);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {MONTHS_FULL[calMonth]} {calYear}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear(calYear + 1);
                      } else {
                        setCalMonth(calMonth + 1);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 text-center mb-1 text-[10px] font-bold text-slate-400">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="h-7" />;
                    }

                    const dayIso = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isStart = dayIso === customStart;
                    const isEnd = dayIso === customEnd;
                    const inRange = dayIso > customStart && dayIso < customEnd;

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        onClick={() => handleCalendarDayClick(day)}
                        className={`h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                          isStart || isEnd
                            ? "bg-blue-600 text-white font-black shadow-xs scale-105"
                            : inRange
                            ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 font-bold"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selection Readout & Error */}
              {errorMessage && (
                <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400">
                  {errorMessage}
                </p>
              )}

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px]">Selected Range:</span>
                <span className="font-black text-slate-900 dark:text-white text-[11px]">
                  {formatDateDisplay(customStart)} &rarr; {formatDateDisplay(customEnd)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCustomDates()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Date Range</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: "Is Month Se Is Month Tak" (Month-to-Month Range Selector) */}
          {activeTab === "months" && (
            <div className="p-3.5 space-y-3.5 animate-in fade-in duration-150">
              <div className="p-2.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/70 text-[11px] text-blue-800 dark:text-sky-300">
                <span className="font-bold">Month-to-Month Filter:</span> Select starting month and ending month across FY 2025-27.
              </div>

              {/* From Month & Year */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    From Month
                  </span>
                  {/* Year selector */}
                  <div className="flex items-center gap-1">
                    {YEARS.map((y) => (
                      <button
                        key={`from-y-${y}`}
                        type="button"
                        onClick={() => {
                          setFromYear(y);
                          setErrorMessage("");
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                          fromYear === y
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                  {MONTHS_SHORT.map((m, idx) => {
                    const isSelected = fromMonth === idx;
                    return (
                      <button
                        key={`from-m-${m}`}
                        type="button"
                        onClick={() => {
                          setFromMonth(idx);
                          setErrorMessage("");
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* To Month & Year */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    To Month
                  </span>
                  {/* Year selector */}
                  <div className="flex items-center gap-1">
                    {YEARS.map((y) => (
                      <button
                        key={`to-y-${y}`}
                        type="button"
                        onClick={() => {
                          setToYear(y);
                          setErrorMessage("");
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                          toYear === y
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                  {MONTHS_SHORT.map((m, idx) => {
                    const isSelected = toMonth === idx;
                    return (
                      <button
                        key={`to-m-${m}`}
                        type="button"
                        onClick={() => {
                          setToMonth(idx);
                          setErrorMessage("");
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Month Shortcuts */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Popular Quarter Ranges
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setFromMonth(3); setFromYear(2026); // Apr
                      setToMonth(5); setToYear(2026); // Jun
                      setErrorMessage("");
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    Q1 (Apr - Jun)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFromMonth(6); setFromYear(2026); // Jul
                      setToMonth(8); setToYear(2026); // Sep
                      setErrorMessage("");
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    Q2 (Jul - Sep)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFromMonth(7); setFromYear(2026); // Aug
                      setToMonth(8); setToYear(2026); // Sep
                      setErrorMessage("");
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    Aug &rarr; Sep 26
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400">
                  {errorMessage}
                </p>
              )}

              {/* Selection Summary */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px]">Period:</span>
                <span className="font-black text-slate-900 dark:text-white text-[11px]">
                  {MONTHS_SHORT[fromMonth]} {fromYear} &rarr; {MONTHS_SHORT[toMonth]} {toYear}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyMonthRange}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Month Range</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Status */}
          <div className="p-2.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Fiscal Year: 2026-27</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
              Active: {value}
            </span>
          </div>
        </div>
      )}
    </div>
  </>
  );
}
