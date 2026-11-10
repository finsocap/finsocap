"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Calculator as CalcIcon,
  X,
  Copy,
  Check,
  Trash2,
  Percent,
  Landmark,
  FileSpreadsheet,
  Delete,
  RotateCcw,
  Equal,
} from "lucide-react";

type CalcTab = "basic" | "gst" | "emi" | "percentage";

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  type: string;
  timestamp: string;
}

export default function BusinessCalculatorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<CalcTab>("basic");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- BASIC CALCULATOR STATE ---
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [formulaPreview, setFormulaPreview] = useState<string>("");

  // --- GST CALCULATOR STATE ---
  const [gstAmount, setGstAmount] = useState<string>("10000");
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstMode, setGstMode] = useState<"exclusive" | "inclusive">("exclusive");

  // --- EMI CALCULATOR STATE ---
  const [emiPrincipal, setEmiPrincipal] = useState<string>("500000");
  const [emiRate, setEmiRate] = useState<string>("10.5");
  const [emiTenureMonths, setEmiTenureMonths] = useState<string>("24");

  // --- PERCENTAGE CALCULATOR STATE ---
  const [pctX, setPctX] = useState<string>("15");
  const [pctY, setPctY] = useState<string>("25000");
  const [pctType, setPctType] = useState<"whatIsXofY" | "xIsWhatPctOfY" | "pctChange">("whatIsXofY");
  const [pctFrom, setPctFrom] = useState<string>("1000");
  const [pctTo, setPctTo] = useState<string>("1500");

  // Clean up any legacy localStorage on mount
  useEffect(() => {
    try {
      localStorage.removeItem("finsocap_calc_history");
    } catch {}
  }, []);

  const saveHistory = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev].slice(0, 25));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const copyToClipboard = (val: string, id: string) => {
    navigator.clipboard?.writeText(val.replace(/,/g, ""));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // --- HIGH PRECISION DECIMAL MATH HELPERS ---
  const formatNumber = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return "Error";
    const parts = num.toString().split(".");
    // Format integer part with Indian/International grouping
    parts[0] = Number(parts[0]).toLocaleString("en-IN");
    if (parts[1]) {
      // limit to 6 decimals to prevent float precision artifacts
      parts[1] = parts[1].slice(0, 6);
      return `${parts[0]}.${parts[1]}`;
    }
    return parts[0];
  };

  const calculate = (a: number, b: number, op: string): number => {
    // Avoid IEEE-754 precision bugs (e.g. 0.1 + 0.2)
    const factor = 100000000;
    const aFixed = Math.round(a * factor);
    const bFixed = Math.round(b * factor);

    switch (op) {
      case "+":
        return (aFixed + bFixed) / factor;
      case "-":
        return (aFixed - bFixed) / factor;
      case "×":
      case "*":
        return (a * b);
      case "÷":
      case "/":
        return b === 0 ? NaN : a / b;
      case "%":
        return (a * b) / 100;
      default:
        return b;
    }
  };

  // --- BASIC CALCULATOR OPERATIONS ---
  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      if (displayValue === "0" && digit !== ".") {
        setDisplayValue(digit);
      } else {
        if (digit === "." && displayValue.includes(".")) return;
        if (displayValue.replace(/,/g, "").length >= 14) return;
        setDisplayValue(displayValue + digit);
      }
    }
  };

  const handleDoubleZero = () => {
    if (waitingForOperand) {
      setDisplayValue("0");
      setWaitingForOperand(false);
    } else if (displayValue !== "0") {
      if (displayValue.replace(/,/g, "").length >= 13) return;
      setDisplayValue(displayValue + "00");
    }
  };

  const handleOperator = (nextOp: string) => {
    const rawCurrent = parseFloat(displayValue.replace(/,/g, ""));

    if (previousValue == null) {
      setPreviousValue(rawCurrent);
      setFormulaPreview(`${formatNumber(rawCurrent)} ${nextOp}`);
    } else if (operator && !waitingForOperand) {
      const result = calculate(previousValue, rawCurrent, operator);
      setPreviousValue(result);
      setDisplayValue(formatNumber(result));
      setFormulaPreview(`${formatNumber(result)} ${nextOp}`);
    } else {
      setFormulaPreview(`${formatNumber(previousValue)} ${nextOp}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  };

  const handleEqual = () => {
    if (operator == null || previousValue == null) return;
    const rawCurrent = parseFloat(displayValue.replace(/,/g, ""));
    const result = calculate(previousValue, rawCurrent, operator);

    const formattedResult = formatNumber(result);
    const expression = `${formatNumber(previousValue)} ${operator} ${formatNumber(rawCurrent)}`;

    saveHistory({
      id: Date.now().toString(),
      expression,
      result: formattedResult,
      type: "Basic",
      timestamp: "Just now",
    });

    setFormulaPreview(`${expression} =`);
    setDisplayValue(formattedResult);
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handlePercent = () => {
    const rawCurrent = parseFloat(displayValue.replace(/,/g, ""));
    if (previousValue != null && operator) {
      // e.g. 500 + 18% -> 18% of 500 = 90
      const pctVal = (previousValue * rawCurrent) / 100;
      setDisplayValue(formatNumber(pctVal));
    } else {
      const res = rawCurrent / 100;
      setDisplayValue(formatNumber(res));
    }
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (displayValue.length <= 1) {
      setDisplayValue("0");
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  };

  const handleClear = () => {
    setDisplayValue("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setFormulaPreview("");
  };

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // If user is focused on an input in GST/EMI/Percentage, let normal typing occur
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (activeTab !== "basic") return;

      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === ".") {
        handleDigit(".");
      } else if (e.key === "+") {
        handleOperator("+");
      } else if (e.key === "-") {
        handleOperator("-");
      } else if (e.key === "*") {
        handleOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
      } else if (e.key === "%") {
        handlePercent();
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEqual();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "c" || e.key === "C") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTab, displayValue, previousValue, operator, waitingForOperand]);

  // --- GST CALCULATIONS ---
  const rawGstAmount = parseFloat(gstAmount) || 0;
  const gstRateVal = gstRate || 0;
  let gstBaseAmount = 0;
  let gstTaxAmount = 0;
  let gstTotalAmount = 0;

  if (gstMode === "exclusive") {
    // Add GST: Total = Base + (Base * Rate / 100)
    gstBaseAmount = rawGstAmount;
    gstTaxAmount = (rawGstAmount * gstRateVal) / 100;
    gstTotalAmount = gstBaseAmount + gstTaxAmount;
  } else {
    // Remove GST: Base = Total / (1 + Rate/100)
    gstTotalAmount = rawGstAmount;
    gstBaseAmount = (rawGstAmount * 100) / (100 + gstRateVal);
    gstTaxAmount = gstTotalAmount - gstBaseAmount;
  }
  const cgstAmount = gstTaxAmount / 2;
  const sgstAmount = gstTaxAmount / 2;

  const handleRecordGstToHistory = () => {
    saveHistory({
      id: Date.now().toString(),
      expression: `${gstMode === "exclusive" ? "Add" : "Remove"} ${gstRate}% on ₹${formatNumber(rawGstAmount)}`,
      result: `₹${formatNumber(gstTotalAmount)} (Tax: ₹${formatNumber(gstTaxAmount)})`,
      type: "GST",
      timestamp: "Just now",
    });
  };

  // --- EMI CALCULATIONS ---
  // Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const P = parseFloat(emiPrincipal) || 0;
  const annualR = parseFloat(emiRate) || 0;
  const N = parseFloat(emiTenureMonths) || 1;
  const monthlyR = annualR / 12 / 100;

  let monthlyEmi = 0;
  let totalEmiPayment = 0;
  let totalEmiInterest = 0;

  if (P > 0 && N > 0) {
    if (monthlyR > 0) {
      monthlyEmi = (P * monthlyR * Math.pow(1 + monthlyR, N)) / (Math.pow(1 + monthlyR, N) - 1);
      totalEmiPayment = monthlyEmi * N;
      totalEmiInterest = totalEmiPayment - P;
    } else {
      monthlyEmi = P / N;
      totalEmiPayment = P;
      totalEmiInterest = 0;
    }
  }

  const handleRecordEmiToHistory = () => {
    saveHistory({
      id: Date.now().toString(),
      expression: `₹${formatNumber(P)} @ ${annualR}% for ${N}mo`,
      result: `EMI ₹${formatNumber(monthlyEmi)}/mo`,
      type: "EMI",
      timestamp: "Just now",
    });
  };

  // --- PERCENTAGE CALCULATIONS ---
  const pX = parseFloat(pctX) || 0;
  const pY = parseFloat(pctY) || 0;
  const pFrom = parseFloat(pctFrom) || 0;
  const pTo = parseFloat(pctTo) || 0;

  let pctResult = 0;
  let pctExpressionLabel = "";

  if (pctType === "whatIsXofY") {
    pctResult = (pX / 100) * pY;
    pctExpressionLabel = `${pX}% of ${formatNumber(pY)}`;
  } else if (pctType === "xIsWhatPctOfY") {
    pctResult = pY !== 0 ? (pX / pY) * 100 : 0;
    pctExpressionLabel = `${formatNumber(pX)} is what % of ${formatNumber(pY)}`;
  } else {
    pctResult = pFrom !== 0 ? ((pTo - pFrom) / pFrom) * 100 : 0;
    pctExpressionLabel = `Change from ${formatNumber(pFrom)} to ${formatNumber(pTo)}`;
  }

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Floating Calculator Card (Exact Reference UI) */}
      <div
        className="relative z-10 w-full max-w-[820px] my-auto bg-white dark:bg-[#0c1427] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden flex flex-col shrink-0 animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Always visible with Finsocap Calculator and Close Cross */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            {/* Matching Apple / iOS 4-Circle Calculator Icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#22252e] p-[5px] grid grid-cols-2 gap-[3px] shadow-lg shadow-slate-900/20 shrink-0 select-none border border-slate-700/50">
              {/* Top-Left: + */}
              <div className="rounded-full bg-[#464c5a] flex items-center justify-center text-[13px] font-bold text-white leading-none">
                +
              </div>
              {/* Top-Right: - */}
              <div className="rounded-full bg-[#464c5a] flex items-center justify-center text-[15px] font-bold text-white leading-none">
                −
              </div>
              {/* Bottom-Left: × */}
              <div className="rounded-full bg-[#464c5a] flex items-center justify-center text-[13px] font-bold text-white leading-none">
                ×
              </div>
              {/* Bottom-Right: = (Orange) */}
              <div className="rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#f47c00] flex items-center justify-center text-[13px] font-black text-white leading-none shadow-[0_2px_4px_rgba(244,124,0,0.5)]">
                =
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                Finsocap Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Quick Business Utilities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close calculator (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pills - Always visible */}
        <div className="px-5 sm:px-6 pt-3 pb-2.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c1427] overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "basic"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <CalcIcon className="w-4 h-4" />
            Basic
          </button>
          <button
            onClick={() => setActiveTab("gst")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "gst"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            GST
          </button>
          <button
            onClick={() => setActiveTab("emi")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "emi"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Landmark className="w-4 h-4" />
            EMI
          </button>
          <button
            onClick={() => setActiveTab("percentage")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "percentage"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Percent className="w-4 h-4" />
            Percentage
          </button>
        </div>

        {/* Calculator Body: 2 Columns (Keypad/Tools on Left, Recent Calculations on Right) */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 overflow-y-auto">
          {/* LEFT COLUMN: ACTIVE CALCULATOR INTERFACE */}
          <div className="md:col-span-7 flex flex-col">
            {/* 1. BASIC KEYPAD CALCULATOR */}
            {activeTab === "basic" && (
              <div className="flex flex-col gap-3">
                {/* Digital LCD Display (Matches Dark Blue Gradient in Screenshot) */}
                <div className="w-full h-24 rounded-2xl bg-gradient-to-br from-[#182649] via-[#101b38] to-[#0a1226] p-4 text-white flex flex-col justify-between shadow-inner border border-slate-700/50">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">FINSOCAP • BASIC</span>
                    <span className="font-mono text-amber-300 truncate max-w-[170px]">
                      {formulaPreview}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-3xl sm:text-4xl tracking-tight leading-none text-white overflow-hidden text-ellipsis block">
                      {displayValue}
                    </span>
                  </div>
                </div>

                {/* Keypad Grid (4 Columns, Exactly matching Reference UI) */}
                <div className="grid grid-cols-4 gap-2.5 mt-2">
                  {/* Row 1: AC, Backspace, %, ÷ */}
                  <button
                    onClick={handleClear}
                    className="h-12 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-black text-sm transition-all active:scale-95 flex items-center justify-center border border-red-200/60 dark:border-red-900/40"
                  >
                    AC
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all active:scale-95 flex items-center justify-center"
                    title="Backspace"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePercent}
                    className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm transition-all active:scale-95 flex items-center justify-center"
                  >
                    %
                  </button>
                  <button
                    onClick={() => handleOperator("÷")}
                    className={`h-12 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center justify-center border ${
                      operator === "÷"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-sky-400 border-blue-200/60 dark:border-blue-900/50"
                    }`}
                  >
                    ÷
                  </button>

                  {/* Row 2: 7, 8, 9, × */}
                  <button
                    onClick={() => handleDigit("7")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    7
                  </button>
                  <button
                    onClick={() => handleDigit("8")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    8
                  </button>
                  <button
                    onClick={() => handleDigit("9")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    9
                  </button>
                  <button
                    onClick={() => handleOperator("×")}
                    className={`h-12 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center justify-center border ${
                      operator === "×"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-sky-400 border-blue-200/60 dark:border-blue-900/50"
                    }`}
                  >
                    ×
                  </button>

                  {/* Row 3: 4, 5, 6, - */}
                  <button
                    onClick={() => handleDigit("4")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    4
                  </button>
                  <button
                    onClick={() => handleDigit("5")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    5
                  </button>
                  <button
                    onClick={() => handleDigit("6")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    6
                  </button>
                  <button
                    onClick={() => handleOperator("-")}
                    className={`h-12 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center justify-center border ${
                      operator === "-"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-sky-400 border-blue-200/60 dark:border-blue-900/50"
                    }`}
                  >
                    −
                  </button>

                  {/* Row 4: 1, 2, 3, + */}
                  <button
                    onClick={() => handleDigit("1")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    1
                  </button>
                  <button
                    onClick={() => handleDigit("2")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    2
                  </button>
                  <button
                    onClick={() => handleDigit("3")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    3
                  </button>
                  <button
                    onClick={() => handleOperator("+")}
                    className={`h-12 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center justify-center border ${
                      operator === "+"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-sky-400 border-blue-200/60 dark:border-blue-900/50"
                    }`}
                  >
                    +
                  </button>

                  {/* Row 5: 00, 0, ., = */}
                  <button
                    onClick={handleDoubleZero}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    00
                  </button>
                  <button
                    onClick={() => handleDigit("0")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleDigit(".")}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800"
                  >
                    .
                  </button>
                  <button
                    onClick={handleEqual}
                    className="h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 text-white font-black text-lg shadow-md shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center"
                  >
                    =
                  </button>
                </div>
              </div>
            )}

            {/* 2. ADVANCED GST CALCULATOR */}
            {activeTab === "gst" && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40">
                  {/* Mode Toggle: GST Exclusive (Add) vs Inclusive (Remove) */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mb-3">
                    <button
                      onClick={() => setGstMode("exclusive")}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        gstMode === "exclusive"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Add GST (Exclusive)
                    </button>
                    <button
                      onClick={() => setGstMode("inclusive")}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        gstMode === "inclusive"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Remove GST (Inclusive)
                    </button>
                  </div>

                  {/* Input: Amount */}
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={gstAmount}
                    onChange={(e) => setGstAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />

                  {/* GST Slab Pills */}
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mt-3 mb-1">
                    GST Rate
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[3, 5, 12, 18, 28].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setGstRate(rate)}
                        className={`py-2 rounded-xl text-xs font-black transition-all ${
                          gstRate === rate
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* GST Breakdown Results Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Net / Base Amount:</span>
                    <span className="font-mono font-bold text-slate-200">₹{formatNumber(gstBaseAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">CGST ({(gstRate / 2).toFixed(1)}%):</span>
                    <span className="font-mono font-bold text-slate-300">₹{formatNumber(cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">SGST ({(gstRate / 2).toFixed(1)}%):</span>
                    <span className="font-mono font-bold text-slate-300">₹{formatNumber(sgstAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-700 pt-2">
                    <span className="text-amber-300 font-bold">Total Tax ({gstRate}%):</span>
                    <span className="font-mono font-bold text-amber-300">₹{formatNumber(gstTaxAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-700 pt-2">
                    <span className="font-black text-white">Gross Total:</span>
                    <span className="font-mono font-black text-xl text-emerald-400">
                      ₹{formatNumber(gstTotalAmount)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRecordGstToHistory}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-98"
                >
                  Save to Recent Calculations
                </button>
              </div>
            )}

            {/* 3. ADVANCED LOAN / EMI CALCULATOR */}
            {activeTab === "emi" && (
              <div className="flex flex-col gap-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                      Loan Principal (₹)
                    </label>
                    <input
                      type="number"
                      value={emiPrincipal}
                      onChange={(e) => setEmiPrincipal(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                        Interest Rate (% p.a.)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={emiRate}
                        onChange={(e) => setEmiRate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                        Tenure (Months)
                      </label>
                      <input
                        type="number"
                        value={emiTenureMonths}
                        onChange={(e) => setEmiTenureMonths(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* EMI Result Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Monthly EMI:</span>
                    <span className="font-mono font-black text-2xl text-emerald-400">
                      ₹{formatNumber(monthlyEmi)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-700/60 pt-2">
                    <span className="text-slate-400">Total Interest Payable:</span>
                    <span className="font-mono font-bold text-amber-300">
                      ₹{formatNumber(totalEmiInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Payment (Principal + Interest):</span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{formatNumber(totalEmiPayment)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRecordEmiToHistory}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-98"
                >
                  Save EMI to Recent Calculations
                </button>
              </div>
            )}

            {/* 4. PERCENTAGE UTILITIES */}
            {activeTab === "percentage" && (
              <div className="flex flex-col gap-4">
                {/* Mode Selector */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setPctType("whatIsXofY")}
                    className={`py-1.5 rounded-lg transition-all ${
                      pctType === "whatIsXofY"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    X% of Y
                  </button>
                  <button
                    onClick={() => setPctType("xIsWhatPctOfY")}
                    className={`py-1.5 rounded-lg transition-all ${
                      pctType === "xIsWhatPctOfY"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    X is what % of Y
                  </button>
                  <button
                    onClick={() => setPctType("pctChange")}
                    className={`py-1.5 rounded-lg transition-all ${
                      pctType === "pctChange"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    % Increase / Drop
                  </button>
                </div>

                {/* Input Fields */}
                {pctType !== "pctChange" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        {pctType === "whatIsXofY" ? "Percentage (X%)" : "Value (X)"}
                      </label>
                      <input
                        type="number"
                        value={pctX}
                        onChange={(e) => setPctX(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Total / Base (Y)
                      </label>
                      <input
                        type="number"
                        value={pctY}
                        onChange={(e) => setPctY(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Initial Value (From)
                      </label>
                      <input
                        type="number"
                        value={pctFrom}
                        onChange={(e) => setPctFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        New Value (To)
                      </label>
                      <input
                        type="number"
                        value={pctTo}
                        onChange={(e) => setPctTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Percentage Result Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">{pctExpressionLabel}:</span>
                    <span className="font-mono font-black text-2xl text-emerald-400">
                      {pctType === "whatIsXofY"
                        ? formatNumber(pctResult)
                        : `${formatNumber(pctResult)}%`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      saveHistory({
                        id: Date.now().toString(),
                        expression: pctExpressionLabel,
                        result:
                          pctType === "whatIsXofY"
                            ? formatNumber(pctResult)
                            : `${formatNumber(pctResult)}%`,
                        type: "Percentage",
                        timestamp: "Just now",
                      });
                    }}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RECENT CALCULATIONS (Matching Screenshot 1) */}
          <div className="md:col-span-5 flex flex-col border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Recent Calculations
              </h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Calculations List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[330px] pr-1">
              {history.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  No calculations yet. Use the keypad or utilities to compute.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>{item.expression}</span>
                      </div>
                      <div className="font-mono font-black text-sm text-slate-900 dark:text-white mt-0.5">
                        = {item.result}
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(item.result, item.id)}
                      title="Copy result"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors shrink-0"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

