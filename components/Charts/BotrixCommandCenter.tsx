"use client";

import { useState } from "react";
import { 
  Activity, ArrowUpRight, CheckCircle2, Clock, 
  RotateCw, Terminal, Sliders, ShieldCheck, 
  Server, Zap, Layers, RefreshCw, Power, Settings,
  Play, Pause, AlertTriangle
} from "lucide-react";

export default function BotrixCommandCenter() {
  const [timeRange, setTimeRange] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [feedFilter, setFeedFilter] = useState<"All" | "Success" | "Failed" | "Paused">("All");

  // Interactive Portals & Tools Toggles (Botrix style)
  const [servicesToggles, setServicesToggles] = useState({
    mcaRoc: true,
    gstPortal: true,
    incomeTax: true,
    digiLocker: false,
  });

  const toggleService = (key: keyof typeof servicesToggles) => {
    setServicesToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Live Activity Feed Items
  const feedItems = [
    {
      id: "f-1",
      title: "Lead Qualification & KYC Verification",
      meta: "5 steps • MCA API + Aadhaar e-Sign",
      status: "Success",
      time: "08:42 PM",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      id: "f-2",
      title: "Weekly GST Invoicing & Reconciliation",
      meta: "3 steps • Tally Prime + GSTN Sync",
      status: "Paused",
      time: "08:31 PM",
      icon: Clock,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    },
    {
      id: "f-3",
      title: "Trademark IP Registry Batch Check",
      meta: "12 applications verified • Class 35 & 42",
      status: "Success",
      time: "07:15 PM",
      icon: Zap,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50",
    },
    {
      id: "f-4",
      title: "Direct Tax TDS Quarterly Audit",
      meta: "Form 26AS mismatch detected",
      status: "Failed",
      time: "06:40 PM",
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
    },
  ];

  const filteredFeed = feedItems.filter(item => {
    if (feedFilter === "All") return true;
    return item.status === feedFilter;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Upper Grid: Agent / Case Activity Spline Chart + Server / CA Status Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (7 cols): Operations Velocity Curve (Botrix Agent Activity) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header with Title and Daily / Weekly / Monthly Switcher */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Operations & Case Velocity
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Real-time pipeline execution and automated filing throughput
                </p>
              </div>

              {/* Pill Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                {(["Daily", "Weekly", "Monthly"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTimeRange(mode)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      timeRange === mode
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Legend Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Client Inquiries</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completed Filings</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>CA Audit Review</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Multi-Curve Spline Canvas */}
          <div className="relative w-full h-[220px] sm:h-[250px] my-2 select-none">
            {/* Interactive Tooltip Card matching Botrix */}
            <div className="absolute left-[54%] top-[12%] -translate-x-1/2 z-20 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 pointer-events-none animate-bounce-subtle">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                <span>+28.4%</span>
                <span className="text-[10px] text-slate-400 font-semibold">(vs yesterday)</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                84 Cases Executed @ 16:00
              </p>
            </div>

            {/* Dotted Vertical Timeline Indicator Line */}
            <div className="absolute left-[54%] top-4 bottom-8 w-px border-l-2 border-dashed border-indigo-400/60 dark:border-indigo-500/60 z-10 pointer-events-none" />

            <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
              <defs>
                {/* Gradient for Indigo Curve */}
                <linearGradient id="curveIndigo" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradient for Emerald Curve */}
                <linearGradient id="curveEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Background Grid Lines */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="180" x2="580" y2="180" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x="15" y="34" className="text-[10px] font-bold fill-slate-400">160</text>
              <text x="15" y="84" className="text-[10px] font-bold fill-slate-400">120</text>
              <text x="15" y="134" className="text-[10px] font-bold fill-slate-400">80</text>
              <text x="15" y="184" className="text-[10px] font-bold fill-slate-400">40</text>

              {/* Filled Area for Curve 1 */}
              <path
                d="M 50 180 C 130 180, 180 170, 240 140 C 300 110, 320 60, 380 50 C 440 40, 500 70, 570 60 L 570 190 L 50 190 Z"
                fill="url(#curveIndigo)"
              />

              {/* Curve 1: Client Inquiries (Indigo) */}
              <path
                d="M 50 180 C 130 180, 180 170, 240 140 C 300 110, 320 60, 380 50 C 440 40, 500 70, 570 60"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Curve 2: Completed Filings (Emerald) */}
              <path
                d="M 50 170 C 120 120, 180 150, 260 120 C 320 90, 390 120, 460 100 C 510 85, 540 120, 570 130"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Curve 3: CA Audit Review (Amber) */}
              <path
                d="M 50 190 C 130 190, 200 180, 280 160 C 340 140, 420 80, 480 90 C 520 100, 550 110, 570 115"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="5 3"
              />

              {/* Target Data Point Circle with Pulse */}
              <circle cx="324" cy="62" r="6" fill="#4f46e5" className="animate-pulse" />
              <circle cx="324" cy="62" r="3" fill="#ffffff" />
            </svg>

            {/* X Axis Time Labels */}
            <div className="flex items-center justify-between px-10 text-[10px] font-bold text-slate-400 -mt-2">
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">16:00</span>
              <span>20:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Server / Department Status Gauges (Botrix Server Status) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Node 1: Delhi HQ Primary Cluster */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    App Server - Delhi HQ 🇮🇳
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Running
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Ubuntu 24.04 • 8 vCPU • 32 GB RAM</p>
              </div>
            </div>

            {/* 3 Circular Speedometer / Arc Gauges */}
            <div className="grid grid-cols-3 gap-2 py-1">
              
              {/* Gauge 1: 42% CPU */}
              <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-600"
                      strokeDasharray="42, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-800 dark:text-slate-200">
                    42%
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">CPU</span>
              </div>

              {/* Gauge 2: 68% RAM */}
              <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600"
                      strokeDasharray="68, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-800 dark:text-slate-200">
                    68%
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">RAM</span>
              </div>

              {/* Gauge 3: 124 GB Bandwidth / Vault */}
              <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-sky-500"
                      strokeDasharray="78, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-slate-800 dark:text-slate-200">
                    124GB
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Vault</span>
              </div>

            </div>

            {/* Quick Action Buttons matching Botrix (Restart, SSH, Scale) */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <RotateCw className="w-3 h-3 text-slate-500" />
                <span>Restart</span>
              </button>
              <button className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Terminal className="w-3 h-3 text-slate-500" />
                <span>SSH</span>
              </button>
              <button className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Sliders className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                <span>Scale</span>
              </button>
            </div>
          </div>

          {/* Node 2: Secondary Backup Node - Mumbai */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Compliance Node - Mumbai 🇮🇳
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Standby
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Ubuntu 22.04 • 4 vCPU • 16 GB RAM</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-100 cursor-pointer" title="Start">
                  <Play className="w-3 h-3 fill-current" />
                </button>
                <button className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 cursor-pointer" title="Config">
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Lower Row: Live Activity Feed + Connected Portals & Services (matching Botrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Live Activity Feed (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Live Activity Feed
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Real-time operational triggers and background worker logs
              </p>
            </div>

            {/* Filter Pills matching Botrix (All, Success, Failed, Paused) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {(["All", "Success", "Failed", "Paused"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFeedFilter(filter)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    feedFilter === filter
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Rows */}
          <div className="space-y-2.5">
            {filteredFeed.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {item.meta}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.status === "Success" 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : item.status === "Paused"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                    }`}>
                      ● {item.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Tools & Services with iOS switches (5 cols) matching Botrix */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Connected Portals & Services
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Government gateways, OCR engines, and automated sync
              </p>
            </div>

            {/* List of services with iOS switch toggles */}
            <div className="space-y-3.5">
              
              {/* Service 1: MCA / ROC Portal */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 font-black text-xs flex items-center justify-center">
                    MCA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Ministry of Corporate Affairs
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">DIN, CIN, ROC auto-filing gateway</p>
                  </div>
                </div>

                {/* iOS Toggle */}
                <button
                  onClick={() => toggleService("mcaRoc")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    servicesToggles.mcaRoc ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      servicesToggles.mcaRoc ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Service 2: GSTN Portal & E-Way */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center">
                    GST
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      GSTN & E-Way Invoicing
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Direct GSTR-1 & 3B return sync</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleService("gstPortal")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    servicesToggles.gstPortal ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      servicesToggles.gstPortal ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Service 3: Income Tax & PAN OCR */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                    ITD
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Income Tax Department API
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">PAN 26AS verification & e-Verify</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleService("incomeTax")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    servicesToggles.incomeTax ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      servicesToggles.incomeTax ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Service 4: DigiLocker & Aadhaar */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-black text-xs flex items-center justify-center">
                    DL
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      DigiLocker Client Vault
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Auto-fetch Aadhaar, PAN & certificates</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleService("digiLocker")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    servicesToggles.digiLocker ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      servicesToggles.digiLocker ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
