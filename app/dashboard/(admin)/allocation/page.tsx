"use client";

import { useState, useMemo } from "react";
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
  FolderOpen,
  FileText,
  User,
  Inbox,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import AllocationInfographic from "@/components/Charts/AllocationInfographic";
import { useCrmStore } from "@/lib/crmStore";
import { useToast } from "@/components/Global/ToastNotification";

export default function AllocationPage() {
  const { tasks, users, assignTask } = useCrmStore();
  const toast = useToast();

  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [priority, setPriority] = useState<"High" | "Normal" | "Low">("Normal");
  const [dueDate, setDueDate] = useState<string>("2026-10-05");
  const [note, setNote] = useState<string>("");

  const unassignedTasks = useMemo(() => {
    return tasks.filter((t) => !t.assignee && t.status !== "Completed");
  }, [tasks]);

  const assignedTasks = useMemo(() => {
    return tasks.filter((t) => Boolean(t.assignee));
  }, [tasks]);

  const inProgressCount = useMemo(() => {
    return tasks.filter((t) => t.status === "In Progress" || Boolean(t.assignee)).length;
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.status === "Completed").length;
  }, [tasks]);

  const selectedTask = useMemo(() => {
    return unassignedTasks.find((t) => t.id === selectedTaskId);
  }, [unassignedTasks, selectedTaskId]);

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

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !selectedAssignee) {
      alert("Please select both a task and an assignee.");
      return;
    }

    assignTask(selectedTaskId, selectedAssignee);
    toast.success(`Task ${selectedTaskId} successfully delegated to ${selectedAssignee}!`, "Success!");

    setSelectedTaskId("");
    setNote("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400";
      case "In Progress":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400";
      case "See Full Review":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400";
      case "Pending from Client":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400";
      case "Pending from Department":
        return "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-4 pb-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* 1. CA Workload Capacity & Queue Distribution Infographic & Smart Balancing */}
      <AllocationInfographic tasks={tasks} users={users} />

      {/* 2. Top 4 Clean Metric Cards matching user screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Unassigned Requests */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
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
              {unassignedTasks.length}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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
              8
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* In Progress WIP */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
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
              2
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Completed DONE */}
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
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
              1
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

      </div>

      {/* 3. Main Split Grid: Left "Assign a Task" (5 cols) & Right Tables (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Card: Assign a Task with Banner matching Right Height */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between overflow-hidden relative">
          
          {/* Header Mini Banner */}
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20 mb-3">
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

          <form onSubmit={handleAssign} className="space-y-3.5 flex-1 flex flex-col justify-between">
            
            {/* Select Task */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Task *
              </label>
              <div className="relative">
                <select
                  value={selectedTaskId}
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
                  <option value="Ankit Kumar">Ankit Kumar (Executive — Knowledge: Food & Beverage, Compliance, ...)</option>
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
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="05/10/2026"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs min-h-[92px] focus:outline-none resize-none"
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
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          
          {/* Table 1: Unassigned Tasks */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                Unassigned Tasks
              </h3>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40">
                0 pending allocation
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">TASK ID</th>
                    <th className="py-2.5 px-3">CLIENT</th>
                    <th className="py-2.5 px-3">SERVICE</th>
                    <th className="py-2.5 px-3">FRANCHISE PARTNER</th>
                    <th className="py-2.5 px-3">DUE DATE</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 mx-auto flex items-center justify-center text-slate-400 mb-1.5 border border-slate-100 dark:border-slate-800">
                        <Inbox className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        All tasks are assigned! Great job.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Recently Assigned Tasks */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                Recently Assigned Tasks
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/40">
                8 active
              </span>
            </div>

            <div className="overflow-x-auto my-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">TASK ID</th>
                    <th className="py-2.5 px-3">CLIENT</th>
                    <th className="py-2.5 px-3">SERVICE</th>
                    <th className="py-2.5 px-3">ASSIGNED TO</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {[
                    { id: "T-1001", client: "Amit Kumar", service: "FSSAI Registration (Basic)", assignee: "Ankit Kumar", status: "Pending" },
                    { id: "T-1002", client: "Neha Verma", service: "GST Registration", assignee: "Pooja Mehta", status: "In Progress" },
                    { id: "T-1003", client: "Rohit Sharma", service: "Shop Act / Trade License", assignee: "Neha Verma", status: "See Full Review" },
                    { id: "T-1004", client: "Pooja Mehta", service: "FSSAI State License", assignee: "Ankit Kumar", status: "Pending from Client" },
                    { id: "T-1005", client: "Vikram Singh", service: "Import Export (IEC Registration)", assignee: "Gaurav Sharma", status: "Pending from Department" },
                  ].map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 font-bold text-blue-600 dark:text-sky-400">
                        {task.id}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {task.client}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                        {task.service}
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                        {task.assignee}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
