"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, CheckSquare, Clock, UserCheck, 
  AlertCircle, CheckCircle2, User, Calendar, FileText
} from "lucide-react";
import { useCrmStore } from "@/lib/crmStore";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import AllocationInfographic from "@/components/Charts/AllocationInfographic";
import PageBanner from "@/components/Dashboard/PageBanner";

export default function TaskAllocationPage() {
  const { tasks, users, assignTask } = useCrmStore();

  const unassignedTasks = tasks.filter((t) => !t.assignee && t.status !== "Completed");
  const assignedTasks = tasks.filter((t) => t.assignee);
  const activeUsers = users.filter((u) => u.status === "Active");

  const [selectedTaskId, setSelectedTaskId] = useState<string>(unassignedTasks[0]?.id || "");
  const [selectedAssignee, setSelectedAssignee] = useState<string>(activeUsers[0]?.name || "");
  const [priority, setPriority] = useState<"High" | "Normal" | "Low">("Normal");
  const [dueDate, setDueDate] = useState<string>("2026-10-05");
  const [note, setNote] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !selectedAssignee) return;

    assignTask(selectedTaskId, selectedAssignee, priority, dueDate);
    showToast(`Task ${selectedTaskId} successfully assigned to ${selectedAssignee}!`);

    // Reset selection to next available unassigned task
    const remaining = unassignedTasks.filter((t) => t.id !== selectedTaskId);
    if (remaining.length > 0) {
      setSelectedTaskId(remaining[0].id);
    } else {
      setSelectedTaskId("");
    }
    setNote("");
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
        icon={UserCheck}
        badge="Finsocap Capacity Dispatcher"
        badgeMeta="Workload Balancing & Case Assignment"
        title="Task Allocation Center"
        description="Assign incoming client service requests to specialized employees, CAs and legal associates."
        bottomMeta={`${unassignedTasks.length} Unassigned • ${assignedTasks.length} Assigned • 100% SLA Dispatch`}
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{unassignedTasks.length} Pending Allocation</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{assignedTasks.length} Delegated</span>
            </span>
          </div>
        }
      />

      {/* CA Workload Capacity & Queue Distribution Infographic */}
      <AllocationInfographic tasks={tasks} users={users} />

      {/* 2. Top 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Unassigned</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={unassignedTasks.length} /> Requests
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Assigned</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={assignedTasks.length} /> Tasks
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">In Progress</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={tasks.filter((t) => t.status === "In Progress").length} /> WIP
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Completed</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={tasks.filter((t) => t.status === "Completed").length} /> Done
            </p>
          </div>
        </div>
      </div>

      {/* 3. Split Layout: Assignment Form + Task Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Assign Task */}
        <div className="lg:col-span-5 card-luxury p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
              Assign Task
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Delegate case to CA, CS, or legal associate with priority.
            </p>
          </div>

          <form onSubmit={handleAssign} className="space-y-4">
            
            {/* Task Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Task *
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                {unassignedTasks.length === 0 ? (
                  <option value="">No unassigned tasks remaining</option>
                ) : (
                  unassignedTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} &bull; {t.client} &bull; {t.service}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Auto-populated details */}
            {selectedTask && (
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Client:</span>
                  <span className="font-black text-slate-900 dark:text-white">{selectedTask.client} ({selectedTask.phone})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Service:</span>
                  <span className="font-bold text-blue-600 dark:text-sky-400">{selectedTask.service}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Partner:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTask.partner}</span>
                </div>
              </div>
            )}

            {/* Assign To Employee */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Assign to Employee *
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                {activeUsers.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role} - {u.dept})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Instructions / Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Instructions / Notes (Optional)
              </label>
              <textarea
                placeholder="Special notes or filing instructions for the assignee..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs min-h-[70px]"
              />
            </div>

            <button
              type="submit"
              disabled={unassignedTasks.length === 0}
              className="btn-primary-vibrant w-full text-center text-xs py-2.5 cursor-pointer disabled:opacity-50"
            >
              <span>Assign Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Stack: Unassigned Tasks Table & Recently Assigned Table */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Table 1: Unassigned Tasks */}
          <div className="card-luxury p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                Unassigned Tasks
              </h2>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950">
                {unassignedTasks.length} pending allocation
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                    <th className="py-3 px-3">Task ID</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Partner / Cafe</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {unassignedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        All tasks are assigned! Great job.
                      </td>
                    </tr>
                  ) : (
                    unassignedTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-3 font-bold text-blue-600 dark:text-sky-400">
                          {t.id}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {t.client}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {t.service}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {t.partner}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {t.due}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedTaskId(t.id)}
                            className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Assign &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Recently Assigned */}
          <div className="card-luxury p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                Recently Assigned Tasks
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {assignedTasks.length} active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                    <th className="py-3 px-3">Task ID</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Assigned To</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {assignedTasks.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-bold text-blue-600 dark:text-sky-400">
                        {t.id}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {t.client}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {t.service}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {t.assignee}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-sky-400">
                          {t.status}
                        </span>
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
