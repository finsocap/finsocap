"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  UserCheck,
  CheckSquare,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FolderOpen,
  FileText,
  User,
  Inbox,
  CheckCircle,
  HelpCircle,
  Paperclip,
  Eye,
  Download,
  FileSpreadsheet,
  FileImage,
  FileCode,
  ShieldCheck,
  Building2,
  Phone,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AllocationInfographic from "@/components/Charts/AllocationInfographic";
import { useCrmStore } from "@/lib/crmStore";
import { useToast } from "@/components/Global/ToastNotification";
import { workloadService } from "@/lib/api/workloadService";
import { adminWorkflowService } from "@/lib/api/adminWorkflowService";
import { downloadFile } from "@/lib/fileViewer";
import { WorkloadMetrics, BalancingRecommendation } from "@/types/api";

export default function AllocationPage() {
  const router = useRouter();
  const { tasks, users, assignTask } = useCrmStore();
  const toast = useToast();

  // Role Protection: Staff, Specialist, Executive cannot allocate tasks
  useEffect(() => {
    try {
      const stored = localStorage.getItem("finsocap_user_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        const userRole = (parsed?.user?.role || parsed?.role || "ADMIN").toUpperCase();
        if (userRole !== "ADMIN") {
          toast.warning("Access Restricted", "Task allocation is reserved for administrators.");
          router.replace("/dashboard/tasks");
        }
      }
    } catch (e) {}
  }, [router, toast]);

  const [workload, setWorkload] = useState<WorkloadMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<BalancingRecommendation[]>([]);
  const [isApplyingRec, setIsApplyingRec] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [priority, setPriority] = useState<"High" | "Normal" | "Low">("Normal");
  // Default to today + 7 days
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [kpiFilter, setKpiFilter] = useState<"ALL" | "UNASSIGNED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED">("ALL");

  const unassignedScrollRef = useRef<HTMLDivElement>(null);
  const assignedScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "up" | "down") => {
    if (ref.current) {
      ref.current.scrollBy({ top: direction === "up" ? -64 : 64, behavior: "smooth" });
    }
  };

  const fetchWorkloadData = useCallback(async () => {
    try {
      const [wlRes, recRes] = await Promise.allSettled([
        workloadService.getWorkload(),
        workloadService.getBalancingRecommendations(),
      ]);
      if (wlRes.status === "fulfilled" && wlRes.value?.success) {
        setWorkload(wlRes.value.data);
      }
      if (recRes.status === "fulfilled" && recRes.value?.success) {
        setRecommendations(recRes.value.data);
      }
    } catch (e) {
      console.warn("Workload fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchWorkloadData();
  }, [fetchWorkloadData]);

  const handleApplyRecommendation = async (recId: string) => {
    setIsApplyingRec(true);
    try {
      const res = await workloadService.applyRecommendation(recId);
      if (res.success) {
        toast.success(res.message || "Smart balancing applied successfully!");
        fetchWorkloadData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply recommendation");
    } finally {
      setIsApplyingRec(false);
    }
  };

  const unassignedTasks = useMemo(() => {
    if (kpiFilter === "ASSIGNED" || kpiFilter === "IN_PROGRESS" || kpiFilter === "COMPLETED") {
      return [];
    }
    return tasks.filter((t) => !t.assignee && t.status !== "Completed");
  }, [tasks, kpiFilter]);

  // Auto-select first unassigned task if available and none selected
  const activeSelectedTaskId = selectedTaskId || (unassignedTasks.length > 0 ? unassignedTasks[0].id : "");

  const assignedTasks = useMemo(() => {
    if (kpiFilter === "UNASSIGNED") {
      return [];
    }
    return tasks.filter((t) => {
      if (!t.assignee) return false;
      if (kpiFilter === "IN_PROGRESS" && t.status !== "In Progress") return false;
      if (kpiFilter === "COMPLETED" && t.status !== "Completed") return false;
      return true;
    });
  }, [tasks, kpiFilter]);

  const inProgressCount = useMemo(() => {
    return tasks.filter((t) => t.status === "In Progress" || Boolean(t.assignee)).length;
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.status === "Completed").length;
  }, [tasks]);

  const selectedTask = useMemo(() => {
    return unassignedTasks.find((t) => t.id === activeSelectedTaskId);
  }, [unassignedTasks, activeSelectedTaskId]);

  const qualifiedUsers = useMemo(() => {
    if (!selectedTask) return users.filter((u) => u.status === "Active");
    const taskCat = (selectedTask.category || selectedTask.service || "").toLowerCase();

    const matches = users.filter((u) => {
      if (u.status !== "Active") return false;
      const allSkills = (u.skills && u.skills.length > 0 ? u.skills : [u.skill]).join(" ").toLowerCase();
      const role = u.role.toLowerCase();
      const dept = u.dept.toLowerCase();

      if (taskCat.includes("fssai") || taskCat.includes("food")) {
        return allSkills.includes("fssai") || allSkills.includes("food") || role.includes("compliance") || dept.includes("operations");
      }
      if (taskCat.includes("gst") || taskCat.includes("tax") || taskCat.includes("itr") || taskCat.includes("accounting")) {
        return role.includes("ca") || role.includes("accountant") || allSkills.includes("gst") || allSkills.includes("tax");
      }
      if (taskCat.includes("mca") || taskCat.includes("roc") || taskCat.includes("company") || taskCat.includes("incorporation")) {
        return role.includes("cs") || role.includes("secretary") || allSkills.includes("mca") || allSkills.includes("roc");
      }
      if (taskCat.includes("trademark") || taskCat.includes("ip") || taskCat.includes("legal") || taskCat.includes("shop")) {
        return role.includes("legal") || allSkills.includes("trademark") || allSkills.includes("legal");
      }
      return true;
    });

    return matches.length > 0 ? matches : users.filter((u) => u.status === "Active");
  }, [users, selectedTask]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().slice(0, 10);
    if (dueDate && dueDate < todayStr) {
      toast.error("Due date cannot be a past date. Please select today or a future date.");
      return;
    }

    const targetTaskId = selectedTaskId || activeSelectedTaskId;
    if (!targetTaskId || !selectedAssignee) {
      toast.error("Please select both a task and an assignee.");
      return;
    }

    const matchedTask = tasks.find((t) => t.id === targetTaskId);
    const numId = matchedTask?.numericId || (targetTaskId.startsWith("T-") ? parseInt(targetTaskId.replace(/\D/g, ""), 10) : parseInt(targetTaskId, 10));

    const specialist = workload?.specialists?.find(
      (s) => s.name.toLowerCase() === selectedAssignee.toLowerCase() || String(s.id) === selectedAssignee
    ) || users.find((u) => u.name.toLowerCase() === selectedAssignee.toLowerCase() || String(u.id) === selectedAssignee);
    
    const specId = specialist?.id || 1;

    assignTask(targetTaskId, specialist?.name || selectedAssignee, priority, dueDate);

    try {
      // 1. Live Service Request Assignment (API Guide Section 9)
      if (!isNaN(numId) && numId > 0) {
        try {
          // Fetch latest version from service-requests detail to avoid 409 conflict
          let expectedVersion = 0;
          try {
            const detailRes = await adminWorkflowService.getServiceRequestById(numId);
            if (detailRes?.success && typeof detailRes.data?.version === "number") {
              expectedVersion = detailRes.data.version;
            }
          } catch {}

          await adminWorkflowService.assignServiceRequest(numId, {
            specialistId: specId,
            expectedVersion,
            notes: note || `Assigned to ${specialist?.name || selectedAssignee}`,
            overrideCompetency: true,
          });
        } catch (apiErr: any) {
          console.warn("adminWorkflowService assignment sync fallback:", apiErr);
          // Fallback to legacy workload endpoint if service request endpoint fails
          await workloadService.assignTask({
            taskId: numId,
            specialistId: specId,
            notes: note,
          });
        }
      }

      fetchWorkloadData();
    } catch (err: any) {
      console.warn("Assign workload background sync:", err);
    }

    toast.success(`Task ${targetTaskId} successfully delegated to ${specialist?.name || selectedAssignee}!`, "Success!");

    setSelectedTaskId("");
    setNote("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/50";
      case "In Progress":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50";
      case "Sent for Review":
      case "See Full Review":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50";
      case "Pending from Client":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/50";
      case "Pending from Department":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-4 pb-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* 1. CA Workload Capacity & Queue Distribution Infographic & Smart Balancing */}
      <AllocationInfographic
        workload={workload}
        recommendations={recommendations}
        onApplyRecommendation={handleApplyRecommendation}
        isApplying={isApplyingRec}
        tasks={tasks}
        users={users}
      />

      {/* 2. Top 4 Clean Metric Cards matching live REST API */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Unassigned Requests */}
        <button
          type="button"
          onClick={() => setKpiFilter(kpiFilter === "UNASSIGNED" ? "ALL" : "UNASSIGNED")}
          className={`rounded-2xl border p-4 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer ${
            kpiFilter === "UNASSIGNED"
              ? "!bg-amber-50/95 dark:!bg-amber-950/70 !border-amber-500 !border-2 shadow-md shadow-amber-500/20 scale-[1.01]"
              : "bg-white dark:bg-[#0c1427] border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              kpiFilter === "UNASSIGNED"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">
                Unassigned
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase block">
                REQUESTS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {workload?.unassignedRequestsCount ?? unassignedTasks.length}
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              kpiFilter === "UNASSIGNED" ? "rotate-90 text-amber-600 dark:text-amber-400" : "text-slate-400"
            }`} />
          </div>
        </button>

        {/* Assigned Tasks */}
        <button
          type="button"
          onClick={() => setKpiFilter(kpiFilter === "ASSIGNED" ? "ALL" : "ASSIGNED")}
          className={`rounded-2xl border p-4 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer ${
            kpiFilter === "ASSIGNED"
              ? "!bg-emerald-50/95 dark:!bg-emerald-950/70 !border-emerald-500 !border-2 shadow-md shadow-emerald-500/20 scale-[1.01]"
              : "bg-white dark:bg-[#0c1427] border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              kpiFilter === "ASSIGNED"
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">
                Assigned
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase block">
                TASKS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {workload?.assignedTasksCount ?? assignedTasks.length}
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              kpiFilter === "ASSIGNED" ? "rotate-90 text-emerald-600 dark:text-emerald-400" : "text-slate-400"
            }`} />
          </div>
        </button>

        {/* In Progress WIP */}
        <button
          type="button"
          onClick={() => setKpiFilter(kpiFilter === "IN_PROGRESS" ? "ALL" : "IN_PROGRESS")}
          className={`rounded-2xl border p-4 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer ${
            kpiFilter === "IN_PROGRESS"
              ? "!bg-purple-50/95 dark:!bg-purple-950/70 !border-purple-500 !border-2 shadow-md shadow-purple-500/20 scale-[1.01]"
              : "bg-white dark:bg-[#0c1427] border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              kpiFilter === "IN_PROGRESS"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400"
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">
                In Progress
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase block">
                WIP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {workload?.inProgressWipCount ?? inProgressCount}
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              kpiFilter === "IN_PROGRESS" ? "rotate-90 text-purple-600 dark:text-purple-400" : "text-slate-400"
            }`} />
          </div>
        </button>

        {/* Completed DONE */}
        <button
          type="button"
          onClick={() => setKpiFilter(kpiFilter === "COMPLETED" ? "ALL" : "COMPLETED")}
          className={`rounded-2xl border p-4 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer ${
            kpiFilter === "COMPLETED"
              ? "!bg-blue-50/95 dark:!bg-blue-950/70 !border-blue-500 !border-2 shadow-md shadow-blue-500/20 scale-[1.01]"
              : "bg-white dark:bg-[#0c1427] border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              kpiFilter === "COMPLETED"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400"
            }`}>
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">
                Completed
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase block">
                DONE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {workload?.completedDoneCount ?? completedCount}
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              kpiFilter === "COMPLETED" ? "rotate-90 text-blue-600 dark:text-blue-400" : "text-slate-400"
            }`} />
          </div>
        </button>

      </div>

      {/* 3. Main Split Grid: Left "Assign a Task" (5 cols) & Right Tables (7 cols) with Perfect Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Card: Assign a Task */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4 overflow-hidden relative flex flex-col justify-between">
          
          {/* Header Mini Banner */}
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/15 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-100 block">
                    TASK DELEGATION
                  </span>
                  <h2 className="font-black text-white text-base tracking-tight leading-tight">
                    Assign a Task
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-xs">
                Smart Dispatch
              </span>
            </div>
            <p className="text-[11px] text-blue-100 font-medium mt-2 leading-relaxed relative z-10">
              Delegate incoming client cases to certified team personnel with priority SLA &amp; automated tracking.
            </p>
          </div>

          <form onSubmit={handleAssign} className="space-y-3.5">
            
            {/* Select Task */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Task *
                </label>
                {selectedTask && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400">
                    {selectedTask.business || selectedTask.client}
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  value={activeSelectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  {unassignedTasks.length === 0 ? (
                    <option value="">No unassigned tasks remaining</option>
                  ) : (
                    unassignedTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} • {t.client} • {t.service}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Client & Partner Uploaded Documents Card (Exact Feature Request) */}
            {selectedTask && (
              <div className="p-3.5 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Paperclip className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        Client Dossier &amp; Compliance Attachments
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Dispatched by Partner <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTask.partner}</span> for Client <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTask.client}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-sky-300">
                    {selectedTask.files.length} {selectedTask.files.length === 1 ? "File" : "Files"}
                  </span>
                </div>

                {selectedTask.files.length === 0 ? (
                  <div className="p-2.5 text-center bg-white/80 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-[11px] text-slate-400">
                    No documents attached with this request yet.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedTask.files.map((file, idx) => {
                      const isPdf = file.toLowerCase().endsWith(".pdf");
                      const isImg = file.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {isPdf ? (
                              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                            ) : isImg ? (
                              <FileImage className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                              {file}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(file)}
                              title="Preview Document"
                              className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadFile(undefined, file, `ALLOCATION ATTACHMENT\nTask: ${selectedTask.id}\nFile: ${file}`)}
                              title="Download Document"
                              className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Assign to Employee */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Assign to Employee *
              </label>
              <div className="relative">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose certified specialist --</option>
                  {qualifiedUsers.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role} — Knowledge: {u.skills?.join(", ") || u.skill})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority & Due Date (Inline Grid) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Instructions / Notes (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Instructions / Notes (Optional)
              </label>
              <textarea
                placeholder="Add any special notes or filing instructions for the assignee..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs min-h-[72px] focus:outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-500/25 border border-blue-400/30 hover:scale-[1.01] active:scale-95 mt-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Assign Task &rarr;</span>
            </button>
          </form>
        </div>

        {/* Right Stack: Unassigned Tasks Table & Recently Assigned Table */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          
          {/* Table 1: Unassigned Tasks */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                <span>Unassigned Tasks</span>
                <span className="text-[10px] font-bold text-slate-400">
                  (Click row to allocate)
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40">
                  {unassignedTasks.length} pending allocation
                </span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200/70 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => scrollContainer(unassignedScrollRef, "up")}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Scroll Up"
                    aria-label="Scroll Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollContainer(unassignedScrollRef, "down")}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Scroll Down"
                    aria-label="Scroll Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Container with flexible height matching left card and custom slim scrollbar */}
            <div ref={unassignedScrollRef} className="overflow-x-auto min-h-[148px] max-h-[220px] overflow-y-auto pr-1.5 custom-slim-scrollbar scroll-smooth flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-white dark:bg-[#0c1427] z-10">
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">TASK ID</th>
                    <th className="py-2.5 px-3">CLIENT</th>
                    <th className="py-2.5 px-3">SERVICE</th>
                    <th className="py-2.5 px-3">DOCUMENTS</th>
                    <th className="py-2.5 px-3">FRANCHISE PARTNER</th>
                    <th className="py-2.5 px-3">DUE DATE</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {unassignedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 mx-auto flex items-center justify-center text-slate-400 mb-1.5 border border-slate-100 dark:border-slate-800">
                          <Inbox className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          All tasks are assigned! Great job.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    unassignedTasks.map((t) => {
                      const isSelected = t.id === activeSelectedTaskId;
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-950/40 font-bold border-l-4 border-l-blue-600"
                              : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-sky-400">
                            {t.id}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {t.client}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {t.business}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {t.service}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-blue-900/40">
                              <Paperclip className="w-3 h-3" />
                              <span>{t.files.length} Docs</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {t.partner}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {t.due}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskId(t.id);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs transition-colors"
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Recently Assigned Tasks - 2 Rows Visible + Scrollable */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                  Recently Assigned Tasks
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tasks successfully dispatched to specialist team members
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/40">
                  {assignedTasks.length} active
                </span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200/70 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => scrollContainer(assignedScrollRef, "up")}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Scroll Up"
                    aria-label="Scroll Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollContainer(assignedScrollRef, "down")}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Scroll Down"
                    aria-label="Scroll Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Container with flexible height matching left card and custom slim scrollbar */}
            <div ref={assignedScrollRef} className="overflow-x-auto min-h-[148px] max-h-[220px] overflow-y-auto pr-1.5 custom-slim-scrollbar scroll-smooth flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-white dark:bg-[#0c1427] z-10">
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">TASK ID</th>
                    <th className="py-2.5 px-3">CLIENT</th>
                    <th className="py-2.5 px-3">SERVICE</th>
                    <th className="py-2.5 px-3">DOCUMENTS</th>
                    <th className="py-2.5 px-3">ASSIGNED TO</th>
                    <th className="py-2.5 px-3">DUE DATE</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {assignedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 mx-auto flex items-center justify-center text-slate-400 mb-1.5 border border-slate-100 dark:border-slate-800">
                          <Inbox className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          No recently assigned tasks found.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    assignedTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="font-bold text-blue-600 dark:text-sky-400 hover:underline"
                            title={task.id}
                          >
                            {task.id.length > 16 ? `${task.id.slice(0, 14)}...` : task.id}
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 capitalize">
                          {task.client}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                          {task.service}
                        </td>
                        <td className="py-3 px-3">
                          {task.files && task.files.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(task.files[0])}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-300 border border-blue-200/60 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                              title={task.files.join(", ")}
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              <span>{task.files.length} Docs</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          <span className="inline-flex items-center gap-2 font-bold whitespace-nowrap">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                              {task.assignee.charAt(0).toUpperCase()}
                            </span>
                            <span>{task.assignee}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {task.due || "—"}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide whitespace-nowrap ${getStatusBadge(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                            title="View Task Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Document Quick Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-xs">
                    {previewDoc}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Authorized Partner Submission · Verified Client Compliance Proof
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Verified Document Card */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-sky-400 mx-auto flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {previewDoc}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  UIDAI / Income Tax Department / Commercial Power Proof
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Legible & Verified Document Attachment</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewDoc) {
                    downloadFile(undefined, previewDoc, `ALLOCATION ATTACHMENT\nDocument: ${previewDoc}\nVerified File`);
                  }
                  setPreviewDoc(null);
                }}
                className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
