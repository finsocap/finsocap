"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users, CheckSquare, IndianRupee, Calendar,
  ChevronDown, ArrowUp, ArrowDown, Clock, CheckCircle2,
  Store, FileText, Check, ChevronRight,
  Target, ListChecks, AlertCircle, RotateCcw, Filter, MapPin,
  LayoutDashboard
} from "lucide-react";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import LeadsRevenueChart from "@/components/Charts/LeadsRevenueChart";
import ServiceDistributionDonut from "@/components/Charts/ServiceDistributionDonut";
import BotrixSparklineCard from "@/components/Charts/BotrixSparklineCard";
import DateRangeFilter from "@/components/Dashboard/DateRangeFilter";
import PartnerFilter from "@/components/Dashboard/PartnerFilter";
import PageBanner from "@/components/Dashboard/PageBanner";

interface BranchStats {
  leads: number;
  leadsDelta: string;
  leadsPositive: boolean;
  clients: number;
  clientsDelta: string;
  clientsPositive: boolean;
  tasks: number;
  tasksDelta: string;
  tasksPositive: boolean;
  revenue: string;
  revenueDelta: string;
  revenuePositive: boolean;
  barHeightsLeads: number[];
  barHeightsClients: number[];
  barHeightsTasks: number[];
  barHeightsRevenue: number[];
  taskSummary: {
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
    overdue: number;
  };
}

