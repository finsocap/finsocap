"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList, Search, Plus, Filter, RotateCcw,
  Clock, CheckCircle2, AlertCircle, AlertTriangle, Users, Building2,
  FileText, ArrowRight, Phone, Check, ExternalLink, Copy,
  X, Paperclip, Send, Download, ShieldAlert, XCircle, Loader2,
  Calendar, ChevronDown, Eye, ArrowUpDown, Edit3, Save
} from "lucide-react";
import { TaskItem, TaskStatus, ALLOWED_STATUS_TRANSITIONS, canTransitionStatus } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { taskApiService } from "@/lib/api/taskService";
import { taskCollaborationService } from "@/lib/api/taskCollaborationService";
import { staffWorkflowService } from "@/lib/api/staffWorkflowService";
import { TaskMetrics } from "@/types/api";
import { useCrmStore } from "@/lib/crmStore";
import { initialTasks } from "@/lib/tasksData";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import PageBanner from "@/components/Dashboard/PageBanner";
import TasksInfographic from "@/components/Charts/TasksInfographic";
import DateRangeFilter, { DateRangeValue } from "@/components/Dashboard/DateRangeFilter";
import { useToast } from "@/components/Global/ToastNotification";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { formatName, formatIndianPhoneNumber, normalizePhoneForBackend, mapBackendTaskStatus } from "@/lib/formatters";
import { PhoneInput } from "@/components/Global/PhoneInput";
import { NameInput } from "@/components/Global/NameInput";
import { isDateWithinRange, getCurrentMonthRangeLabel, calculateOverdueDays } from "@/lib/dateRangeHelper";
import PartnerRequestsDashboard from "@/components/Dashboard/PartnerRequestsDashboard";

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
  const toast = useToast();
  const { services, partners } = useCrmStore();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const sess = localStorage.getItem("finsocap_user_session");
      if (sess) {
        const p = JSON.parse(sess);
        const r = (p?.user?.role || p?.role || "ADMIN").toUpperCase();
        setUserRole(r);
        setCurrentUser(p?.user || p);
      }
    } catch (e) { }
  }, []);

  // Filters
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>(() => getCurrentMonthRangeLabel());

  // Modals & Feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
  const [newPartnerId, setNewPartnerId] = useState(partners[0]?.partnerId || "P-101");
  const [newPartnerName, setNewPartnerName] = useState(partners[0]?.name || "Rahul Jha");
  const [newPartnerPhone, setNewPartnerPhone] = useState(partners[0]?.phone || "9873207632");
  const [newCategory, setNewCategory] = useState("Compliance");
  const [newServiceName, setNewServiceName] = useState("");
  const [newDue, setNewDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Keep newServiceName synchronized with first service if not set
  useEffect(() => {
    if (!newServiceName && services.length > 0) {
      setNewServiceName(services[0].name);
      setNewCategory(services[0].category || "Compliance");
    }
  }, [services, newServiceName]);

  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);

  const handleCopyTaskId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
    }
    setCopiedTaskId(id);
    toast.success(`Task ID "${id}" copied to clipboard!`, "Copied");
    setTimeout(() => {
      setCopiedTaskId(null);
    }, 2000);
  };

  const formatShortTaskId = (id: string) => {
    if (!id) return "";
    const clean = id.trim();
    if (clean.length <= 12) return clean;
    return `${clean.slice(0, 10)}...`;
  };

  const showToast = (msg: string) => {
    toast.success(msg, "Success!");
  };

  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        let isOpUser = false;
        let currentUser: any = null;
        try {
          const sess = localStorage.getItem("finsocap_user_session");
          if (sess) {
            const p = JSON.parse(sess);
            const role = (p?.user?.role || p?.role || "ADMIN").toUpperCase();
            currentUser = p?.user || p;
            if (["STAFF", "SPECIALIST", "EXECUTIVE"].includes(role)) {
              isOpUser = true;
            }
          }
        } catch (e) { }

        if (isOpUser) {
          // Dedicated staff/specialist/executive assigned tasks from live API: GET /api/staff/tasks
          const staffTasksRes = await staffWorkflowService.getAssignedTasks();
          if (staffTasksRes?.success && staffTasksRes.data?.items && staffTasksRes.data.items.length > 0) {
            const mappedStaffTasks: TaskItem[] = staffTasksRes.data.items.map((it: any) => ({
              id: it.requestCode || `T-${it.id}`,
              numericId: typeof it.id === "number" ? it.id : Number(it.id) || undefined,
              version: typeof it.version === "number" ? it.version : 0,
              partnerId: it.partnerId ? `P-${it.partnerId}` : "P-101",
              partnerName: it.partnerName || "HQ",
              partnerContact: it.partnerContact || "",
              clientName: it.customerName || it.clientName || "Client",
              clientContact: it.contactNumber || "",
              nameOfBusiness: it.nameOfBusiness || it.customerName || "—",
              taskCategory: it.taskCategory || "Compliance",
              serviceName: it.serviceName || "Service",
              status: mapBackendTaskStatus(it.status) as TaskStatus,
              taskDate: it.createdAt ? new Date(it.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Today",
              dueDate: it.dueDate || "",
              overdueDays: typeof it.overdueDays === "number" && it.overdueDays > 0
                ? it.overdueDays
                : calculateOverdueDays(it.dueDate, it.status),
              assignedTo: it.assignedTo?.name ? { id: String(it.assignedTo.id), name: it.assignedTo.name, role: "Specialist" } : undefined,
              comments: it.instructions ? [{ id: "c1", userName: "Admin", userRole: "ADMIN", timestamp: "Recent", text: it.instructions }] : [],
            }));
            setTasks(mappedStaffTasks);
            setLoading(false);
            return;
          }
        }

        const [metricsRes, tasksRes] = await Promise.allSettled([
          taskApiService.getMetrics(),
          taskApiService.getTasks(),
        ]);

        if (metricsRes.status === "fulfilled" && metricsRes.value?.success) {
          setTaskMetrics(metricsRes.value.data);
        }

        if (tasksRes.status === "fulfilled" && tasksRes.value?.success && Array.isArray(tasksRes.value.data) && tasksRes.value.data.length > 0) {
          const mappedTasks: TaskItem[] = tasksRes.value.data.map((bt) => ({
            id: bt.taskId || `T-${bt.id}`,
            numericId: typeof bt.id === "number" ? bt.id : Number(bt.id) || undefined,
            version: typeof (bt as any).version === "number" ? (bt as any).version : 0,
            partnerId: bt.partnerId || "P-101",
            partnerName: bt.partnerName || "HQ",
            partnerContact: bt.partnerContact || "",
            clientName: bt.clientName,
            clientContact: bt.contactNumber || "",
            nameOfBusiness: bt.nameOfBusiness || bt.clientName,
            taskCategory: bt.taskCategory || "General",
            serviceName: bt.serviceName,
            status: mapBackendTaskStatus(bt.status) as TaskStatus,
            taskDate: bt.taskDate || "Today",
            dueDate: bt.dueDate || "",
            overdueDays: typeof (bt as any).overdueDays === "number" && (bt as any).overdueDays > 0
              ? (bt as any).overdueDays
              : calculateOverdueDays(bt.dueDate, bt.status),
            assignedTo: bt.assignedToName ? { id: "spec", name: bt.assignedToName, role: "Specialist" } : undefined,
            comments: bt.adminRemarks ? [{ id: "c1", userName: "Admin", userRole: "ADMIN", timestamp: "Recent", text: bt.adminRemarks }] : [],
          }));
          setTasks(mappedTasks);
        } else {
          setTasks([]);
        }
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  // Distinct Categories & Services from catalog + active tasks
  const categories = useMemo(() => {
    const s = new Set<string>();
    services.forEach((srv) => srv.category && s.add(srv.category));
    tasks.forEach((t) => t.taskCategory && s.add(t.taskCategory));
    return Array.from(s);
  }, [services, tasks]);

  const serviceNames = useMemo(() => {
    const s = new Set<string>();
    services.forEach((srv) => srv.name && s.add(srv.name));
    tasks.forEach((t) => t.serviceName && s.add(t.serviceName));
    return Array.from(s);
  }, [services, tasks]);

  // Scoped tasks for operational roles (Staff, Specialist, Executive)
  const scopedUserTasks = useMemo(() => {
    const isOp = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole);
    if (!isOp) return tasks;

    const myName = (currentUser?.name || "").toLowerCase().trim();
    const myEmail = (currentUser?.email || "").toLowerCase().trim();

    return tasks.filter((t) => {
      // If t.assignedTo is missing, it's not assigned to the staff user
      if (!t.assignedTo?.name) return false;
      const assignedName = (t.assignedTo.name || "").toLowerCase().trim();
      return (
        (myName && assignedName.includes(myName)) ||
        (myName && myName.includes(assignedName)) ||
        (myEmail && assignedName.includes(myEmail))
      );
    });
  }, [tasks, userRole, currentUser]);

  // Filtered rows - strictly scoped to logged-in user if non-admin role
  const filteredTasks = useMemo(() => {
    return scopedUserTasks.filter((t) => {
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

      // Date Range filter
      if (dateRange && !isDateWithinRange(t.taskDate || t.dueDate, dateRange)) {
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
  }, [scopedUserTasks, selectedStatusFilter, selectedCategory, selectedService, searchQuery, dateRange]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newPhone.trim()) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (newDue && newDue < todayStr) {
      toast.error("Due date cannot be a past date. Please select today or a future date.");
      return;
    }

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
    // Convert to YYYY-MM-DD for native HTML5 date picker
    let dueVal = "";
    if (t.dueDate) {
      const parsed = new Date(t.dueDate);
      if (!isNaN(parsed.getTime())) {
        dueVal = parsed.toISOString().split("T")[0];
      } else {
        dueVal = t.dueDate;
      }
    }
    setEditDue(dueVal);
    setEditPartnerName(t.partnerName);
    setEditPartnerContact(t.partnerContact);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (editDue && editDue < todayStr) {
      toast.error("Due date cannot be a past date. Please select today or a future date.");
      return;
    }

    if (editStatus !== editingTask.status && !canTransitionStatus(editingTask.status, editStatus)) {
      toast.error(
        `Invalid step transition: "${editingTask.status}" cannot jump directly to "${editStatus}". Work must proceed stepwise.`,
        "Workflow Rule"
      );
      return;
    }

    const statusChanged = editStatus !== editingTask.status;
    const statusMap: Record<string, string> = {
      "Pending": "PENDING",
      "In Progress": "IN_PROGRESS",
      "Pending from Client": "PENDING_FROM_CLIENT",
      "Pending from Department": "PENDING_FROM_DEPARTMENT",
      "Sent for Review": "SENT_FOR_REVIEW",
      "Overdue": "PENDING_FROM_CLIENT",
      "Completed": "COMPLETED",
      "Cancelled": "CANCELLED",
    };
    const backendStatus = statusMap[editStatus];

    // Backend sync for dueDate & status update
    if (statusChanged || editDue !== editingTask.dueDate) {
      try {
        let numericTaskId = editingTask.numericId;
        if (!numericTaskId && editingTask.id) {
          if (/^\d+$/.test(editingTask.id)) {
            numericTaskId = Number(editingTask.id);
          } else if (editingTask.id.startsWith("T-") && /^\d+$/.test(editingTask.id.slice(2))) {
            numericTaskId = Number(editingTask.id.slice(2));
          }
        }

        if (numericTaskId && numericTaskId > 0) {
          const isStaff = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole.toUpperCase());

          // 1. Fetch live version from server to prevent 409 stale version conflict
          let currentLiveVersion = typeof editingTask.version === "number" ? editingTask.version : 0;
          try {
            const verRes = await fetch(`/api/proxy/tasks/${numericTaskId}`, { cache: "no-store" });
            if (verRes.ok) {
              const verJson = await verRes.json();
              if (typeof verJson?.data?.version === "number") currentLiveVersion = verJson.data.version;
            }
          } catch (e) {}

          // 2. Direct core task PUT update
          await fetch(`/api/proxy/tasks/${numericTaskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: backendStatus || editingTask.status,
              dueDate: editDue || null,
              version: currentLiveVersion,
            }),
          }).catch((err) => console.warn("Direct PUT task entity warning:", err));

          // 3. Status transition workflow endpoint
          if (statusChanged && backendStatus) {
            if (isStaff) {
              await taskCollaborationService.updateTaskStatus(
                numericTaskId,
                {
                  status: backendStatus,
                  note: `Status updated to ${editStatus} from Task Editor`,
                },
                "STAFF"
              ).catch((err) => console.warn("Staff status transition warning:", err));
            } else {
              await taskCollaborationService.updateTaskStatus(
                numericTaskId,
                {
                  status: backendStatus,
                  note: `Status updated to ${editStatus} from Task Editor`,
                  expectedVersion: currentLiveVersion,
                },
                "ADMIN"
              ).catch((patchErr) => console.warn("Admin status transition warning:", patchErr));
            }
          }
        }
      } catch (syncErr) {
        console.warn("Backend status sync warning:", syncErr);
      }
    }

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
      assignedTo: editingTask.assignedTo, // Explicitly preserve assignedTo so it NEVER unassigns
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

  if (userRole === "PARTNER") {
    return <PartnerRequestsDashboard />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Banner */}
      <PageBanner
        icon={ClipboardList}
        badge="Finsocap Workflow Operations"
        badgeMeta="Live Statutory Filings & Client Delivery"
        title={["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole.toUpperCase()) ? "My Assigned Tasks" : "Tasks"}
        description={["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole.toUpperCase()) ? "View, progress, and fulfill statutory cases assigned directly to you." : "Comprehensive operations monitor across customer filings, cyber cafe partner requests, statutory approvals, and department clearance."}
        bottomMeta={`${scopedUserTasks.length} Active Operational Tasks • SLA Tracking Synchronized`}
        actions={
          !["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole.toUpperCase()) ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary-vibrant text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          ) : undefined
        }
      />

      {/* Task Execution Pipeline Velocity Infographic */}
      <TasksInfographic
        metrics={["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole.toUpperCase()) ? null : taskMetrics}
        tasks={scopedUserTasks}
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
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.03]"
                  : "bg-white dark:bg-[#0c1427] border-slate-200/80 dark:border-slate-800 hover:border-blue-400/50 hover:shadow-sm"
                }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${isSelected ? "bg-white/20 text-white" : `${item.bg} ${item.color}`
                    }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xl font-black ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  <AnimatedCounter value={scopedUserTasks.filter((t) => item.status === "Overdue" ? (t.overdueDays ? t.overdueDays > 0 : false) : t.status === item.status).length} />
                </span>
              </div>
              <p
                className={`text-[11px] font-bold truncate mt-1 ${isSelected ? "text-blue-100" : "text-slate-600 dark:text-slate-400"
                  }`}
              >
                {item.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* 3. Filter Bar (Matching Screenshot 4) */}
      {/* 3. Filter Bar (Responsive Grid Layout: Clean 2-col on mobile/tablet, single bar on desktop) */}
      <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center gap-2.5">
          {/* Interactive Date Range Filter */}
          <DateRangeFilter
            value={dateRange}
            onChange={(range) => setDateRange(range.label)}
            className="w-full sm:w-auto"
          />

          {/* Task Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full lg:w-auto h-11 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
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
            className="w-full lg:w-auto lg:max-w-[200px] h-11 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
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
            className="w-full lg:w-auto h-11 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            {allStatuses.map((s) => (
              <option key={s.status} value={s.status}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-0.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, client, partner, business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer text-center"
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
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
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
                <th className="py-3 px-3.5 whitespace-nowrap">Assigned To</th>
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
              {loading ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <span className="text-xs font-semibold">Loading tasks...</span>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No tasks found matching criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tasks will appear here dynamically as partners submit requests</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Task ID: display with Click-to-Copy */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-blue-50/70 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                        <Link
                          href={`/dashboard/tasks/${t.id}`}
                          className="font-mono font-bold text-xs text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                          title={`Full Task ID: ${t.id} (Click to open)`}
                        >
                          {formatShortTaskId(t.id)}
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleCopyTaskId(t.id, e)}
                          title={`Click to copy: ${t.id}`}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/60 transition-colors cursor-pointer group"
                        >
                          {copiedTaskId === t.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-75" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>
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

                    {/* Assigned Specialist */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {t.assignedTo?.name ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          <Users className="w-3 h-3 text-indigo-500" />
                          <span>{t.assignedTo.name}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Unassigned
                        </span>
                      )}
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

                    {/* Actions -> Edit (Admin Only) + Open */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {!["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole) && (
                          <button
                            type="button"
                            onClick={() => openEditTask(t)}
                            className="btn-glass-modern text-xs py-1 px-2.5 cursor-pointer inline-flex items-center gap-1 hover:text-blue-600 transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
            <div className="shrink-0">
              <ModalHeaderBanner
                icon={ClipboardList}
                badge="TASK DELEGATION"
                title="Assign a Task"
                description="Delegate incoming client cases to certified team personnel with priority SLA & automated tracking."
                badgeTag="Smart Dispatch"
                onClose={() => setIsAddModalOpen(false)}
              />
            </div>

            <form onSubmit={handleCreateTask} className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <NameInput
                  label="Client Name"
                  required
                  value={newClient}
                  onChange={setNewClient}
                  placeholder="e.g. Ramesh Kumar"
                />

                <PhoneInput
                  label="Client Contact"
                  required
                  value={newPhone}
                  onChange={setNewPhone}
                  placeholder="+91 99530 65623"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Name of Business</label>
                  <input
                    type="text"
                    value={newBusiness}
                    onChange={(e) => setNewBusiness(e.target.value)}
                    onBlur={() => setNewBusiness(formatName(newBusiness))}
                    placeholder="Business enterprise"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Partner ID *</label>
                  <select
                    value={newPartnerId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setNewPartnerId(pid);
                      const found = partners.find((p) => p.partnerId === pid);
                      if (found) {
                        setNewPartnerName(found.name);
                        setNewPartnerPhone(found.phone);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {partners.map((p) => (
                      <option key={p.partnerId} value={p.partnerId}>
                        {p.partnerId} • {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Task Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setNewCategory(cat);
                      // Auto-select first matching service if current service doesn't belong
                      const matching = services.find((s) => s.category === cat);
                      if (matching) {
                        setNewServiceName(matching.name);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {Array.from(new Set(services.map((s) => s.category))).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Service Name * (Catalog Only)</label>
                  <select
                    required
                    value={newServiceName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewServiceName(val);
                      const matching = services.find((s) => s.name === val);
                      if (matching) setNewCategory(matching.category);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
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
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
            <div className="shrink-0">
              <ModalHeaderBanner
                icon={Edit3}
                badge="WORKFLOW EDITOR"
                title={`Edit Task · ${editingTask.id}`}
                description="Modify client, partner, service, or statutory schedule."
                badgeTag="Task Sync"
                onClose={() => setEditingTask(null)}
              />
            </div>

            <form onSubmit={handleEditTask} className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <NameInput
                  label="Client Name"
                  required
                  value={editClient}
                  onChange={setEditClient}
                />
                <PhoneInput
                  label="Client Contact"
                  required
                  value={editPhone}
                  onChange={setEditPhone}
                  placeholder="+91 99530 65623"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Name of Business</label>
                  <input
                    type="text"
                    value={editBusiness}
                    onChange={(e) => setEditBusiness(e.target.value)}
                    onBlur={() => setEditBusiness(formatName(editBusiness))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Partner Name</label>
                  <input
                    type="text"
                    value={editPartnerName}
                    onChange={(e) => setEditPartnerName(e.target.value)}
                    onBlur={() => setEditPartnerName(formatName(editPartnerName))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PhoneInput
                  label="Partner Contact"
                  value={editPartnerContact}
                  onChange={setEditPartnerContact}
                  placeholder="+91 99530 65623"
                />
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
                  <label className="font-bold text-slate-700 dark:text-slate-300">Service Name * (Catalog Only)</label>
                  <select
                    required
                    value={editService}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditService(val);
                      const match = services.find((s) => s.name === val);
                      if (match) setEditCategory(match.category);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status (Stepwise Allowed)</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value={editingTask.status}>{editingTask.status} (Current)</option>
                    {(ALLOWED_STATUS_TRANSITIONS[editingTask.status] || [])
                      .filter((s) => s !== editingTask.status)
                      .filter((s) => userRole !== "ADMIN" || s !== "Completed")
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={editDue}
                  onChange={(e) => setEditDue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
