"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ClipboardList, Search, Plus, Filter, RotateCcw, 
  Clock, CheckCircle2, AlertTriangle, Users, Building, 
  FileText, ArrowRight, Phone, Check, ExternalLink, 
  X, Paperclip, Send, Download, Usb, ShieldCheck
} from "lucide-react";
import { useCrmStore, TaskModel } from "@/lib/crmStore";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import TasksInfographic from "@/components/Charts/TasksInfographic";
import PageBanner from "@/components/Dashboard/PageBanner";

const statuses: TaskModel["status"][] = [
  "Pending", 
  "In Progress", 
  "Sent for Review", 
  "Pending from Client", 
  "Pending from Department", 
  "Completed", 
  "Cancelled"
];

export default function TasksPage() {
  const { tasks, services, addTask, updateTaskStatus, addComment, addAttachment, completeTask } = useCrmStore();

  // Filters
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Add Task Form State
  const [newClient, setNewClient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBusiness, setNewBusiness] = useState("");
  const [newPartner, setNewPartner] = useState("Direct / Admin");
  const [newService, setNewService] = useState(services[0]?.name || "FSSAI Registration (Basic)");
  const [newDue, setNewDue] = useState("2026-10-10");

  // Task Detail Modal State
  const [tempStatus, setTempStatus] = useState<TaskModel["status"]>("Pending");
  const [newComment, setNewComment] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Complete Form State
  const [licenceType, setLicenceType] = useState("Permanent Licence");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceIssue, setLicenceIssue] = useState("2026-09-30");
  const [licenceExpiry, setLicenceExpiry] = useState("2027-09-29");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Status counts
  const counts = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === "Pending").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      review: tasks.filter((t) => t.status === "Sent for Review").length,
      waitingClient: tasks.filter((t) => t.status === "Pending from Client").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    };
  }, [tasks]);

  // Categories & Services dropdown lists
  const categories = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach((t) => t.category && s.add(t.category));
    return Array.from(s);
  }, [tasks]);

  const serviceNames = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach((t) => t.service && s.add(t.service));
    return Array.from(s);
  }, [tasks]);

  // Filtered rows
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedStatusFilter !== "ALL" && t.status !== selectedStatusFilter) return false;
      if (selectedCategory !== "ALL" && t.category !== selectedCategory) return false;
      if (selectedService !== "ALL" && t.service !== selectedService) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.client.toLowerCase().includes(q) ||
          t.partner.toLowerCase().includes(q) ||
          t.service.toLowerCase().includes(q) ||
          t.business.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, selectedStatusFilter, selectedCategory, selectedService, searchQuery]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newPhone.trim()) return;

    addTask({
      client: newClient.trim(),
      phone: newPhone.trim(),
      business: newBusiness.trim() || "—",
      partner: newPartner.trim() || "Direct / Admin",
      partnerPhone: "9873207632",
      category: "Compliance",
      service: newService,
      status: "Pending",
      due: newDue,
      assignee: "",
      priority: "Normal",
      sales: "Admin",
    });

    setIsAddModalOpen(false);
    setNewClient("");
    setNewPhone("");
    setNewBusiness("");
    showToast("New task created successfully!");
  };

  const handleOpenDetail = (task: TaskModel) => {
    setSelectedTask(task);
    setTempStatus(task.status);
  };

  const handleSaveStatus = () => {
    if (!selectedTask) return;
    updateTaskStatus(selectedTask.id, tempStatus);
    setSelectedTask({ ...selectedTask, status: tempStatus });
    showToast("Task status updated.");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;
    addComment(selectedTask.id, newComment.trim());
    setSelectedTask({
      ...selectedTask,
      comments: [...selectedTask.comments, newComment.trim()],
    });
    setNewComment("");
    showToast("Comment posted!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTask || !e.target.files?.[0]) return;
    const fileName = e.target.files[0].name;
    addAttachment(selectedTask.id, fileName);
    setSelectedTask({
      ...selectedTask,
      files: [...selectedTask.files, fileName],
    });
    showToast(`Attached ${fileName}`);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    completeTask(selectedTask.id, {
      type: licenceType,
      number: licenceNumber.trim() || "LIC-2026-PENDING",
      issue: licenceIssue,
      expiry: licenceExpiry,
      filesCount: 1,
    });

    setIsCompleteModalOpen(false);
    setSelectedTask(null);
    showToast(`Task ${selectedTask.id} marked as completed & licence record created!`);
  };

  const getStatusBadge = (status: TaskModel["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200";
      case "In Progress":
        return "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200";
      case "Sent for Review":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200";
      case "Pending from Client":
        return "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200";
      case "Pending from Department":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-xl text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Executive Branded Command Banner (Signature Finsocap Glassmorphic Gradient) */}
      <PageBanner
        icon={ClipboardList}
        badge="Finsocap Workflow Engine"
        badgeMeta="SLA Telemetry & Client Service Delivery"
        title="Tasks Operations"
        description="Track customer work, legal filings, employee assignments and statutory service delivery in real-time."
        bottomMeta={`${tasks.length} Total Registered Tasks • Live Compliance Queue`}
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

      {/* Task Execution Pipeline Velocity Infographic */}
      <TasksInfographic tasks={tasks} />

      {/* 2. Top 5 Status KPI Cards matching Reference HTML */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Pending" ? "ALL" : "Pending")}
          className={`card-luxury p-4 text-left transition-all cursor-pointer ${
            selectedStatusFilter === "Pending" ? "ring-2 ring-rose-500 bg-rose-50/40" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Pending</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={counts.pending} />
          </p>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === "In Progress" ? "ALL" : "In Progress")}
          className={`card-luxury p-4 text-left transition-all cursor-pointer ${
            selectedStatusFilter === "In Progress" ? "ring-2 ring-sky-500 bg-sky-50/40" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>In Progress</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={counts.inProgress} />
          </p>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Sent for Review" ? "ALL" : "Sent for Review")}
          className={`card-luxury p-4 text-left transition-all cursor-pointer ${
            selectedStatusFilter === "Sent for Review" ? "ring-2 ring-purple-500 bg-purple-50/40" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Sent for Review</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={counts.review} />
          </p>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Pending from Client" ? "ALL" : "Pending from Client")}
          className={`card-luxury p-4 text-left transition-all cursor-pointer ${
            selectedStatusFilter === "Pending from Client" ? "ring-2 ring-orange-500 bg-orange-50/40" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Waiting on Client</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={counts.waitingClient} />
          </p>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Completed" ? "ALL" : "Completed")}
          className={`card-luxury p-4 text-left transition-all cursor-pointer ${
            selectedStatusFilter === "Completed" ? "ring-2 ring-emerald-500 bg-emerald-50/40" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={counts.completed} />
          </p>
        </button>
      </div>

      {/* 3. Filter Bar */}
      <div className="p-4 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, clients, partner, business…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold max-w-[180px]"
          >
            <option value="ALL">All Services</option>
            {serviceNames.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {(selectedStatusFilter !== "ALL" || selectedCategory !== "ALL" || selectedService !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStatusFilter("ALL");
                setSelectedCategory("ALL");
                setSelectedService("ALL");
                setSearchQuery("");
              }}
              className="btn-glass-modern text-xs py-2 px-3 cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4. Tasks Table matching Reference HTML */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" style={{ minWidth: 1000 }}>
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 dark:bg-slate-900/70">
                <th className="py-3.5 px-4">Task ID</th>
                <th className="py-3.5 px-4">Partner</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Business</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleOpenDetail(t)}
                      className="font-mono font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      {t.id}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{t.partner}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.partnerPhone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{t.client}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.phone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {t.business}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {t.category}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {t.service}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {t.assignee || <span className="text-amber-600 text-[11px] font-bold">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {t.due}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(t)}
                      className="btn-glass-modern text-xs py-1 px-3 cursor-pointer"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phone *</label>
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
                  <label className="font-bold text-slate-700 dark:text-slate-300">Business Name</label>
                  <input
                    type="text"
                    value={newBusiness}
                    onChange={(e) => setNewBusiness(e.target.value)}
                    placeholder="Business enterprise"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Partner / Cyber Cafe</label>
                  <input
                    type="text"
                    value={newPartner}
                    onChange={(e) => setNewPartner(e.target.value)}
                    placeholder="Cyber Cafe kiosk name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Service *</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
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
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold"
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

      {/* TASK DETAIL MODAL / DRAWER */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Task Details &bull; {selectedTask.id}
                </h2>
                <p className="text-xs text-slate-500">{selectedTask.service}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Created</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">{selectedTask.date}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Due Date</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">{selectedTask.due}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Current Status</span>
                <span className="font-bold text-xs text-blue-600 dark:text-sky-400">{selectedTask.status}</span>
              </div>
            </div>

            {/* Customer & Partner Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <span className="font-black text-slate-900 dark:text-white block">Customer Profile</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedTask.client}</p>
                <p className="text-slate-500 font-mono">{selectedTask.phone}</p>
                <p className="text-slate-600 dark:text-slate-400">{selectedTask.business}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <span className="font-black text-slate-900 dark:text-white block">Franchise Kiosk Partner</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedTask.partner}</p>
                <p className="text-slate-500 font-mono">{selectedTask.partnerPhone}</p>
                <p className="text-slate-400">Assigned To: <b className="text-slate-800 dark:text-white">{selectedTask.assignee || "Unassigned"}</b></p>
              </div>
            </div>

            {/* Update Status Bar */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Change Processing Status:
                </span>
                <select
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveStatus}
                className="btn-primary-vibrant text-xs py-2 px-4 mt-4 cursor-pointer"
              >
                Save Status
              </button>
            </div>

            {/* Attachments Section */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                  <span>Attachments ({selectedTask.files.length})</span>
                </span>
                <label className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer">
                  + Upload Document
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {selectedTask.files.length === 0 ? (
                <p className="text-slate-400 py-2">No attachments uploaded yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedTask.files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{file}</span>
                      <button
                        onClick={() => showToast(`Simulated download for ${file}`)}
                        className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Timeline */}
            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-black text-slate-900 dark:text-white block">
                Comments & Operational Updates
              </span>

              <div className="max-h-36 overflow-y-auto space-y-2">
                {selectedTask.comments.length === 0 ? (
                  <p className="text-slate-400 py-2">No comments posted yet.</p>
                ) : (
                  selectedTask.comments.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white block text-[11px]">Ankit Sharma (Admin)</span>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{c}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Post instructions or progress comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="btn-primary-vibrant text-xs py-1.5 px-3 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="btn-glass-modern text-xs py-2 px-4 cursor-pointer"
              >
                Close
              </button>

              {selectedTask.status !== "Completed" && (
                <button
                  onClick={() => setIsCompleteModalOpen(true)}
                  className="btn-primary-vibrant text-xs py-2 px-5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Task Completed</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MARK TASK COMPLETED MODAL (Generates License!) */}
      {isCompleteModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Mark Task as Completed & Issue Licence
              </h2>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                Completing <b>{selectedTask.id}</b> ({selectedTask.service}) for <b>{selectedTask.client}</b>.
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Licence / Certification Type</label>
                <select
                  value={licenceType}
                  onChange={(e) => setLicenceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Permanent Licence">Permanent Licence / Registration</option>
                  <option value="Renewal Licence">Annual Renewal Licence</option>
                  <option value="FSSAI Basic Certificate">FSSAI Basic Certificate</option>
                  <option value="Trademark Registration Certificate">Trademark Registration Certificate</option>
                  <option value="GST Certificate">GST Certificate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Official Government Licence Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22726922001382 / TM-2026-0158"
                  value={licenceNumber}
                  onChange={(e) => setLicenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Issue Date</label>
                  <input
                    type="date"
                    value={licenceIssue}
                    onChange={(e) => setLicenceIssue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Expiry Date</label>
                  <input
                    type="date"
                    value={licenceExpiry}
                    onChange={(e) => setLicenceExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2 px-5 cursor-pointer"
                >
                  Complete & Generate Licence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
