"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award
} from "lucide-react";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import PageBanner from "@/components/Dashboard/PageBanner";
import { useCrmStore } from "@/lib/crmStore";

interface RoleDashboardViewProps {
  userRole: "STAFF" | "SPECIALIST" | "EXECUTIVE";
  currentUser: any;
}

export default function RoleDashboardView({ userRole, currentUser }: RoleDashboardViewProps) {
  const { tasks, manualClients, users, services, partners } = useCrmStore();
  const [taskSummaryFilter, setTaskSummaryFilter] = useState<"Today" | "This Week" | "This Month">("Today");

  const userName = (currentUser?.name || "").toLowerCase().trim();
  const userEmail = (currentUser?.email || "").toLowerCase().trim();

  // 1. Assigned Works / Cases: strictly tasks assigned to the logged-in user
  const userTasks = useMemo(() => {
    return tasks.filter((t) => {
      const taskAssignee = (t.assignee || "").toLowerCase().trim();
      return (userName && taskAssignee.includes(userName)) ||
        (userEmail && taskAssignee.includes(userEmail)) ||
        (userName && userName.includes(taskAssignee));
    });
  }, [tasks, userName, userEmail]);

  // 2. Active Clients: clients tied to the user via assigned tasks or CRM assignment
  const userClients = useMemo(() => {
    const clientNames = new Set<string>();
    userTasks.forEach((t) => {
      if (t.client) clientNames.add(t.client.toLowerCase().trim());
    });
    return manualClients.filter((c) => {
      const cName = (c.name || "").toLowerCase().trim();
      return clientNames.has(cName);
    });
  }, [manualClients, userTasks]);

  // 3. Open Tasks (non-completed / non-cancelled)
  const openTasks = useMemo(() => {
    return userTasks.filter((t) => !["Completed", "Cancelled"].includes(t.status));
  }, [userTasks]);

  // 4. Detailed Status Counts calculated strictly from user's live tasks
  const stats = useMemo(() => {
    const pending = userTasks.filter((t) => t.status === "Pending").length;
    const inProgress = userTasks.filter((t) => t.status === "In Progress").length;
    const pendingClient = userTasks.filter((t) => t.status === "Pending from Client").length;
    const pendingDept = userTasks.filter((t) => t.status === "Pending from Department").length;
    const review = userTasks.filter((t) => t.status === "Sent for Review").length;
    const completed = userTasks.filter((t) => t.status === "Completed").length;
    const overdue = userTasks.filter((t) => {
      if (t.due && !["Completed", "Cancelled"].includes(t.status)) {
        const dueDate = new Date(t.due);
        return !isNaN(dueDate.getTime()) && dueDate < new Date();
      }
      return false;
    }).length;

    return {
      totalWorks: userTasks.length,
      activeClients: userClients.length,
      openTasks: openTasks.length,
      pending,
      inProgress,
      pendingClient,
      pendingDept,
      review,
      completed,
      overdue,
    };
  }, [userTasks, userClients, openTasks]);

  // 5. Team Activity (Workload & Performance strictly without personal credentials)
  const teamWorkload = useMemo(() => {
    return users.map((u) => {
      const memberTasks = tasks.filter((t) => {
        const a = (t.assignee || "").toLowerCase().trim();
        const m = u.name.toLowerCase().trim();
        return a.includes(m) || m.includes(a);
      });
      const closed = memberTasks.filter((t) => t.status === "Completed").length;
      const inProg = memberTasks.filter((t) => t.status === "In Progress").length;
      const pend = memberTasks.filter((t) => t.status === "Pending").length;
      return {
        id: u.id,
        name: u.name,
        dept: u.dept || "Operations",
        role: u.role || "Specialist",
        assignedCount: memberTasks.length,
        closedCount: closed,
        inProgressCount: inProg,
        pendingCount: pend,
      };
    });
  }, [users, tasks]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Executive Banner */}
      <PageBanner
        icon={Briefcase}
        badge={`Finsocap ${userRole} Workspace`}
        badgeMeta="Role-Secured Operational Intelligence"
        title={`Welcome back, ${currentUser?.name || userRole}`}
        description={`Your personal dashboard displaying your active works, client assignments, task pipeline velocity, and team performance.`}
        bottomMeta={`${stats.totalWorks} Total Works • ${stats.openTasks} Active Assigned Cases • Live Synchronized`}
      />

      {/* 2. Top Metric Cards (Replaced Leads/Revenue with Total Works & Active Clients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Works */}
        <div className="card-luxury p-5 flex items-center justify-between border-l-4 border-l-blue-600">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Works / Cases
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={stats.totalWorks} />
            </p>
            <span className="text-[10px] text-blue-600 dark:text-sky-400 font-bold mt-0.5 inline-block">
              Assigned Work Dossiers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold text-xl shadow-xs">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Active Clients */}
        <div className="card-luxury p-5 flex items-center justify-between border-l-4 border-l-emerald-600">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Clients
            </p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              <AnimatedCounter value={stats.activeClients} />
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 inline-block">
              Your Assigned Client Portfolios
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Open Tasks */}
        <div className="card-luxury p-5 flex items-center justify-between border-l-4 border-l-purple-600 sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Open Tasks
            </p>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
              <AnimatedCounter value={stats.openTasks} />
            </p>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-0.5 inline-block">
              In-Flight Statutory Filings
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl shadow-xs">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Task Status Breakdown - Full Width & Well-Organized */}
      <div className="space-y-4">
        <div className="card-luxury p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Task Summary Breakdown
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Live status distribution of your assigned operational workload
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
              {(["Today", "This Week", "This Month"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setTaskSummaryFilter(period)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    taskSummaryFilter === period
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Stage KPI Tiles: Clean 3x2 Grid Across Entire Screen */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Pending */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-blue-600 dark:text-sky-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={stats.pending} />
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Awaiting initiation</p>
            </div>

            {/* In Progress */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={stats.inProgress} />
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Active processing</p>
            </div>

            {/* Pending from Client */}
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Client</span>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={stats.pendingClient} />
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Awaiting OTP / Docs</p>
            </div>

            {/* Pending from Department */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Dept</span>
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={stats.pendingDept} />
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Government clearance</p>
            </div>

            {/* Sent for Review */}
            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Sent for Review</span>
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={stats.review} />
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Internal validation</p>
            </div>

            {/* Completed */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                <AnimatedCounter value={stats.completed} />
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Delivered successfully</p>
            </div>
          </div>

          {/* Quick Action Link */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Statutory SLA operations & progress tracker
            </span>
            <Link
              href="/dashboard/tasks"
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            >
              <span>View all my assigned tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