const BRANCH_DATA_MAP: Record<string, BranchStats> = {
  "All Branches": {
    leads: 1248,
    leadsDelta: "12%",
    leadsPositive: true,
    clients: 842,
    clientsDelta: "8%",
    clientsPositive: true,
    tasks: 96,
    tasksDelta: "5%",
    tasksPositive: false,
    revenue: "₹8,72,500",
    revenueDelta: "22%",
    revenuePositive: true,
    barHeightsLeads: [35, 50, 40, 65, 55, 80, 70, 95, 60, 85, 45, 75, 90, 100, 65, 80, 88, 95, 75, 90],
    barHeightsClients: [45, 60, 50, 70, 65, 85, 55, 75, 90, 80, 70, 85, 65, 92, 78, 88, 70, 85, 90, 95],
    barHeightsTasks: [60, 45, 55, 40, 70, 50, 80, 65, 75, 60, 85, 70, 90, 80, 65, 70, 85, 90, 75, 60],
    barHeightsRevenue: [40, 55, 60, 75, 70, 88, 65, 92, 85, 98, 75, 90, 85, 100, 90, 95, 85, 100, 92, 98],
    taskSummary: { pending: 24, inProgress: 18, review: 12, completed: 46, overdue: 8 },
  },
  "Delhi HQ": {
    leads: 512,
    leadsDelta: "14%",
    leadsPositive: true,
    clients: 360,
    clientsDelta: "10%",
    clientsPositive: true,
    tasks: 38,
    tasksDelta: "2%",
    tasksPositive: false,
    revenue: "₹3,84,000",
    revenueDelta: "24%",
    revenuePositive: true,
    barHeightsLeads: [40, 60, 50, 75, 65, 90, 80, 100, 70, 95, 55, 85, 95, 100, 75, 90, 95, 100, 85, 95],
    barHeightsClients: [50, 70, 60, 80, 75, 90, 65, 85, 95, 88, 75, 90, 70, 95, 85, 92, 78, 90, 95, 98],
    barHeightsTasks: [45, 35, 45, 30, 60, 40, 65, 50, 60, 45, 70, 55, 75, 65, 50, 55, 70, 75, 60, 48],
    barHeightsRevenue: [45, 60, 70, 80, 75, 92, 70, 96, 90, 100, 80, 95, 90, 100, 95, 98, 90, 100, 95, 100],
    taskSummary: { pending: 10, inProgress: 8, review: 5, completed: 22, overdue: 3 },
  },
  "Noida Branch": {
    leads: 224,
    leadsDelta: "9%",
    leadsPositive: true,
    clients: 142,
    clientsDelta: "6%",
    clientsPositive: true,
    tasks: 18,
    tasksDelta: "4%",
    tasksPositive: false,
    revenue: "₹1,48,000",
    revenueDelta: "15%",
    revenuePositive: true,
    barHeightsLeads: [25, 40, 30, 55, 45, 70, 60, 80, 50, 75, 35, 65, 75, 85, 55, 70, 75, 85, 65, 80],
    barHeightsClients: [35, 50, 40, 60, 55, 75, 45, 65, 80, 70, 60, 75, 55, 80, 68, 78, 60, 75, 80, 85],
    barHeightsTasks: [50, 38, 45, 32, 58, 42, 68, 55, 62, 50, 72, 58, 76, 68, 55, 60, 72, 78, 62, 50],
    barHeightsRevenue: [35, 48, 52, 65, 60, 78, 58, 82, 75, 88, 65, 80, 75, 90, 80, 85, 78, 90, 82, 88],
    taskSummary: { pending: 5, inProgress: 3, review: 2, completed: 7, overdue: 2 },
  },
  "Mumbai Regional": {
    leads: 286,
    leadsDelta: "18%",
    leadsPositive: true,
    clients: 195,
    clientsDelta: "12%",
    clientsPositive: true,
    tasks: 24,
    tasksDelta: "8%",
    tasksPositive: false,
    revenue: "₹2,12,000",
    revenueDelta: "26%",
    revenuePositive: true,
    barHeightsLeads: [30, 48, 42, 68, 58, 85, 75, 96, 65, 90, 50, 80, 92, 98, 70, 85, 90, 98, 80, 92],
    barHeightsClients: [40, 55, 48, 68, 62, 82, 52, 72, 88, 78, 68, 82, 62, 88, 75, 85, 68, 82, 88, 92],
    barHeightsTasks: [55, 40, 50, 35, 65, 45, 75, 60, 70, 55, 80, 65, 85, 75, 60, 65, 80, 85, 70, 55],
    barHeightsRevenue: [38, 52, 58, 72, 68, 85, 62, 90, 82, 95, 72, 88, 82, 98, 88, 92, 82, 98, 90, 96],
    taskSummary: { pending: 6, inProgress: 4, review: 3, completed: 12, overdue: 2 },
  },
  "Bengaluru Tech Hub": {
    leads: 136,
    leadsDelta: "21%",
    leadsPositive: true,
    clients: 85,
    clientsDelta: "15%",
    clientsPositive: true,
    tasks: 10,
    tasksDelta: "10%",
    tasksPositive: false,
    revenue: "₹88,000",
    revenueDelta: "28%",
    revenuePositive: true,
    barHeightsLeads: [20, 35, 28, 50, 40, 65, 55, 75, 45, 70, 30, 60, 70, 80, 50, 65, 70, 80, 60, 75],
    barHeightsClients: [30, 45, 38, 55, 50, 70, 40, 60, 75, 65, 55, 70, 50, 75, 62, 72, 55, 70, 75, 80],
    barHeightsTasks: [45, 32, 40, 28, 52, 38, 62, 48, 55, 42, 65, 50, 70, 60, 48, 52, 65, 70, 55, 42],
    barHeightsRevenue: [30, 42, 48, 60, 55, 72, 52, 78, 70, 82, 58, 75, 70, 85, 75, 80, 72, 85, 78, 82],
    taskSummary: { pending: 2, inProgress: 2, review: 1, completed: 3, overdue: 1 },
  },
  "Kolkata Hub": {
    leads: 90,
    leadsDelta: "5%",
    leadsPositive: true,
    clients: 60,
    clientsDelta: "4%",
    clientsPositive: true,
    tasks: 6,
    tasksDelta: "0%",
    tasksPositive: true,
    revenue: "₹40,500",
    revenueDelta: "8%",
    revenuePositive: true,
    barHeightsLeads: [18, 30, 24, 45, 35, 58, 48, 68, 38, 62, 28, 52, 62, 72, 42, 58, 62, 72, 52, 68],
    barHeightsClients: [25, 38, 32, 48, 42, 62, 35, 52, 68, 58, 48, 62, 42, 68, 55, 65, 48, 62, 68, 72],
    barHeightsTasks: [40, 28, 35, 22, 48, 32, 55, 42, 48, 35, 58, 45, 62, 52, 40, 45, 58, 62, 48, 35],
    barHeightsRevenue: [25, 35, 40, 52, 48, 65, 45, 70, 62, 75, 50, 68, 62, 78, 68, 72, 65, 78, 70, 75],
    taskSummary: { pending: 1, inProgress: 1, review: 1, completed: 2, overdue: 0 },
  },
};

