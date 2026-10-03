"use client";

import { useState, useMemo } from "react";
import { 
  Users, CheckSquare, IndianRupee, Download, Calendar, 
  TrendingUp, CheckCircle2, Clock, AlertTriangle, ArrowUp,
  User, ChevronDown, Check, RotateCcw, Filter, Sparkles,
  FileSpreadsheet, Search
} from "lucide-react";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import ConversionFunnelStream from "@/components/Charts/ConversionFunnelStream";
import DateRangeFilter from "@/components/Dashboard/DateRangeFilter";
import BranchFilter from "@/components/Dashboard/BranchFilter";
import PageBanner from "@/components/Dashboard/PageBanner";

interface SalesPersonPerf {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
  clients: number;
  tasks: number;
  completed: number;
  pending: number;
  completionRate: string;
  proFees: number;
  received: number;
  pendingAmount: number;
  collectionRate: string;
}

const salesData: SalesPersonPerf[] = [
  { id: "SLS001", name: "Rahul Jha", initials: "RJ", avatarColor: "bg-blue-600 text-white", clients: 48, tasks: 120, completed: 110, pending: 10, completionRate: "91.7%", proFees: 256800, received: 205400, pendingAmount: 51400, collectionRate: "80.0%" },
  { id: "SLS002", name: "Kanhaiya", initials: "K", avatarColor: "bg-emerald-600 text-white", clients: 36, tasks: 98, completed: 82, pending: 16, completionRate: "83.7%", proFees: 184600, received: 132900, pendingAmount: 51700, collectionRate: "72.0%" },
  { id: "SLS003", name: "Gaurav", initials: "G", avatarColor: "bg-amber-600 text-white", clients: 28, tasks: 76, completed: 68, pending: 8, completionRate: "89.5%", proFees: 125400, received: 92800, pendingAmount: 32600, collectionRate: "74.0%" },
  { id: "SLS004", name: "Roshan", initials: "R", avatarColor: "bg-purple-600 text-white", clients: 22, tasks: 54, completed: 50, pending: 4, completionRate: "92.6%", proFees: 68300, received: 54200, pendingAmount: 14100, collectionRate: "79.4%" },
  { id: "SLS005", name: "Roshni", initials: "RS", avatarColor: "bg-pink-600 text-white", clients: 18, tasks: 42, completed: 38, pending: 4, completionRate: "90.5%", proFees: 38900, received: 26800, pendingAmount: 12100, collectionRate: "69.0%" },
];

