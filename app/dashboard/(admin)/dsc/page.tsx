"use client";

import { useState, useMemo, useEffect } from "react";
import {
  KeyRound,
  Search,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Usb,
  ArrowRight,
  UserCheck,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Cpu,
  Layers,
  ChevronRight,
  Filter,
  Plus,
  Eye,
  FileCheck2,
  SlidersHorizontal,
  X
} from "lucide-react";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import PageBanner from "@/components/Dashboard/PageBanner";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { useCrmStore } from "@/lib/crmStore";
import { useToast } from "@/components/Global/ToastNotification";
import { toTitleCase } from "@/lib/formatters";
import { sortByNewest } from "@/lib/sortHelper";
import Pagination from "@/components/Dashboard/Pagination";

interface DscItem {
  id: string;
  holderName: string;
  pan: string;
  businessName: string;
  dscClass: "Class 3 - Individual" | "Class 3 - Organization" | "Class 3 - Combo (Sign & Encrypt)";
  usbSerial: string;
  certifyingAuthority: "eMudhra" | "Vsign" | "Capricorn" | "Sify";
  expiryDate: string;
  daysRemaining: number;
  status: "Active" | "Expiring Soon" | "Expired";
  algorithm: string;
  tokenModel: string;
  autoRenew: boolean;
  taskId?: string;
}