export default function DashboardHome() {
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 30 Sep 2026");
  const [selectedPartner, setSelectedPartner] = useState("All Partners");
  const [taskSummaryFilter, setTaskSummaryFilter] = useState<"Today" | "This Week" | "This Month">("Today");
  const [isTaskFilterOpen, setIsTaskFilterOpen] = useState(false);

  // Recent Leads Data matching Screenshot with branch assignment
  const allRecentLeads = [
    { id: "L-1001", name: "Rahul Sharma", service: "FSSAI Registration", source: "Website", status: "New", date: "26 Sep 2026", branch: "Delhi HQ", partner: "P-101 • Rahul Jha" },
    { id: "L-1002", name: "Priya Verma", service: "GST Registration", source: "Phone", status: "Follow Up", date: "26 Sep 2026", branch: "Mumbai Regional", partner: "P-103 • Gaurav" },
    { id: "L-1003", name: "Aman Gupta", service: "Trademark", source: "Google Ads", status: "In Progress", date: "25 Sep 2026", branch: "Delhi HQ", partner: "P-101 • Rahul Jha" },
    { id: "L-1004", name: "Neha Singh", service: "ITR Filing", source: "Referral", status: "Converted", date: "25 Sep 2026", branch: "Noida Branch", partner: "P-102 • Kanhaiya" },
    { id: "L-1005", name: "Vikram Patel", service: "Shop Act License", source: "Direct Visit", status: "New", date: "24 Sep 2026", branch: "Mumbai Regional", partner: "P-103 • Gaurav" },
    { id: "L-1006", name: "Meera Kapoor", service: "GST Registration", source: "Website", status: "Follow Up", date: "24 Sep 2026", branch: "Delhi HQ", partner: "P-101 • Rahul Jha" },
    { id: "L-1007", name: "Suresh Yadav", service: "FSSAI + GST", source: "Phone", status: "In Progress", date: "23 Sep 2026", branch: "Noida Branch", partner: "P-102 • Kanhaiya" },
    { id: "L-1008", name: "Anjali Singh", service: "Trademark", source: "Google Ads", status: "Converted", date: "22 Sep 2026", branch: "Bengaluru Tech Hub", partner: "P-104 • Roshan" },
    { id: "L-1009", name: "Debabrata Roy", service: "Trade License", source: "Referral", status: "New", date: "21 Sep 2026", branch: "Kolkata Hub", partner: "P-105 • Roshni" },
    { id: "L-1010", name: "Tanvi Deshmukh", service: "FSSAI Central", source: "Website", status: "In Progress", date: "20 Sep 2026", branch: "Mumbai Regional", partner: "P-103 • Gaurav" },
  ];

  // Team Activity with partner assignment
  const allTeamActivities = [
    { id: "act-1", initials: "AK", name: "Ankit Kumar", role: "Executive", text: "Added new lead - Rahul Sharma", time: "10:24 AM", color: "bg-sky-500 text-white", branch: "Delhi HQ", partner: "P-101 • Rahul Jha" },
    { id: "act-2", initials: "PM", name: "Pooja Mehta", role: "CA", text: "Updated GST filing documents", time: "09:45 AM", color: "bg-purple-600 text-white", branch: "Mumbai Regional", partner: "P-103 • Gaurav" },
    { id: "act-3", initials: "RJ", name: "Rohit Jain", role: "CS", text: "Marked Trademark application as submitted", time: "09:20 AM", color: "bg-indigo-500 text-white", branch: "Delhi HQ", partner: "P-101 • Rahul Jha" },
    { id: "act-4", initials: "NV", name: "Neha Verma", role: "Legal Executive", text: "Added task for document verification", time: "08:50 AM", color: "bg-slate-800 text-white", branch: "Noida Branch", partner: "P-102 • Kanhaiya" },
    { id: "act-5", initials: "VS", name: "Vikram Singh", role: "Executive", text: "Uploaded client agreement", time: "08:30 AM", color: "bg-blue-600 text-white", branch: "Mumbai Regional", partner: "P-103 • Gaurav" },
    { id: "act-6", initials: "MK", name: "Meera Kapoor", role: "CA", text: "Completed ITR filing for client", time: "08:15 AM", color: "bg-amber-600 text-white", branch: "Delhi HQ", partner: "P-101 • Rahul Jha" },
    { id: "act-7", initials: "SS", name: "Suresh Sharma", role: "CS", text: "Added note in client profile", time: "07:45 AM", color: "bg-purple-500 text-white", branch: "Bengaluru Tech Hub", partner: "P-104 • Roshan" },
    { id: "act-8", initials: "PR", name: "Priya Rathi", role: "Executive", text: "Updated FSSAI application status", time: "07:20 AM", color: "bg-pink-500 text-white", branch: "Kolkata Hub", partner: "P-105 • Roshni" },
  ];

  // Dynamically compute stats according to selectedPartner and dateRange
  const activeStats = useMemo(() => {
    let mappedKey = "All Branches";
    if (selectedPartner.includes("P-101") || selectedPartner.includes("Rahul")) mappedKey = "Delhi HQ";
    else if (selectedPartner.includes("P-102") || selectedPartner.includes("Kanhaiya")) mappedKey = "Noida Branch";
    else if (selectedPartner.includes("P-103") || selectedPartner.includes("Gaurav")) mappedKey = "Mumbai Regional";
    else if (selectedPartner.includes("P-104") || selectedPartner.includes("Roshan")) mappedKey = "Bengaluru Tech Hub";
    else if (selectedPartner.includes("P-105") || selectedPartner.includes("Roshni")) mappedKey = "Kolkata Hub";

    const base = BRANCH_DATA_MAP[mappedKey] || BRANCH_DATA_MAP["All Branches"];

    // Date range multiplier
    let dateMultiplier = 1.0;
    let periodLabel = "this month";

    if (dateRange.includes("Today") || dateRange.includes("Yesterday")) {
      dateMultiplier = 0.035;
      periodLabel = "today";
    } else if (dateRange.includes("Last 7 Days")) {
      dateMultiplier = 0.25;
      periodLabel = "past 7 days";
    } else if (dateRange.includes("Last Month") || dateRange.includes("Aug")) {
      dateMultiplier = 0.88;
      periodLabel = "last month";
    } else if (dateRange.includes("Quarter") || dateRange.includes("FY")) {
      dateMultiplier = 2.8;
      periodLabel = "this quarter";
    }

    const leadsVal = Math.max(1, Math.round(base.leads * dateMultiplier));
    const clientsVal = Math.max(1, Math.round(base.clients * (dateMultiplier > 1 ? 1.6 : Math.max(0.08, dateMultiplier))));
    const tasksVal = Math.max(1, Math.round(base.tasks * (dateMultiplier < 0.1 ? 0.35 : dateMultiplier > 1 ? 1.4 : 1.0)));

    // Parse revenue to format properly
    const rawRevenue = base.revenue.replace(/[^0-9]/g, "");
    const baseRevenueNum = parseInt(rawRevenue, 10) * 10;
    const computedRevenue = Math.round(baseRevenueNum * dateMultiplier);

    let formattedRevenue = `₹${computedRevenue.toLocaleString("en-IN")}`;
    if (computedRevenue >= 100000) {
      formattedRevenue = `₹${(computedRevenue / 100000).toFixed(2)}L`;
    }

    return {
      leads: leadsVal,
      leadsDelta: base.leadsDelta,
      leadsPositive: base.leadsPositive,
      clients: clientsVal,
      clientsDelta: base.clientsDelta,
      clientsPositive: base.clientsPositive,
      tasks: tasksVal,
      tasksDelta: base.tasksDelta,
      tasksPositive: base.tasksPositive,
      revenue: formattedRevenue,
      revenueDelta: base.revenueDelta,
      revenuePositive: base.revenuePositive,
      periodLabel,
      barHeightsLeads: base.barHeightsLeads,
      barHeightsClients: base.barHeightsClients,
      barHeightsTasks: base.barHeightsTasks,
      barHeightsRevenue: base.barHeightsRevenue,
      taskSummary: base.taskSummary,
    };
  }, [selectedPartner, dateRange]);

  // Compute Task Summary according to taskSummaryFilter
  const activeTaskCounts = useMemo(() => {
    const summary = activeStats.taskSummary;
    if (taskSummaryFilter === "Today") {
      return {
        pending: Math.max(1, Math.round(summary.pending * 0.3)),
        inProgress: Math.max(1, Math.round(summary.inProgress * 0.45)),
        review: Math.max(1, Math.round(summary.review * 0.35)),
        completed: Math.max(1, Math.round(summary.completed * 0.35)),
        overdue: Math.max(0, Math.round(summary.overdue * 0.25)),
      };
    }
    if (taskSummaryFilter === "This Week") {
      return {
        pending: Math.max(1, Math.round(summary.pending * 0.65)),
        inProgress: Math.max(1, Math.round(summary.inProgress * 0.7)),
        review: Math.max(1, Math.round(summary.review * 0.65)),
        completed: Math.max(1, Math.round(summary.completed * 0.65)),
        overdue: Math.max(1, Math.round(summary.overdue * 0.6)),
      };
    }
    return summary;
  }, [activeStats.taskSummary, taskSummaryFilter]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    if (selectedPartner === "All Partners") {
      return allRecentLeads.slice(0, 8);
    }
    const partnerSpecific = allRecentLeads.filter((l) => l.partner.includes(selectedPartner) || selectedPartner.includes(l.partner));
    if (partnerSpecific.length < 4) {
      const others = allRecentLeads.filter((l) => !l.partner.includes(selectedPartner));
      return [...partnerSpecific, ...others.slice(0, 8 - partnerSpecific.length)];
    }
    return partnerSpecific.slice(0, 8);
  }, [selectedPartner]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    if (selectedPartner === "All Partners") {
      return allTeamActivities.slice(0, 8);
    }
    const partnerSpecific = allTeamActivities.filter((a) => a.partner?.includes(selectedPartner) || selectedPartner.includes(a.partner || ""));
    if (partnerSpecific.length < 4) {
      const others = allTeamActivities.filter((a) => !a.partner?.includes(selectedPartner));
      return [...partnerSpecific, ...others.slice(0, 8 - partnerSpecific.length)];
    }
    return partnerSpecific.slice(0, 8);
  }, [selectedPartner]);

  const handleResetFilters = () => {
    setDateRange("01 Sep 2026 - 30 Sep 2026");
    setSelectedPartner("All Partners");
  };

  const isFilteringActive =
    selectedPartner !== "All Partners" ||
    dateRange !== "01 Sep 2026 - 30 Sep 2026";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80";
      case "Follow Up":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80";
      case "In Progress":
        return "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/80";
      case "Converted":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">

      {/* 1. Executive Branded Command Banner (Signature Finsocap Glassmorphic Gradient) */}
      <PageBanner
        icon={LayoutDashboard}
        badge="Finsocap Intelligence Suite"
        badgeMeta="Enterprise Multi-Partner Operations"
        title="Executive Dashboard"
        description="Manage your team, leads, clients, tasks and overall business operations in real-time."
        bottomMeta={`Partner: ${selectedPartner} • Cycle: ${dateRange}`}
        actions={
          <>
            <DateRangeFilter
              value={dateRange}
              onChange={(preset) => setDateRange(preset.label)}
            />
            <PartnerFilter
              value={selectedPartner}
              onChange={(p) => setSelectedPartner(p.shortName)}
            />
          </>
        }
      />

      {/* Active Filter Indicator Bar (Shown when filtered) */}
      {isFilteringActive && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/90 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-900 dark:text-sky-200 font-medium">
              Filtered by Partner:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 font-bold text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              {selectedPartner}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 font-bold text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              {dateRange}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline">
              (All metrics and charts updated)
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 dark:text-sky-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* 2. Top 4 KPI Stat Cards with Botrix Micro-Bars Soundwave Sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BotrixSparklineCard
          title="Total Leads"
          value={activeStats.leads}
          delta={activeStats.leadsDelta}
          deltaPositive={activeStats.leadsPositive}
          subtitle={`New inquiries (${activeStats.periodLabel})`}
          icon={<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-50 dark:bg-indigo-950/60"
          barColor="bg-indigo-500"
          barHeights={activeStats.barHeightsLeads}
        />

        <BotrixSparklineCard
          title="Active Clients"
          value={activeStats.clients}
          delta={activeStats.clientsDelta}
          deltaPositive={activeStats.clientsPositive}
          subtitle="Ongoing & completed"
          icon={<Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-50 dark:bg-purple-950/60"
          barColor="bg-purple-500"
          barHeights={activeStats.barHeightsClients}
        />

        <BotrixSparklineCard
          title="Open Tasks"
          value={activeStats.tasks}
          delta={activeStats.tasksDelta}
          deltaPositive={activeStats.tasksPositive}
          subtitle={`Pending team tasks (${selectedPartner === "All Partners" ? "all hubs" : selectedPartner})`}
          icon={<CheckSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          barColor="bg-amber-500"
          barHeights={activeStats.barHeightsTasks}
        />

        <BotrixSparklineCard
          title={`Revenue (${activeStats.periodLabel})`}
          value={activeStats.revenue}
          delta={activeStats.revenueDelta}
          deltaPositive={activeStats.revenuePositive}
          subtitle="Total invoiced amount"
          icon={<span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹</span>}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          barColor="bg-emerald-500"
          barHeights={activeStats.barHeightsRevenue}
        />
      </div>

      {/* 3. Classic View: Charts & Task Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* Col 1: Leads & Revenue Overview (5 cols) */}
        <div className="lg:col-span-5 h-[300px]">
          <LeadsRevenueChart
            selectedBranch={selectedPartner}
            dateRange={dateRange}
          />
        </div>

        {/* Col 2: Service-wise Distribution (4 cols) */}
        <div className="lg:col-span-4 h-[300px]">
          <ServiceDistributionDonut
            selectedBranch={selectedPartner}
          />
        </div>

        {/* Col 3: Task Summary (3 cols) matching Reference Screenshot */}
        <div className="lg:col-span-3 h-[300px] bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between relative">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
              Task Summary
            </h3>

            {/* Functional Task Summary Timeframe Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTaskFilterOpen(!isTaskFilterOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
              >
                <span>{taskSummaryFilter}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isTaskFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTaskFilterOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1 text-[11px] font-semibold animate-in fade-in zoom-in-95 duration-100">
                    {(["Today", "This Week", "This Month"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setTaskSummaryFilter(opt);
                          setIsTaskFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                          taskSummaryFilter === opt
                            ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-sky-400 font-bold"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{opt}</span>
                        {taskSummaryFilter === opt && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 5 Rows matching reference screenshot with dynamic data */}
          <div className="space-y-2.5 my-auto">

            {/* 1. Pending Tasks */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pending Tasks
                </span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {activeTaskCounts.pending}
              </span>
            </div>

            {/* 2. In Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  In Progress
                </span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {activeTaskCounts.inProgress}
              </span>
            </div>

            {/* 3. Under Review */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <ListChecks className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Under Review
                </span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {activeTaskCounts.review}
              </span>
            </div>

            {/* 4. Completed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Completed
                </span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {activeTaskCounts.completed}
              </span>
            </div>

            {/* 5. Overdue (Red Bold) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Overdue
                </span>
              </div>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                {activeTaskCounts.overdue}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Recent Leads / Clients (7 cols) & Team Activity (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* Left: Recent Leads / Clients Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                Recent Leads / Clients
              </h3>
              {selectedPartner !== "All Partners" && (
                <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800">
                  {selectedPartner}
                </span>
              )}
            </div>
            <Link
              href="/dashboard/tasks"
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-4">Partner ID &amp; Hub</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-bold text-blue-600 dark:text-sky-400">
                      {lead.id}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                      {lead.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {lead.service}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {lead.partner}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded-md font-bold text-[10px] ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 font-semibold text-[11px]">
                      {lead.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Team Activity (5 cols) matching Reference Screenshot */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                Team Activity
              </h3>
              {selectedPartner !== "All Partners" && (
                <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800">
                  {selectedPartner}
                </span>
              )}
            </div>
            <Link
              href="/dashboard/team"
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                  <th className="py-2.5 px-2">User</th>
                  <th className="py-2.5 px-2">Role</th>
                  <th className="py-2.5 px-2">Activity</th>
                  <th className="py-2.5 px-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${act.color}`}>
                          {act.initials}
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-bold text-slate-900 dark:text-white truncate block max-w-[85px] text-[11px]">
                            {act.name}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate block">
                            {act.branch}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-500 dark:text-slate-400 text-[11px]">
                      {act.role}
                    </td>
                    <td className="py-2 px-2 text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[150px]">
                      {act.text}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400 text-[10px] font-semibold whitespace-nowrap">
                      {act.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
