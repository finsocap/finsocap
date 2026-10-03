"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Users,
  ChevronDown,
  Check,
  Search,
  Building2,
  MapPin,
  X,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";

export interface PartnerOption {
  id: string; // "all", "P-101", etc.
  partnerId: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  leadsCount: number;
  revenueStr: string;
  activeTasks: number;
  phone: string;
  tier?: string;
}

export const PARTNER_OPTIONS: PartnerOption[] = [
  {
    id: "all",
    partnerId: "ALL",
    name: "All Partners",
    shortName: "All Partners",
    city: "Nationwide",
    state: "India (All 48 Partners)",
    leadsCount: 1248,
    revenueStr: "₹8.72L",
    activeTasks: 96,
    phone: "All Kiosks",
    tier: "Master Network",
  },
  {
    id: "p-101",
    partnerId: "P-101",
    name: "Rahul Jha (Patna Hub)",
    shortName: "P-101 • Rahul Jha",
    city: "Patna",
    state: "Bihar #FC104",
    leadsCount: 512,
    revenueStr: "₹3.84L",
    activeTasks: 38,
    phone: "+91 98732 07632",
    tier: "Gold Franchise",
  },
  {
    id: "p-102",
    partnerId: "P-102",
    name: "Kanhaiya (NCR Kiosk)",
    shortName: "P-102 • Kanhaiya",
    city: "Noida",
    state: "Uttar Pradesh",
    leadsCount: 224,
    revenueStr: "₹1.48L",
    activeTasks: 18,
    phone: "+91 70113 40730",
    tier: "Silver Franchise",
  },
  {
    id: "p-103",
    partnerId: "P-103",
    name: "Gaurav Sharma",
    shortName: "P-103 • Gaurav",
    city: "Mumbai",
    state: "Maharashtra",
    leadsCount: 286,
    revenueStr: "₹2.12L",
    activeTasks: 22,
    phone: "+91 93123 45678",
    tier: "Gold Franchise",
  },
  {
    id: "p-104",
    partnerId: "P-104",
    name: "Roshan Enterprises",
    shortName: "P-104 • Roshan",
    city: "Bengaluru",
    state: "Karnataka",
    leadsCount: 136,
    revenueStr: "₹88K",
    activeTasks: 12,
    phone: "+91 99988 87776",
    tier: "Bronze Franchise",
  },
  {
    id: "p-105",
    partnerId: "P-105",
    name: "Roshni Roy",
    shortName: "P-105 • Roshni",
    city: "Kolkata",
    state: "West Bengal",
    leadsCount: 90,
    revenueStr: "₹40.5K",
    activeTasks: 6,
    phone: "+91 88877 76655",
    tier: "Bronze Franchise",
  },
];

interface PartnerFilterProps {
  value: string;
  onChange: (partner: PartnerOption) => void;
  className?: string;
}

export default function PartnerFilter({
  value,
  onChange,
  className = "",
}: PartnerFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedPartner = useMemo(() => {
    return (
      PARTNER_OPTIONS.find(
        (p) =>
          p.name === value ||
          p.shortName === value ||
          p.partnerId === value ||
          (value === "All Partners" && p.id === "all")
      ) || PARTNER_OPTIONS[0]
    );
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return PARTNER_OPTIONS;
    const q = searchQuery.toLowerCase().trim();
    return PARTNER_OPTIONS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.partnerId.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (partner: PartnerOption) => {
    onChange(partner);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isCustomPartner = selectedPartner.id !== "all";

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button matching Screenshot 1 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border ${
          isCustomPartner
            ? "bg-blue-50/90 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-sky-300 ring-2 ring-blue-500/20"
            : "bg-white/80 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
        } backdrop-blur-md`}
      >
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            isCustomPartner
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
        </div>

        <div className="flex flex-col text-left leading-tight">
          <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
            Partner Filter
          </span>
          <span className="truncate max-w-[150px] font-extrabold text-slate-900 dark:text-white">
            {selectedPartner.shortName}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1.5 ${
            isOpen ? "rotate-180 text-blue-600 dark:text-sky-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
        >
          {/* Header */}
          <div className="px-2 pt-1 pb-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                Filter by Partner ID
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-sky-300">
                {PARTNER_OPTIONS.length - 1} Partners
              </span>
            </div>
            {isCustomPartner && (
              <button
                type="button"
                onClick={() => handleSelect(PARTNER_OPTIONS[0])}
                className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Partner ID, Name, or City…"
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Partner Options List */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No partners found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedPartner.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-extrabold text-xs truncate ${
                            isSelected
                              ? "text-white"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {opt.name}
                        </span>
                        {opt.tier && opt.id !== "all" && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                            }`}
                          >
                            {opt.partnerId}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10.5px] truncate flex items-center gap-1 mt-0.5 ${
                          isSelected
                            ? "text-blue-100"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span>
                          {opt.city} • {opt.state}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div
                        className={`text-xs font-black ${
                          isSelected
                            ? "text-white"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {opt.revenueStr}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isSelected
                            ? "text-blue-100"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {opt.activeTasks} tasks
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