export default function SalesTeamReportPage() {
  const [selectedPerson, setSelectedPerson] = useState("ALL");
  const [isPersonOpen, setIsPersonOpen] = useState(false);
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 30 Sep 2026");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [tableSearch, setTableSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Filtered dataset
  const filtered = useMemo(() => {
    return salesData.filter((s) => {
      const matchPerson = selectedPerson === "ALL" || s.name === selectedPerson;
      const matchSearch = tableSearch === "" || 
        s.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
        s.id.toLowerCase().includes(tableSearch.toLowerCase());
      return matchPerson && matchSearch;
    });
  }, [selectedPerson, tableSearch]);

  // Aggregate stats based on selection
  const kpiStats = useMemo(() => {
    const activeRows = selectedPerson === "ALL" 
      ? salesData 
      : salesData.filter((s) => s.name === selectedPerson);

    const totalClients = activeRows.reduce((sum, r) => sum + r.clients, 0);
    const totalTasks = activeRows.reduce((sum, r) => sum + r.tasks, 0);
    const completedTasks = activeRows.reduce((sum, r) => sum + r.completed, 0);
    const pendingTasks = activeRows.reduce((sum, r) => sum + r.pending, 0);
    const totalProFees = activeRows.reduce((sum, r) => sum + r.proFees, 0);
    const totalReceived = activeRows.reduce((sum, r) => sum + r.received, 0);
    const totalPendingAmt = activeRows.reduce((sum, r) => sum + r.pendingAmount, 0);

    const formatCurrency = (amt: number) => {
      if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)}L`;
      if (amt >= 1000) return `₹${(amt / 1000).toFixed(1)}K`;
      return `₹${amt}`;
    };

    return {
      peopleCount: activeRows.length,
      totalClients,
      totalTasks,
      completedTasks,
      pendingTasks,
      proFeesStr: formatCurrency(totalProFees),
      receivedStr: formatCurrency(totalReceived),
      pendingAmtStr: formatCurrency(totalPendingAmt),
      completionPercent: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0",
      pendingPercent: totalTasks > 0 ? ((pendingTasks / totalTasks) * 100).toFixed(1) : "0",
    };
  }, [selectedPerson]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Franchise Partner Performance Report exported successfully!");
    }, 800);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header with Full Operational Controls (Official Finsocap Theme) */}
      <PageBanner
        icon={TrendingUp}
        badge="Franchise Operations"
        badgeMeta="Partner Analytics & Conversion Telemetry"
        title="Franchise Partner Report"
        description="Franchise partner-wise client conversion, task pipeline status and collections report."
        bottomMeta={`Partner: ${selectedPerson === "ALL" ? "All Franchise Partners" : selectedPerson} • Branch: ${selectedBranch}`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Selector */}
            <DateRangeFilter
              value={dateRange}
              onChange={(preset) => setDateRange(preset.label)}
            />

            {/* Branch Selector */}
            <BranchFilter
              value={selectedBranch}
              onChange={(b) => setSelectedBranch(b.name)}
            />

            {/* Sleek Custom Franchise Partner Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPersonOpen(!isPersonOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>{selectedPerson === "ALL" ? "All Franchise Partners" : selectedPerson}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isPersonOpen ? "rotate-180" : ""}`} />
              </button>

              {isPersonOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPersonOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Select Franchise Partner
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPerson("ALL");
                      setIsPersonOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                      selectedPerson === "ALL"
                        ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                        ALL
                      </span>
                      <span>All Franchise Partners</span>
                    </div>
                    {selectedPerson === "ALL" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  {salesData.map((s) => {
                    const isSelected = selectedPerson === s.name;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedPerson(s.name);
                          setIsPersonOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 font-bold"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${s.avatarColor}`}>
                            {s.initials}
                          </span>
                          <span>{s.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{s.clients} clients</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                  </div>
                </>
              )}
            </div>

            {/* Export Report Button */}
            <button 
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary-vibrant text-xs py-2 px-3.5 shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Export Report"}</span>
            </button>
          </div>
        }
      />

      {/* Active Filter Notice if non-default */}
      {(selectedPerson !== "ALL" || selectedBranch !== "All Branches") && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/90 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-700 dark:text-slate-300">
              Active Filter: <strong>{selectedPerson === "ALL" ? "All Franchise Partners" : selectedPerson}</strong> &bull; <strong>{selectedBranch}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedPerson("ALL");
              setSelectedBranch("All Branches");
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* 2. Premium Conversion Funnel & Pipeline Stream Infographic */}
      <ConversionFunnelStream salesPerson={selectedPerson} />

      {/* 3. 8 Responsive KPI Cards - Dynamically calculated */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Franchise Partners</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{kpiStats.peopleCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Active team</span>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Clients</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{kpiStats.totalClients}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+8% this mo</span>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{kpiStats.totalTasks}</p>
          <span className="text-[10px] text-slate-400 font-medium">In workflow</span>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpiStats.completedTasks}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{kpiStats.completionPercent}% SLA</span>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpiStats.pendingTasks}</p>
          <span className="text-[10px] text-amber-600 font-medium">{kpiStats.pendingPercent}% wip</span>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pro Fees</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{kpiStats.proFeesStr}</p>
          <span className="text-[10px] text-slate-400 font-medium">Billed value</span>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Received</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpiStats.receivedStr}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Collected</span>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending Amt</p>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{kpiStats.pendingAmtStr}</p>
          <span className="text-[10px] text-rose-500 font-medium">Due balance</span>
        </div>
      </div>

      {/* 4. Visuals: Donut Task Status + Top Sales Persons Bar Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Donut: Task Status */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
              Task Status Breakdown
            </h2>
            <p className="text-[11px] text-slate-400">
              {kpiStats.totalTasks} client applications under management
            </p>
          </div>

          <div className="flex items-center justify-around py-5">
            <div 
              className="relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500" 
              style={{ 
                background: `conic-gradient(#10b981 0% ${kpiStats.completionPercent}%, #f59e0b ${kpiStats.completionPercent}% 100%)` 
              }}
            >
              <div className="w-24 h-24 rounded-full bg-white dark:bg-[#0c1427] flex flex-col items-center justify-center shadow-xs">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {kpiStats.totalTasks}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  Tasks
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-bold">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block text-[11px]">Completed</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {kpiStats.completedTasks} ({kpiStats.completionPercent}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block text-[11px]">Pending / WIP</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                    {kpiStats.pendingTasks} ({kpiStats.pendingPercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Graph: Top Sales Persons */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                Franchise Partner Leaderboard (By Collections)
              </h2>
              <p className="text-[11px] text-slate-400">Ranked by verified client collections received</p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              FY 2026-27
            </span>
          </div>

          <div className="h-44 flex items-end justify-around pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {salesData.map((p, i) => {
              const isSelected = selectedPerson === p.name;
              const isDimmed = selectedPerson !== "ALL" && !isSelected;
              const maxAmt = 256800;
              const heightPct = Math.round((p.received / maxAmt) * 85);

              return (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPerson(p.name)}
                  className={`flex flex-col items-center gap-1.5 w-16 cursor-pointer transition-all duration-200 ${
                    isDimmed ? "opacity-35" : "opacity-100"
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                    ₹{(p.received / 1000).toFixed(0)}K
                  </span>
                  <div 
                    className={`w-11 rounded-t-xl transition-all duration-300 ${
                      isSelected 
                        ? "bg-blue-600 ring-2 ring-blue-400 dark:ring-blue-300" 
                        : i === 0 
                        ? "bg-blue-600" 
                        : i === 1 
                        ? "bg-emerald-500" 
                        : i === 2 
                        ? "bg-amber-500" 
                        : i === 3 
                        ? "bg-purple-500" 
                        : "bg-rose-500"
                    }`} 
                    style={{ height: `${heightPct}%` }} 
                  />
                  <div className="text-center mt-1">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[65px]">
                      {p.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {p.collectionRate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Sales Person Performance Table with Live Search */}
      <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
              Franchise Partner Performance & Collection
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Individual franchise partner breakdown of client workload and collection rates.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search partner or ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                <th className="py-3.5 px-4">Partner ID</th>
                <th className="py-3.5 px-4">Partner Name</th>
                <th className="py-3.5 px-4 text-center">Clients</th>
                <th className="py-3.5 px-4 text-center">Tasks</th>
                <th className="py-3.5 px-4 text-center">Completed</th>
                <th className="py-3.5 px-4 text-center">Pending</th>
                <th className="py-3.5 px-4 text-center">Completion Rate</th>
                <th className="py-3.5 px-4 text-right">Professional Fees</th>
                <th className="py-3.5 px-4 text-right">Received</th>
                <th className="py-3.5 px-4 text-right">Pending Amount</th>
                <th className="py-3.5 px-4 text-right">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((s) => (
                <tr 
                  key={s.id} 
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedPerson === s.name ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-sky-400">
                    {s.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 ${s.avatarColor}`}>
                        {s.initials}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold">
                    {s.clients}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-purple-600 dark:text-purple-400">
                    {s.tasks}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {s.completed}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-600 dark:text-amber-400">
                    {s.pending}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] border border-emerald-200/60 dark:border-emerald-800/60">
                      {s.completionRate}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold">
                    ₹{s.proFees.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                    ₹{s.received.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                    ₹{s.pendingAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-blue-600 dark:text-sky-400">
                    {s.collectionRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
