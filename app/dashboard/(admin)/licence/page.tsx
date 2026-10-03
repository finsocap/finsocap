"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Link2, Search,
  Download, Eye, EyeOff, Edit3, Trash2, X, Check, Paperclip,
  ChevronLeft, ChevronRight, Phone, ShieldCheck, Award, KeyRound,
  RotateCcw, Sparkles
} from "lucide-react";
import { useCrmStore, LicenceModel } from "@/lib/crmStore";
import DateRangeFilter from "@/components/Dashboard/DateRangeFilter";
import PageBanner from "@/components/Dashboard/PageBanner";

export default function LicenceReportPage() {
  const { licences, updateLicence, deleteLicence } = useCrmStore();

  // Search & Filter States (Screenshot 3 Exact Match)
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assignedFilter, setAssignedFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 30 Sep 2026");

  // Pagination State
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Password visibility map (licence number -> boolean)
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modals
  const [viewModalLicence, setViewModalLicence] = useState<LicenceModel | null>(null);
  const [modifyModalLicence, setModifyModalLicence] = useState<LicenceModel | null>(null);
  const [deleteConfirmLicence, setDeleteConfirmLicence] = useState<LicenceModel | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modify Form State
  const [editNumber, setEditNumber] = useState("");
  const [editType, setEditType] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editService, setEditService] = useState("");
  const [editIssue, setEditIssue] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [editUser, setEditUser] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editStatus, setEditStatus] = useState<LicenceModel["status"]>("Active");
  const [showEditPassword, setShowEditPassword] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const togglePassword = (num: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  // KPIs
  const totalLicencesCount = licences.length;
  const activeCount = licences.filter((l) => l.status === "Active").length;
  const expiringCount = licences.filter((l) => l.status === "Expiring Soon" || l.status === "Expiring in 30 Days").length;
  const expiredCount = licences.filter((l) => l.status === "Expired").length;
  const urlLinkedCount = licences.filter((l) => l.url).length;
  const urlNotLinkedCount = licences.filter((l) => !l.url).length;

  // Filter Options derived from data
  const distinctTypes = useMemo(() => {
    const s = new Set<string>();
    licences.forEach((l) => l.type && s.add(l.type));
    return Array.from(s);
  }, [licences]);

  const distinctCategories = useMemo(() => {
    const s = new Set<string>();
    licences.forEach((l) => l.category && s.add(l.category));
    return Array.from(s);
  }, [licences]);

  const distinctServices = useMemo(() => {
    const s = new Set<string>();
    licences.forEach((l) => l.service && s.add(l.service));
    return Array.from(s);
  }, [licences]);

  const distinctAssignees = useMemo(() => {
    const s = new Set<string>();
    licences.forEach((l) => {
      if (l.assignedTo) s.add(l.assignedTo);
      if (l.partner) s.add(l.partner);
    });
    return Array.from(s);
  }, [licences]);

  // Filtered rows
  const filteredLicences = useMemo(() => {
    return licences.filter((lic) => {
      if (typeFilter !== "ALL" && lic.type !== typeFilter) return false;
      if (categoryFilter !== "ALL" && lic.category !== categoryFilter) return false;
      if (serviceFilter !== "ALL" && lic.service !== serviceFilter) return false;
      if (statusFilter !== "ALL") {
        if (statusFilter === "Expiring in 30 Days") {
          if (lic.status !== "Expiring Soon" && lic.status !== "Expiring in 30 Days") return false;
        } else if (lic.status !== statusFilter) {
          return false;
        }
      }
      if (assignedFilter !== "ALL" && lic.partner !== assignedFilter && lic.assignedTo !== assignedFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          lic.partner.toLowerCase().includes(q) ||
          lic.client.toLowerCase().includes(q) ||
          lic.number.toLowerCase().includes(q) ||
          lic.task.toLowerCase().includes(q) ||
          (lic.user && lic.user.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [licences, typeFilter, categoryFilter, serviceFilter, statusFilter, assignedFilter, search]);

  // Paginated Rows
  const totalPages = Math.ceil(filteredLicences.length / rowsPerPage) || 1;
  const paginatedLicences = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLicences.slice(start, start + rowsPerPage);
  }, [filteredLicences, currentPage, rowsPerPage]);

  // Handle Export
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Task ID", "Partner Name", "Partner Contact", "Client Name", "Client Contact", "Licence Type", "Category", "Service", "Licence Number", "Issue Date", "Expiry Date", "User ID", "Status"].join(","),
        ...filteredLicences.map((l) =>
          [l.task, `"${l.partner}"`, l.partnerPhone, `"${l.client}"`, l.phone, `"${l.type}"`, `"${l.category}"`, `"${l.service}"`, l.number, l.issue, l.expiry, l.user, l.status].join(",")
        ),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Finsocap_Licence_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Licence Report exported to CSV successfully!");
  };

  // Open Modify Modal
  const openModifyModal = (lic: LicenceModel) => {
    setModifyModalLicence(lic);
    setEditNumber(lic.number);
    setEditType(lic.type);
    setEditCategory(lic.category);
    setEditService(lic.service);
    setEditIssue(lic.issue);
    setEditExpiry(lic.expiry);
    setEditUser(lic.user || "");
    setEditPassword(lic.password || "");
    setEditStatus(lic.status);
    setShowEditPassword(false);
  };

  // Save Modified Licence
  const handleSaveModify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyModalLicence) return;

    updateLicence(modifyModalLicence.number, {
      number: editNumber.trim(),
      type: editType,
      category: editCategory,
      service: editService,
      issue: editIssue,
      expiry: editExpiry,
      user: editUser.trim(),
      password: editPassword.trim(),
      status: editStatus,
    });

    setModifyModalLicence(null);
    showToast(`Licence ${editNumber} modified and saved successfully!`);
  };

  // Delete Licence
  const handleDeleteLicence = () => {
    if (!deleteConfirmLicence) return;
    deleteLicence(deleteConfirmLicence.number);
    showToast(`Licence ${deleteConfirmLicence.number} deleted successfully.`);
    setDeleteConfirmLicence(null);
  };

  // Select all checkboxes toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedLicences.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedLicences.map((l) => l.number));
    }
  };

  const toggleSelectOne = (num: string) => {
    setSelectedIds((prev) =>
      prev.includes(num) ? prev.filter((id) => id !== num) : [...prev, num]
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner & Controls (Official Finsocap Theme) */}
      <PageBanner
        icon={Award}
        badge="Regulatory Compliance"
        badgeMeta="Central & State Licensing Telemetry"
        title={`Licence Report (${totalLicencesCount})`}
        description="List of all completed licences with detailed information, statutory credentials, and documents."
        bottomMeta={`Filter: ${typeFilter !== "ALL" ? typeFilter : "All Types"} • ${paginatedLicences.length} Displayed`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <DateRangeFilter value={dateRange} onChange={(p) => setDateRange(p.label)} />

            <button
              type="button"
              onClick={handleExport}
              className="btn-primary-vibrant text-xs py-2.5 px-4 shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        }
      />

      {/* 2. 6 KPI Summary Cards (Screenshot 3 Exact Match) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Licences */}
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Licences</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {totalLicencesCount}
          </p>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active</span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {activeCount}
          </p>
        </div>

        {/* Card 3: Expiring in 30 Days */}
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Expiring in 30 Days</span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            {expiringCount}
          </p>
        </div>

        {/* Card 4: Expired */}
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Expired</span>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
            {expiredCount}
          </p>
        </div>

        {/* Card 5: URL Linked */}
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">URL Linked</span>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">
            {urlLinkedCount}
          </p>
        </div>

        {/* Card 6: URL Not Linked */}
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">URL Not Linked</span>
          </div>
          <p className="text-2xl font-black text-slate-500 dark:text-slate-400 mt-1.5">
            {urlNotLinkedCount}
          </p>
        </div>
      </div>

      {/* 3. Multi-Filter Bar (Screenshot 3 Exact Match) */}
      <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by partner name, client name, licence number..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs font-medium focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Licence Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="ALL">All Types</option>
          {distinctTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Task Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {distinctCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Service Name Filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="ALL">All Services</option>
          {distinctServices.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Expiring in 30 Days">Expiring in 30 Days</option>
          <option value="Expired">Expired</option>
        </select>

        {/* Assigned To Filter (Franchise Partner / Employee) */}
        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="ALL">All Franchise Partners / Employees</option>
          {distinctAssignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
        >
          Filter
        </button>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setTypeFilter("ALL");
            setCategoryFilter("ALL");
            setServiceFilter("ALL");
            setStatusFilter("ALL");
            setAssignedFilter("ALL");
          }}
          className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* 4. Licence Report Data Table (Screenshot 3 Exact Match with View, Modify, and Delete Actions) */}
      <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 bg-slate-50/70 dark:bg-slate-900/70">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === paginatedLicences.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 text-center">#</th>
                <th className="py-3 px-3">Task ID</th>
                <th className="py-3 px-3">Partner Name</th>
                <th className="py-3 px-3">Partner Number</th>
                <th className="py-3 px-3">Client Name</th>
                <th className="py-3 px-3">Client Number</th>
                <th className="py-3 px-3">Licence Type</th>
                <th className="py-3 px-3">Task Category</th>
                <th className="py-3 px-3">Service Name</th>
                <th className="py-3 px-3">Licence Number</th>
                <th className="py-3 px-3">Issue Date</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">User ID</th>
                <th className="py-3 px-3">Password</th>
                <th className="py-3 px-3 text-center">Attachments</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedLicences.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-400">
                    <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No Licence Records Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting search filters or complete a task to create a new licence.</p>
                  </td>
                </tr>
              ) : (
                paginatedLicences.map((lic, index) => {
                  const globalIdx = (currentPage - 1) * rowsPerPage + index + 1;
                  const isChecked = selectedIds.includes(lic.number);
                  const isPasswordShown = showPasswordMap[lic.number] || false;

                  return (
                    <tr
                      key={lic.number + index}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isChecked ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(lic.number)}
                          className="rounded border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="py-3 px-2 text-center text-slate-400 font-semibold">{globalIdx}</td>

                      {/* Task ID */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-sky-400">
                        <Link href={`/dashboard/tasks/${lic.task}`} className="hover:underline">
                          {lic.task}
                        </Link>
                      </td>

                      {/* Partner Name */}
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {lic.partner}
                      </td>

                      {/* Partner Number */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                        <a href={`tel:${lic.partnerPhone}`} className="hover:text-blue-600">
                          {lic.partnerPhone}
                        </a>
                      </td>

                      {/* Client Name */}
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {lic.client}
                      </td>

                      {/* Client Number */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                        <a href={`tel:${lic.phone}`} className="hover:text-blue-600">
                          {lic.phone}
                        </a>
                      </td>

                      {/* Licence Type */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                            lic.type.includes("Central")
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/60 dark:border-amber-800"
                              : "bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200/60 dark:border-sky-800"
                          }`}
                        >
                          {lic.type}
                        </span>
                      </td>

                      {/* Task Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                          {lic.category}
                        </span>
                      </td>

                      {/* Service Name */}
                      <td className="py-3 px-3 text-purple-600 dark:text-purple-400 font-semibold">
                        {lic.service}
                      </td>

                      {/* Licence Number */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {lic.number}
                      </td>

                      {/* Issue Date */}
                      <td className="py-3 px-3 text-slate-500">
                        {lic.issue}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {lic.expiry}
                      </td>

                      {/* User ID */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {lic.user || "—"}
                      </td>

                      {/* Password */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {lic.password ? (
                          <div className="flex items-center gap-1.5">
                            <span>{isPasswordShown ? lic.password : "••••••••"}</span>
                            <button
                              type="button"
                              onClick={() => togglePassword(lic.number)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                              title="Toggle Password Visibility"
                            >
                              {isPasswordShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Attachments */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span>{lic.files || 1}</span>
                        </span>
                      </td>

                      {/* Action Column: View, Modify, and Delete (Requirement 3rd ss) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setViewModalLicence(lic)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 text-[11px] font-bold transition-colors cursor-pointer"
                            title="View Full Licence Certificate"
                          >
                            View
                          </button>

                          {/* Modify Button (User Requested: 'need modify button') */}
                          <button
                            type="button"
                            onClick={() => openModifyModal(lic)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Modify Licence Details"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modify</span>
                          </button>

                          {/* Delete Button (User Requested: 'need delete button in licence') */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmLicence(lic)}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Delete Licence"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
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

        {/* Pagination matching Screenshot 3 */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
            <span className="ml-2 font-medium">
              Showing {filteredLicences.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredLicences.length)} of {filteredLicences.length} entries
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pg
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🌟 VIEW LICENCE MODAL                                                */}
      {/* ==================================================================== */}
      {viewModalLicence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Licence Certificate Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewModalLicence(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-amber-300 dark:border-amber-700/60 text-center space-y-3 relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-400/30">
                <Award className="w-6 h-6" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Government of India Compliance Authority
                </p>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {viewModalLicence.service} - {viewModalLicence.type}
                </h4>
                <p className="font-mono text-xs font-bold text-blue-600 dark:text-sky-400 mt-0.5">
                  Registration No: {viewModalLicence.number}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Client Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewModalLicence.client}</span>
                  <span className="text-[10px] text-slate-500 block">{viewModalLicence.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Franchise Partner</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewModalLicence.partner}</span>
                  <span className="text-[10px] text-slate-500 block">{viewModalLicence.partnerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Issue Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewModalLicence.issue}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Expiry Date</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{viewModalLicence.expiry}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Portal User ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewModalLicence.user || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Portal Password</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewModalLicence.password || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Digitally Verified &amp; Signed by Registrar</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewModalLicence(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Downloading PDF document for Licence ${viewModalLicence.number}...`);
                  setViewModalLicence(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 🌟 MODIFY LICENCE MODAL (Requirement: 'also modify button')         */}
      {/* ==================================================================== */}
      {modifyModalLicence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Modify Licence Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModifyModalLicence(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModify} className="space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                Editing licence details for <strong>{modifyModalLicence.client}</strong> (Task: {modifyModalLicence.task}). Changes will immediately reflect across all reports.
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Licence Number *
                </label>
                <input
                  type="text"
                  required
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Licence Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="FSSAI Basic Licence">FSSAI Basic Licence</option>
                    <option value="FSSAI Central Licence">FSSAI Central Licence</option>
                    <option value="Permanent Licence">Permanent Licence</option>
                    <option value="Renewal Licence">Renewal Licence</option>
                    <option value="GST Certificate">GST Certificate</option>
                    <option value="Trademark Certificate">Trademark Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring in 30 Days">Expiring in 30 Days</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={editIssue}
                    onChange={(e) => setEditIssue(e.target.value)}
                    placeholder="e.g. 26-09-2026"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    placeholder="e.g. 25-09-2027"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={editUser}
                    onChange={(e) => setEditUser(e.target.value)}
                    placeholder="e.g. UPFSSAI123"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModifyModalLicence(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 🌟 DELETE CONFIRMATION MODAL (Requirement: 'need delete button')     */}
      {/* ==================================================================== */}
      {deleteConfirmLicence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Delete Licence Record?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-xs text-rose-800 dark:text-rose-300 font-medium">
              Are you sure you want to permanently delete Licence <strong>#{deleteConfirmLicence.number}</strong> for client <strong>{deleteConfirmLicence.client}</strong>?
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLicence(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLicence}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/25 cursor-pointer"
              >
                Delete Licence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