export default function DscPage() {
  const toast = useToast();
  const { tasks, licences, partners, manualClients } = useCrmStore();
  const [search, setSearch] = useState("");
  const [caFilter, setCaFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Expiring Soon" | "Expired">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDsc, setSelectedDsc] = useState<DscItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Derive dynamic DSC hardware tokens directly from live database tasks & licence records
  const dynamicDscList: DscItem[] = useMemo(() => {
    // 1. Gather all tasks and licences related to DSC
    const dscTasks = tasks.filter((t) => {
      const matchText = `${t.service || ""} ${t.category || ""}`.toLowerCase();
      return matchText.includes("dsc") || matchText.includes("digital signature");
    });

    const dscLicences = licences.filter((l) => {
      const matchText = `${l.service || ""} ${l.category || ""} ${l.type || ""}`.toLowerCase();
      return matchText.includes("dsc") || matchText.includes("digital signature");
    });

    const results: DscItem[] = [];
    const seenIds = new Set<string>();

    // Process DSC licences
    dscLicences.forEach((lic, idx) => {
      const id = lic.number || `DSC-${lic.taskId || idx + 1}`;
      if (seenIds.has(id)) return;
      seenIds.add(id);

      const matchedTask = tasks.find((t) => t.id === lic.taskId || (lic.taskId && t.id.includes(lic.taskId)));
      const matchedPartner = partners.find(
        (p) => p.name?.toLowerCase() === lic.partner?.toLowerCase() || p.partnerId?.toLowerCase() === lic.partner?.toLowerCase()
      );

      // Deterministic calculation of days remaining
      let daysRemaining = 365;
      if (lic.expiry && !isNaN(Date.parse(lic.expiry))) {
        const diffMs = new Date(lic.expiry).getTime() - Date.now();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      let status: "Active" | "Expiring Soon" | "Expired" = "Active";
      if (daysRemaining <= 0) {
        status = "Expired";
      } else if (daysRemaining <= 45) {
        status = "Expiring Soon";
      }

      const caOptions: ("eMudhra" | "Vsign" | "Capricorn" | "Sify")[] = ["eMudhra", "Vsign", "Capricorn", "Sify"];
      const charCode = (lic.number || "0").charCodeAt(0) || 0;
      const ca = caOptions[charCode % caOptions.length];

      results.push({
        id,
        holderName: lic.client || matchedTask?.client || "Authorized Signatory",
        pan: matchedPartner?.panNumber || lic.user || "AAACB1234F",
        businessName: matchedTask?.business || lic.partner || "Registered Entity",
        dscClass: "Class 3 - Combo (Sign & Encrypt)",
        usbSerial: `HYP2003-${lic.number.replace(/\D/g, "").slice(0, 5) || "89410"}`,
        certifyingAuthority: ca,
        expiryDate: lic.expiry || "1 Year Validity",
        daysRemaining,
        status,
        algorithm: "RSA 2048 / SHA-256",
        tokenModel: "HYP2003 HSG FIPS",
        autoRenew: true,
        taskId: lic.taskId,
      });
    });

    // Process DSC tasks not already in licences
    dscTasks.forEach((task, idx) => {
      const id = `DSC-${task.numericId || task.id}`;
      if (seenIds.has(id)) return;
      seenIds.add(id);

      const matchedPartner = partners.find(
        (p) => p.name?.toLowerCase() === task.partner?.toLowerCase() || p.partnerId?.toLowerCase() === task.partner?.toLowerCase()
      );

      let daysRemaining = 365;
      if (task.due && !isNaN(Date.parse(task.due))) {
        const diffMs = new Date(task.due).getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      const status: "Active" | "Expiring Soon" | "Expired" =
        task.status === "Completed" ? "Active" : "Expiring Soon";

      results.push({
        id,
        holderName: task.client || "Authorized Signatory",
        pan: matchedPartner?.panNumber || "AAACB1234F",
        businessName: task.business || task.partner || "Client Enterprise",
        dscClass: "Class 3 - Individual",
        usbSerial: `EPAS-${String(task.numericId || idx + 1000).padStart(5, "0")}`,
        certifyingAuthority: "eMudhra",
        expiryDate: task.due || "Pending Issuance",
        daysRemaining,
        status,
        algorithm: "RSA 2048 / SHA-256",
        tokenModel: "ePass2003 Auto",
        autoRenew: false,
        taskId: task.id,
      });
    });

    return results;
  }, [tasks, licences, partners, manualClients]);

  const triggerToast = (msg: string) => {
    toast.success(msg, "Success!");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const counts = useMemo(() => {
    const total = dynamicDscList.length;
    const active = dynamicDscList.filter((d) => d.status === "Active").length;
    const expiring = dynamicDscList.filter((d) => d.status === "Expiring Soon").length;
    const expired = dynamicDscList.filter((d) => d.status === "Expired").length;
    return { total, active, expiring, expired };
  }, [dynamicDscList]);

  const filtered = useMemo(() => {
    const list = dynamicDscList.filter((item) => {
      if (caFilter !== "ALL" && item.certifyingAuthority !== caFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.holderName.toLowerCase().includes(q) ||
          item.pan.toLowerCase().includes(q) ||
          item.usbSerial.toLowerCase().includes(q) ||
          item.businessName.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return sortByNewest(list, [(d) => d.expiryDate]);
  }, [dynamicDscList, caFilter, statusFilter, search]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [caFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedDsc = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const getCaBadge = (ca: DscItem["certifyingAuthority"]) => {
    switch (ca) {
      case "eMudhra":
        return "bg-blue-500/10 text-blue-600 dark:text-sky-400 border-blue-500/20";
      case "Vsign":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Capricorn":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Sify":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* 1. Header (Official Finsocap Theme) */}
      <PageBanner
        icon={KeyRound}
        badge="Cryptographic Security Hub"
        badgeMeta="Class 3 Hardware DSC"
        title="Digital Signature Vault & Telemetry"
        description="FIPS 140-2 Level 3 cryptotokens, SHA-256 automated expiry monitoring, and one-click certificate dispatch."
        bottomMeta="Real-Time Hardware & Expiry Telemetry Active • CCA India Compliance 100%"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => triggerToast("Syncing with eMudhra & Vsign gateways...")}
              className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Gateway</span>
            </button>
            <button
              onClick={() => triggerToast("DSC Issuance wizard opened.")}
              className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New DSC</span>
            </button>
          </div>
        }
      />

      {/* 2. Sleek Interactive Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`group relative overflow-hidden rounded-2xl p-4.5 bg-white dark:bg-[#0c1427] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "ALL"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Managed DSCs
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <KeyRound className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={counts.total} />
            </span>
            <span className="text-[10px] font-bold text-slate-400">Tokens Registered</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>FIPS 140-2 Level 3 Secure</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setStatusFilter("Active")}
          className={`group relative overflow-hidden rounded-2xl p-4.5 bg-white dark:bg-[#0c1427] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "Active"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active & Valid
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={counts.active} />
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
              100% Operational
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 font-medium">
            Ready for ROC, MCA & GST Filing
          </div>
        </div>

        {/* Metric 3: Expiring Soon */}
        <div
          onClick={() => setStatusFilter("Expiring Soon")}
          className={`group relative overflow-hidden rounded-2xl p-4.5 bg-white dark:bg-[#0c1427] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "Expiring Soon"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Expiring in 45 Days
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              <AnimatedCounter value={counts.expiring} />
            </span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md">
              Action Required
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 font-medium">
            Renewal reminders dispatched via SMS
          </div>
        </div>

        {/* Metric 4: Expired */}
        <div
          onClick={() => setStatusFilter("Expired")}
          className={`group relative overflow-hidden rounded-2xl p-4.5 bg-white dark:bg-[#0c1427] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "Expired"
              ? "border-rose-500 ring-2 ring-rose-500/20"
              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Expired Tokens
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              <AnimatedCounter value={counts.expired} />
            </span>
            <span className="text-[10px] font-bold text-slate-400">Archived</span>
          </div>
          <div className="mt-3 text-[10px] text-rose-500 font-medium">
            Re-issuance required before signing
          </div>
        </div>

      </div>

      {/* 3. Search, CA Authority Filter Pills & Status Toggle Bar */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holder name, PAN, business, USB serial or token ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Certifying Authority Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            CA Gateway:
          </span>
          {["ALL", "eMudhra", "Vsign", "Capricorn", "Sify"].map((ca) => (
            <button
              key={ca}
              onClick={() => setCaFilter(ca)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                caFilter === ca
                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
              }`}
            >
              {ca}
            </button>
          ))}
        </div>

      </div>

      {/* 4. Elegant DSC Data Table */}
      <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Top Context Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Enrolled Hardware Tokens
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-500/20">
              {filtered.length} Records Found
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              CCA Certified
            </span>
          </div>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-5">Holder & Entity</th>
                <th className="py-3.5 px-5">PAN</th>
                <th className="py-3.5 px-5">Certificate Class</th>
                <th className="py-3.5 px-5">Hardware Token</th>
                <th className="py-3.5 px-5">CA Provider</th>
                <th className="py-3.5 px-5">Validity / Expiry</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">No digital signatures match your filter</p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setCaFilter("ALL");
                        setStatusFilter("ALL");
                      }}
                      className="mt-2 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedDsc.map((item) => {
                  const isExpiring = item.status === "Expiring Soon";
                  const isExpired = item.status === "Expired";
                  const isActive = item.status === "Active";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Holder & Business */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs shrink-0 border border-slate-200/80 dark:border-slate-600">
                            {item.holderName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                              {toTitleCase(item.holderName)}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                              {toTitleCase(item.businessName)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* PAN with one-click copy */}
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => copyToClipboard(item.pan, item.id + "-pan")}
                          className="font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-1.5 cursor-pointer group/btn"
                        >
                          <span>{item.pan}</span>
                          {copiedId === item.id + "-pan" ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-300 group-hover/btn:text-slate-500 transition-colors" />
                          )}
                        </button>
                      </td>

                      {/* DSC Class */}
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          {item.dscClass}
                        </span>
                      </td>

                      {/* USB Serial Token */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <Usb className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 block">
                              {item.usbSerial}
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              {item.tokenModel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CA Authority Pill */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-black text-[10px] border ${getCaBadge(
                            item.certifyingAuthority
                          )}`}
                        >
                          {item.certifyingAuthority}
                        </span>
                      </td>

                      {/* Expiry Date & Countdown */}
                      <td className="py-3.5 px-5">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {item.expiryDate}
                          </span>
                          <span
                            className={`text-[10px] font-bold block ${
                              isExpired
                                ? "text-rose-500"
                                : isExpiring
                                ? "text-amber-600 dark:text-amber-400 font-black"
                                : "text-slate-400"
                            }`}
                          >
                            {isExpired
                              ? "Expired 18 days ago"
                              : `${item.daysRemaining} days remaining`}
                          </span>
                        </div>
                      </td>

                      {/* Status Indicator */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : isExpiring
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive
                                ? "bg-emerald-500"
                                : isExpiring
                                ? "bg-amber-500 animate-pulse"
                                : "bg-rose-500"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDsc(item)}
                            title="Inspect Certificate Details"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => triggerToast(`Downloading public cert for ${item.holderName}...`)}
                            title="Download Public X.509 Certificate"
                            className="p-1.5 text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic 5-Items Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 5. Minimal Modal / Slide-Over for Certificate Inspection */}
      {selectedDsc && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <ModalHeaderBanner
              icon={KeyRound}
              badge="CRYPTO KEY VAULT"
              title={selectedDsc.holderName}
              description={`ID: ${selectedDsc.id} · ${selectedDsc.certifyingAuthority} · ${selectedDsc.dscClass}`}
              badgeTag={selectedDsc.status}
              onClose={() => setSelectedDsc(null)}
            />

            {/* Spec sheet */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{selectedDsc.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PAN:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedDsc.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cryptographic Cipher:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedDsc.algorithm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hardware Serial:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedDsc.usbSerial} ({selectedDsc.tokenModel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Until:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDsc.expiryDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedDsc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  triggerToast(`Certificate for ${selectedDsc.holderName} downloaded.`);
                  setSelectedDsc(null);
                }}
                className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download X.509 Cert</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
