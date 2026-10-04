"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  ClipboardList, Search, Plus, Filter, RotateCcw, 
  Clock, CheckCircle2, AlertCircle, AlertTriangle, Users, Building2, 
  FileText, ArrowRight, Phone, Check, ExternalLink, 
  X, Paperclip, Send, Download, ShieldAlert, XCircle, Loader2,
  Calendar, ChevronDown, Eye, ArrowUpDown, Edit3, Save
} from "lucide-react";
import { TaskItem, TaskStatus } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { initialTasks } from "@/lib/tasksData";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import PageBanner from "@/components/Dashboard/PageBanner";

const allStatuses: { status: TaskStatus; label: string; count: number; color: string; bg: string; icon: any }[] = [
  { status: "Pending", label: "Pending", count: 47, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", icon: Clock },
  { status: "In Progress", label: "In Progress", count: 12, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20", icon: Loader2 },
  { status: "Sent for Review", label: "Sent for Review", count: 15, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", icon: FileText },
  { status: "Pending from Client", label: "Pending from Client", count: 28, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20", icon: Users },
  { status: "Pending from Department", label: "Pending from Department", count: 6, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: Building2 },
  { status: "Overdue", label: "Overdue", count: 38, color: "text-red-600", bg: "bg-red-500/10 border-red-500/20", icon: AlertCircle },
  { status: "Completed", label: "Completed", count: 302, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  { status: "Cancelled", label: "Cancelled", count: 9, color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/20", icon: XCircle },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("01 Sep 2026 - 30 Sep 2026");

  // Modals & Feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit Task State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editClient, setEditClient] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBusiness, setEditBusiness] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editService, setEditService] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("Pending");
  const [editDue, setEditDue] = useState("");
  const [editPartnerName, setEditPartnerName] = useState("");
  const [editPartnerContact, setEditPartnerContact] = useState("");

  // Add Task Form State
  const [newClient, setNewClient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBusiness, setNewBusiness] = useState("");
  const [newPartnerId, setNewPartnerId] = useState("P-101");
  const [newPartnerName, setNewPartnerName] = useState("Rahul Jha");
  const [newPartnerPhone, setNewPartnerPhone] = useState("9873207632");
  const [newCategory, setNewCategory] = useState("Compliance");
  const [newServiceName, setNewServiceName] = useState("FSSAI Registration");
  const [newDue, setNewDue] = useState("2026-10-15");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    async function loadTasks() {
      const data = await taskService.getAll();
      if (data && data.length > 0) {
        setTasks(data);
      }
      setLoading(false);
    }
    loadTasks();
  }, []);

  // Distinct Categories & Services
  const categories = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach((t) => t.taskCategory && s.add(t.taskCategory));
    return Array.from(s);
  }, [tasks]);

  const serviceNames = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach((t) => t.serviceName && s.add(t.serviceName));
    return Array.from(s);
  }, [tasks]);

  // Filtered rows
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (selectedStatusFilter !== "ALL") {
        if (selectedStatusFilter === "Overdue") {
          const isOverdue = (t.overdueDays && t.overdueDays > 0) || t.status === "Overdue";
          if (!isOverdue) return false;
        } else if (t.status !== selectedStatusFilter) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "ALL" && t.taskCategory !== selectedCategory) {
        return false;
      }

      // Service filter
      if (selectedService !== "ALL" && t.serviceName !== selectedService) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          (t.partnerId && t.partnerId.toLowerCase().includes(q)) ||
          t.partnerName.toLowerCase().includes(q) ||
          t.partnerContact.toLowerCase().includes(q) ||
          t.clientName.toLowerCase().includes(q) ||
          t.clientContact.toLowerCase().includes(q) ||
          t.nameOfBusiness.toLowerCase().includes(q) ||
          t.taskCategory.toLowerCase().includes(q) ||
          t.serviceName.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [tasks, selectedStatusFilter, selectedCategory, selectedService, searchQuery]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newPhone.trim()) return;

    const created = await taskService.createTask({
      partnerId: newPartnerId,
      partnerName: newPartnerName,
      partnerContact: newPartnerPhone,
      clientName: newClient.trim(),
      clientContact: newPhone.trim(),
      nameOfBusiness: newBusiness.trim() || "—",
      taskCategory: newCategory,
      serviceName: newServiceName,
      status: "Pending",
      dueDate: newDue,
      overdueDays: 0,
    });

    setTasks([created, ...tasks]);
    setIsAddModalOpen(false);
    setNewClient("");
    setNewPhone("");
    setNewBusiness("");
    showToast(`Task ${created.id} created successfully!`);
  };

  const openEditTask = (t: TaskItem) => {
    setEditingTask(t);
    setEditClient(t.clientName);
    setEditPhone(t.clientContact);
    setEditBusiness(t.nameOfBusiness);
    setEditCategory(t.taskCategory);
    setEditService(t.serviceName);
    setEditStatus(t.status);
    setEditDue(t.dueDate);
    setEditPartnerName(t.partnerName);
    setEditPartnerContact(t.partnerContact);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const updated = await taskService.updateTask(editingTask.id, {
      clientName: editClient.trim(),
      clientContact: editPhone.trim(),
      nameOfBusiness: editBusiness.trim(),
      taskCategory: editCategory,
      serviceName: editService,
      status: editStatus,
      dueDate: editDue,
      partnerName: editPartnerName,
      partnerContact: editPartnerContact,
    });

    if (updated) {
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      showToast(`Task ${updated.id} updated successfully!`);
    }
    setEditingTask(null);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "Pending":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200";
      case "In Progress":
        return "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200";
      case "Sent for Review":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200";
      case "Pending from Client":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200";
      case "Pending from Department":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200";
      case "Overdue":
        return "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200";
      case "Cancelled":
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-xl text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <PageBanner
        icon={ClipboardList}
        badge="Finsocap Workflow Operations"
        badgeMeta="Live Statutory Filings & Client Delivery"
        title="Tasks"
        description="Comprehensive operations monitor across customer filings, cyber cafe partner requests, statutory approvals, and department clearance."
        bottomMeta={`${tasks.length} Active Operational Tasks • SLA Tracking Synchronized`}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary-vibrant text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        }
      />

      {/* 2. Top 8 Status KPI Cards (Exact match to Screenshot 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {allStatuses.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedStatusFilter === item.status;
          return (
            <button
              key={item.status}
              onClick={() => setSelectedStatusFilter(isSelected ? "ALL" : item.status)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.03]"
                  : "bg-white dark:bg-[#0c1427] border-slate-200/80 dark:border-slate-800 hover:border-blue-400/50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-white/20 text-white" : `${item.bg} ${item.color}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xl font-black ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  <AnimatedCounter value={item.count} />
                </span>
              </div>
              <p
                className={`text-[11px] font-bold truncate mt-1 ${
                  isSelected ? "text-blue-100" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {item.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* 3. Filter Bar (Matching Screenshot 4) */}
      <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        {/* Date Range Picker */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>{dateRange}</span>
        </div>

        {/* Task Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Task Category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Service Name Dropdown */}
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[200px]"
        >
          <option value="ALL">All Service Name</option>
          {serviceNames.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Status</option>
          {allStatuses.map((s) => (
            <option key={s.status} value={s.status}>{s.label}</option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, client, partner, business..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Search & Clear Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            Search
          </button>
          {(selectedStatusFilter !== "ALL" || selectedCategory !== "ALL" || selectedService !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedStatusFilter("ALL");
                setSelectedCategory("ALL");
                setSelectedService("ALL");
                setSearchQuery("");
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4. Tasks Table matching Screenshot 4 */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 dark:bg-slate-900/70">
                <th className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Task ID</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Partner ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Partner Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Partner Contact</th>
                <th className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Client Name</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Contact Number</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Name of Business</th>
                <th className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Task Category</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Service Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Task Date</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Overdue</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  {/* Task ID */}
                  <td className="py-3 px-3.5">
                    <Link
                      href={`/dashboard/tasks/${t.id}`}
                      className="font-mono font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      {t.id}
                    </Link>
                  </td>

                  {/* Partner ID (Requirement 4th ss) */}
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                      {t.partnerId || "P-101"}
                    </span>
                  </td>

                  {/* Partner Name */}
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                    {t.partnerName}
                  </td>

                  {/* Partner Contact */}
                  <td className="py-3 px-3.5 font-mono text-slate-700 dark:text-slate-300">
                    <a href={`tel:${t.partnerContact}`} className="hover:text-blue-600 hover:underline">
                      {t.partnerContact}
                    </a>
                  </td>

                  {/* Client Name */}
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                    {t.clientName}
                  </td>

                  {/* Contact Number */}
                  <td className="py-3 px-3.5 font-mono text-slate-700 dark:text-slate-300">
                    <a href={`tel:${t.clientContact}`} className="hover:text-blue-600 hover:underline">
                      {t.clientContact}
                    </a>
                  </td>

                  {/* Name of Business */}
                  <td className="py-3 px-3.5 text-slate-800 dark:text-slate-200">
                    {t.nameOfBusiness}
                  </td>

                  {/* Task Category */}
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                    {t.taskCategory}
                  </td>

                  {/* Service Name */}
                  <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                    {t.serviceName}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5">
                    <span className={`inline-flex whitespace-nowrap px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </td>

                  {/* Task Date */}
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {t.taskDate}
                  </td>

                  {/* Overdue (Requirement 4th ss) */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {t.overdueDays && t.overdueDays > 0 ? (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
                        {t.overdueDays} days
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold pl-2">-</span>
                    )}
                  </td>

                  {/* Actions -> Edit + Open */}
                  <td className="py-3 px-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditTask(t)}
                        className="btn-glass-modern text-xs py-1 px-2.5 cursor-pointer inline-flex items-center gap-1 hover:text-blue-600 transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <Link
                        href={`/dashboard/tasks/${t.id}`}
                        className="btn-glass-modern text-xs py-1 px-3.5 cursor-pointer inline-flex items-center gap-1.5 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Open</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Create New Task
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Client Contact *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Name of Business</label>
                  <input
                    type="text"
                    value={newBusiness}
                    onChange={(e) => setNewBusiness(e.target.value)}
                    placeholder="Business enterprise"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Partner ID</label>
                  <select
                    value={newPartnerId}
                    onChange={(e) => {
                      setNewPartnerId(e.target.value);
                      if (e.target.value === "P-101") { setNewPartnerName("Rahul Jha"); setNewPartnerPhone("9873207632"); }
                      if (e.target.value === "P-102") { setNewPartnerName("Kanhaiya"); setNewPartnerPhone("7011340730"); }
                      if (e.target.value === "P-103") { setNewPartnerName("Gaurav"); setNewPartnerPhone("9312345678"); }
                      if (e.target.value === "P-104") { setNewPartnerName("Roshan"); setNewPartnerPhone("9998887776"); }
                      if (e.target.value === "P-105") { setNewPartnerName("Roshni"); setNewPartnerPhone("8887776655"); }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="P-101">P-101 • Rahul Jha</option>
                    <option value="P-102">P-102 • Kanhaiya</option>
                    <option value="P-103">P-103 • Gaurav</option>
                    <option value="P-104">P-104 • Roshan</option>
                    <option value="P-105">P-105 • Roshni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Task Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Compliance">Compliance</option>
                    <option value="Taxation">Taxation</option>
                    <option value="Licensing">Licensing</option>
                    <option value="Import Export">Import Export</option>
                    <option value="IPR">IPR</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Service Name</label>
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. FSSAI Registration"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2 px-5 cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-500" />
                  Edit Task · {editingTask.id}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Modify task details and save changes</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTask} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editClient}
                    onChange={(e) => setEditClient(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Client Contact *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Name of Business</label>
                  <input
                    type="text"
                    value={editBusiness}
                    onChange={(e) => setEditBusiness(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Partner Name</label>
                  <input
                    type="text"
                    value={editPartnerName}
                    onChange={(e) => setEditPartnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Partner Contact</label>
                  <input
                    type="tel"
                    value={editPartnerContact}
                    onChange={(e) => setEditPartnerContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Task Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Compliance">Compliance</option>
                    <option value="Taxation">Taxation</option>
                    <option value="Licensing">Licensing</option>
                    <option value="Import Export">Import Export</option>
                    <option value="IPR">IPR</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Service Name</label>
                  <input
                    type="text"
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Sent for Review">Sent for Review</option>
                    <option value="Pending from Client">Pending from Client</option>
                    <option value="Pending from Department">Pending from Department</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="text"
                  value={editDue}
                  onChange={(e) => setEditDue(e.target.value)}
                  placeholder="e.g. 15 Oct 2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-slate-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2 px-5 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
