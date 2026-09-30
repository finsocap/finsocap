"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Store,
  ChevronDown,
  Check,
  Search,
  Building2,
  MapPin,
  X,
  RotateCcw,
} from "lucide-react";

export interface BranchOption {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  address: string;
  code: string;
  leadsCount: number;
  revenueStr: string;
  isHQ?: boolean;
}

export const BRANCH_OPTIONS: BranchOption[] = [
  {
    id: "all",
    name: "All Branches",
    shortName: "All Branches",
    city: "Nationwide",
    state: "India (All 5 Hubs)",
    address: "Combined operations across all offices",
    code: "ALL",
    leadsCount: 1248,
    revenueStr: "₹8.72L",
  },
  {
    id: "delhi",
    name: "Delhi HQ",
    shortName: "Delhi HQ",
    city: "New Delhi",
    state: "Delhi NCR",
    address: "Statesman House, Barakhamba Rd, Connaught Place",
    code: "DEL",
    leadsCount: 512,
    revenueStr: "₹3.84L",
    isHQ: true,
  },
  {
    id: "noida",
    name: "Noida Branch",
    shortName: "Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    address: "B-Block, Stellar IT Park, Sector 62",
    code: "NOI",
    leadsCount: 224,
    revenueStr: "₹1.48L",
  },
  {
    id: "mumbai",
    name: "Mumbai Regional",
    shortName: "Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    address: "One BKC, G-Block, Bandra Kurla Complex",
    code: "MUM",
    leadsCount: 286,
    revenueStr: "₹2.12L",
  },
  {
    id: "bengaluru",
    name: "Bengaluru Tech Hub",
    shortName: "Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    address: "4th Block, 80 Feet Road, Koramangala",
    code: "BLR",
    leadsCount: 136,
    revenueStr: "₹88K",
  },
  {
    id: "kolkata",
    name: "Kolkata Hub",
    shortName: "Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    address: "Apeejay House, 15 Park Street",
    code: "KOL",
    leadsCount: 90,
    revenueStr: "₹40.5K",
  },
];

interface BranchFilterProps {
  value: string;
  onChange: (branch: BranchOption) => void;
  className?: string;
}

export default function BranchFilter({
  value,
  onChange,
  className = "",
}: BranchFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredBranches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return BRANCH_OPTIONS;
    return BRANCH_OPTIONS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectBranch = (branch: BranchOption) => {
    onChange(branch);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isAll = value === "All Branches";

  return (
    <>
      {/* Background Overlay when branch dropdown is open - Portaled to document.body to cover the entire page */}
      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 w-screen h-screen bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-[2px] z-40 transition-all duration-200 animate-in fade-in cursor-pointer"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />,
        document.body
      )}

      <div
        ref={containerRef}
        className={`relative inline-block ${isOpen ? "z-50" : "z-10"} ${className}`}
      >
        {/* Trigger Button - Exactly matches screenshot */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#0c1427] border text-xs font-semibold shadow-xs cursor-pointer transition-all duration-150 select-none ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20 text-blue-600 dark:text-sky-400 relative z-50 shadow-md"
              : !isAll
              ? "border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 text-blue-700 dark:text-sky-300"
              : "border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
        <Store
          className={`w-3.5 h-3.5 transition-colors ${
            isOpen || !isAll
              ? "text-blue-500 dark:text-sky-400"
              : "text-slate-400"
          }`}
        />
        <span className="truncate max-w-[140px] sm:max-w-[180px]">{value}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-500 dark:text-sky-400" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-auto mt-2 w-[310px] sm:w-[350px] bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Filter by Branch / Office
                </span>
              </div>

              {!isAll && (
                <button
                  type="button"
                  onClick={() =>
                    handleSelectBranch(
                      BRANCH_OPTIONS.find((b) => b.id === "all")!
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
                  title="Reset to All Branches"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Show All</span>
                </button>
              )}
            </div>

            {/* Branch Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search branch or city..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Branches List */}
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
            {filteredBranches.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No branch found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredBranches.map((branch) => {
                const isSelected = value === branch.name;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleSelectBranch(branch)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Branch Icon / Avatar */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : branch.isHQ
                            ? "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-700"
                        }`}
                      >
                        {branch.id === "all" ? (
                          <Store className="w-4 h-4" />
                        ) : (
                          <span>{branch.code}</span>
                        )}
                      </div>

                      {/* Branch Details */}
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? "text-blue-900 dark:text-sky-200"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {branch.name}
                          </span>
                          {branch.isHQ && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 uppercase tracking-tight shrink-0">
                              HQ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                          <span className="truncate">{branch.city}, {branch.state}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side stats & selection check */}
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {branch.leadsCount} leads
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {branch.revenueStr}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>5 Active Operational Hubs</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Selected: {value}
            </span>
          </div>
        </div>
      )}
    </div>
  </>
  );
}
