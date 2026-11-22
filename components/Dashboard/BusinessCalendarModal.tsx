"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Statutory & Financial Compliance Calendar Landmarks for India
const STATUTORY_EVENTS: Record<string, { title: string; type: "tax" | "gst" | "compliance" | "holiday" }> = {
  // Recurring monthly deadlines
  "7": { title: "TDS / TCS Deposit Due Date", type: "tax" },
  "10": { title: "GSTR-7 & GSTR-8 Return Filing", type: "gst" },
  "11": { title: "GSTR-1 Monthly Outward Supply", type: "gst" },
  "13": { title: "GSTR-1 QRMP Scheme Quarterly", type: "gst" },
  "15": { title: "PF & ESI Monthly Deposit", type: "compliance" },
  "20": { title: "GSTR-3B Summary Return", type: "gst" },
  "25": { title: "PMT-06 Monthly GST Challan (QRMP)", type: "gst" },
  "30": { title: "Quarterly TDS Certificate / Filing", type: "tax" },
  "31": { title: "Statutory Reporting & MCA Filings", type: "compliance" },
};

export default function BusinessCalendarModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setSelectedDate(today);
    }
  }, [isOpen, today]);

  // Keyboard navigation & ESC close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  // Calendar days computation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const selectedDayEvent = STATUTORY_EVENTS[String(selectedDate.getDate())];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative flex flex-col space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-100 block">
                  STATUTORY SCHEDULE
                </span>
                <h3 className="font-black text-white text-base tracking-tight leading-tight">
                  Business & Compliance Calendar
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-blue-100 font-medium mt-2 leading-relaxed relative z-10">
            Track daily statutory deadlines, tax filing windows & GST compliance milestones.
          </p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map((wd, idx) => (
              <span
                key={wd}
                className={`text-[10px] font-black uppercase tracking-wider ${
                  idx === 0 ? "text-rose-500" : "text-slate-400"
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous Month Filler Days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-9 flex items-center justify-center text-xs font-medium text-slate-300 dark:text-slate-600 select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const hasEvent = Boolean(STATUTORY_EVENTS[String(dayNum)]);
              const activeToday = isToday(dayNum);
              const activeSelected = isSelected(dayNum);

              return (
                <button
                  key={`cur-${dayNum}`}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, dayNum))}
                  className={`h-9 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                    activeSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 z-10"
                      : activeToday
                      ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      : "hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasEvent && !activeSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Statutory Compliance Card */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-slate-900 dark:to-blue-950/20 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span>
                {selectedDate.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            {selectedDayEvent ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                {selectedDayEvent.type}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Standard Working Day</span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            {selectedDayEvent
              ? `Compliance Milestone: ${selectedDayEvent.title}. Ensure statutory filings and client documents are locked before EOD.`
              : "No mandatory statutory cutoff on this date. Routine case processing and service delivery proceed as scheduled."}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

