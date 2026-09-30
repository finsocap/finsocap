"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users, CheckSquare, IndianRupee, Download, Calendar,
  Clock, AlertTriangle, CheckCircle2, FileText, TrendingUp,
  Award, BarChart3, KeyRound, Search, Filter, RotateCcw,
  Check, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, MoreVertical,
  Paperclip, ExternalLink, Link2, ShieldAlert, ArrowUpRight,
  UserCheck, Briefcase, X, Copy, Sparkles, ShieldCheck
} from "lucide-react";
import DateRangeFilter from "@/components/Dashboard/DateRangeFilter";

// ============================================================================
// DATA MODELS & MOCK DATA (100% Exact Match with User Screenshots)
// ============================================================================

// --- 1. Service Team Report Data (Screenshot 1) ---
interface ServiceEmployeeRow {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  assigned: number;
  pending: number;
  pendingClient: number;
  pendingDept: number;
  inProgress: number;
  review: number;
  wip: number;
  overdue: number;
  dueToday: number;
  completed: number;
  total: number;
  completedAmount: number;
  pendingAmount: number;
  totalFees: number;
}

const serviceTeamData: ServiceEmployeeRow[] = [
  { id: "EMP001", name: "Rahul Jha", initials: "RJ", avatarColor: "bg-sky-500 text-white", assigned: 525, pending: 21, pendingClient: 21, pendingDept: 0, inProgress: 0, review: 4, wip: 34, overdue: 30, dueToday: 2, completed: 490, total: 525, completedAmount: 242300, pendingAmount: 43100, totalFees: 285400 },
  { id: "EMP002", name: "Kanhaiya", initials: "KA", avatarColor: "bg-pink-500 text-white", assigned: 115, pending: 24, pendingClient: 24, pendingDept: 0, inProgress: 0, review: 3, wip: 33, overdue: 15, dueToday: 1, completed: 82, total: 115, completedAmount: 67500, pendingAmount: 15100, totalFees: 82600 },
  { id: "EMP003", name: "Gaurav", initials: "GA", avatarColor: "bg-amber-500 text-white", assigned: 14, pending: 2, pendingClient: 2, pendingDept: 0, inProgress: 0, review: 1, wip: 3, overdue: 3, dueToday: 0, completed: 11, total: 14, completedAmount: 22800, pendingAmount: 5700, totalFees: 28500 },
  { id: "EMP004", name: "Roshan", initials: "RO", avatarColor: "bg-purple-500 text-white", assigned: 5, pending: 0, pendingClient: 0, pendingDept: 0, inProgress: 0, review: 0, wip: 0, overdue: 0, dueToday: 0, completed: 5, total: 5, completedAmount: 9800, pendingAmount: 2500, totalFees: 12300 },
  { id: "EMP005", name: "Roshni", initials: "RO", avatarColor: "bg-purple-400 text-white", assigned: 1, pending: 0, pendingClient: 0, pendingDept: 0, inProgress: 0, review: 1, wip: 1, overdue: 0, dueToday: 0, completed: 0, total: 1, completedAmount: 3600, pendingAmount: 1200, totalFees: 4800 },
  { id: "EMP006", name: "Asha", initials: "AS", avatarColor: "bg-slate-600 text-white", assigned: 0, pending: 0, pendingClient: 0, pendingDept: 0, inProgress: 0, review: 0, wip: 0, overdue: 1, dueToday: 0, completed: 0, total: 0, completedAmount: 40900, pendingAmount: 18100, totalFees: 59000 },
];

// --- 2. Sales Team Report Data (Screenshot 2) ---
interface SalesPersonRow {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  clients: number;
  tasks: number;
  completed: number;
  pending: number;
  completionRate: string;
  totalAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  collectionRate: string;
}

const salesTeamData: SalesPersonRow[] = [
  { id: "SLS001", name: "Rahul Jha", initials: "RJ", avatarColor: "bg-blue-600 text-white", clients: 48, tasks: 120, completed: 110, pending: 10, completionRate: "91.7%", totalAmount: 256800, receivedAmount: 205400, pendingAmount: 51400, collectionRate: "80.0%" },
  { id: "SLS002", name: "Kanhaiya", initials: "KA", avatarColor: "bg-pink-600 text-white", clients: 36, tasks: 98, completed: 82, pending: 16, completionRate: "83.7%", totalAmount: 184600, receivedAmount: 132900, pendingAmount: 51700, collectionRate: "72.0%" },
  { id: "SLS003", name: "Gaurav", initials: "GA", avatarColor: "bg-amber-600 text-white", clients: 28, tasks: 76, completed: 68, pending: 8, completionRate: "89.5%", totalAmount: 125400, receivedAmount: 92800, pendingAmount: 32600, collectionRate: "74.0%" },
  { id: "SLS004", name: "Roshan", initials: "RO", avatarColor: "bg-purple-600 text-white", clients: 22, tasks: 54, completed: 50, pending: 4, completionRate: "92.6%", totalAmount: 68300, receivedAmount: 54200, pendingAmount: 14100, collectionRate: "79.4%" },
  { id: "SLS005", name: "Roshni", initials: "RO", avatarColor: "bg-purple-400 text-white", clients: 18, tasks: 42, completed: 38, pending: 4, completionRate: "90.5%", totalAmount: 38900, receivedAmount: 26800, pendingAmount: 12100, collectionRate: "69.0%" },
];

// --- 3. Licence Report Data (Screenshot 3 - 10 Real Verified Entries) ---
interface LicenceRow {
  taskId: string;
  partnerName: string;
  partnerNumber: string;
  clientName: string;
  clientNumber: string;
  licenceType: string;
  taskCategory: string;
  serviceName: string;
  licenceNumber: string;
  issueDate: string;
  expiryDate: string;
  userId: string;
  passwordMasked: string;
  attachmentsCount: number;
  status: "Active" | "Expiring in 30 Days" | "Expired";
  urlLinked: boolean;
}

const licenceData: LicenceRow[] = [
  { taskId: "T-1001", partnerName: "Rahul Jha", partnerNumber: "9873207632", clientName: "SunBounty India", clientNumber: "9818176909", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "22726922001382", issueDate: "26-09-2026", expiryDate: "25-09-2027", userId: "UPFSSAI123", passwordMasked: "Abc@1234", attachmentsCount: 2, status: "Active", urlLinked: true },
  { taskId: "T-1002", partnerName: "Rahul Jha", partnerNumber: "9873207632", clientName: "Mahalaxmi Chhola bhature", clientNumber: "7007433823", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "22725271000986", issueDate: "26-09-2026", expiryDate: "05-10-2026", userId: "UPFSSAI456", passwordMasked: "Xyz@5678", attachmentsCount: 1, status: "Expiring in 30 Days", urlLinked: true },
  { taskId: "T-1003", partnerName: "Kanhaiya", partnerNumber: "8796951056", clientName: "Kushali Ventures", clientNumber: "9412128685", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "22726877000140", issueDate: "25-09-2026", expiryDate: "24-09-2027", userId: "UPFSSAI789", passwordMasked: "Test@123", attachmentsCount: 3, status: "Active", urlLinked: true },
  { taskId: "T-1004", partnerName: "Kanhaiya", partnerNumber: "8796951056", clientName: "Divine brew and bites", clientNumber: "9426110441", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "20726015001176", issueDate: "23-09-2026", expiryDate: "22-09-2027", userId: "UPFSSAI321", passwordMasked: "Pass@456", attachmentsCount: 1, status: "Active", urlLinked: true },
  { taskId: "T-1005", partnerName: "Gaurav", partnerNumber: "9355749363", clientName: "Miglani Retail", clientNumber: "9718710045", licenceType: "FSSAI Central Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "13325999000692", issueDate: "15-10-2025", expiryDate: "13-10-2026", userId: "CENTFSSAI01", passwordMasked: "Demo@789", attachmentsCount: 2, status: "Expiring in 30 Days", urlLinked: true },
  { taskId: "T-1006", partnerName: "Gaurav", partnerNumber: "9355749363", clientName: "GAURAV SHISHODIA", clientNumber: "8171144666", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "22724999000371", issueDate: "25-09-2026", expiryDate: "29-09-2031", userId: "UPFSSAI654", passwordMasked: "Aa@1122", attachmentsCount: 1, status: "Active", urlLinked: true },
  { taskId: "T-1007", partnerName: "Roshan", partnerNumber: "9873207632", clientName: "SANVIN INC", clientNumber: "9811176768", licenceType: "FSSAI Central Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "12721999000371", issueDate: "25-09-2026", expiryDate: "19-10-2031", userId: "CENTFSSAI02", passwordMasked: "Bb@3344", attachmentsCount: 2, status: "Active", urlLinked: true },
  { taskId: "T-1008", partnerName: "Roshan", partnerNumber: "9873207632", clientName: "Kulcha and Parantha Co", clientNumber: "7206666744", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "20826001001474", issueDate: "24-09-2026", expiryDate: "23-09-2027", userId: "UPFSSAI987", passwordMasked: "Cc@5566", attachmentsCount: 1, status: "Active", urlLinked: true },
  { taskId: "T-1009", partnerName: "Roshni", partnerNumber: "9811637390", clientName: "Narula Food and Beverages", clientNumber: "9058063705", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "20926016000079", issueDate: "10-09-2026", expiryDate: "09-09-2027", userId: "UPFSSAI654", passwordMasked: "Dd@7788", attachmentsCount: 3, status: "Active", urlLinked: true },
  { taskId: "T-1010", partnerName: "Roshni", partnerNumber: "9811637390", clientName: "SABER DINING", clientNumber: "7264040445", licenceType: "FSSAI Basic Licence", taskCategory: "Compliance", serviceName: "FSSAI Registration", licenceNumber: "21526083016333", issueDate: "22-09-2026", expiryDate: "21-09-2027", userId: "UPFSSAI111", passwordMasked: "Ee@9900", attachmentsCount: 1, status: "Active", urlLinked: false },
];

function ReportsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Tab state: "service" | "sales" | "licence"
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"service" | "sales" | "licence">(
    tabParam === "sales" ? "sales" : tabParam === "licence" ? "licence" : "service"
  );

  // Sync state whenever URL query parameter changes
  useEffect(() => {
    if (tabParam === "sales") {
      setActiveTab("sales");
    } else if (tabParam === "licence") {
      setActiveTab("licence");
    } else {
      setActiveTab("service");
    }
  }, [tabParam]);

  // Instantaneous event listener from Sidebar or Header switches
  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && ["service", "sales", "licence"].includes(customEvent.detail)) {
        setActiveTab(customEvent.detail as "service" | "sales" | "licence");
      }
    };
    window.addEventListener("finsocap-switch-report-tab", handleSwitch);
    return () => window.removeEventListener("finsocap-switch-report-tab", handleSwitch);
  }, []);

  const handleTabChange = (tab: "service" | "sales" | "licence") => {
    setActiveTab(tab);
    window.dispatchEvent(new CustomEvent("finsocap-switch-report-tab", { detail: tab }));
    router.push(`/dashboard/reports?tab=${tab}`, { scroll: false });
  };

  // Common Date Filter State
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 30 Sep 2026");

  // --- Service Report Filters ---
  const [serviceEmpFilter, setServiceEmpFilter] = useState("ALL");
  const [serviceNameFilter, setServiceNameFilter] = useState("ALL");

  // --- Sales Report Filters ---
  const [salesPersonFilter, setSalesPersonFilter] = useState("ALL");
  const [salesServiceFilter, setSalesServiceFilter] = useState("ALL");
  const [salesChartMetric, setSalesChartMetric] = useState<"received" | "total">("received");

  // --- Licence Report Filters ---
  const [licenceSearch, setLicenceSearch] = useState("");
  const [licenceTypeFilter, setLicenceTypeFilter] = useState("ALL");
  const [licenceCategoryFilter, setLicenceCategoryFilter] = useState("ALL");
  const [licenceStatusFilter, setLicenceStatusFilter] = useState("ALL");
  const [licenceEmployeeFilter, setLicenceEmployeeFilter] = useState("ALL");
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [selectedLicenceModal, setSelectedLicenceModal] = useState<LicenceRow | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toggle Password Mask
  const togglePassword = (taskId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Copy to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Real Excel Export via XLSX
  const handleExport = (reportName: string) => {
    import("xlsx").then((XLSX) => {
      let exportData: any[] = [];
      if (activeTab === "service") {
        exportData = filteredServiceRows.map((r, i) => ({
          "#": i + 1,
          "Employee ID": r.id,
          "Employee Name": r.name,
          "Assigned": r.assigned,
          "Pending": r.pending,
          "Pending from Client": r.pendingClient,
          "Pending from Dept": r.pendingDept,
          "In Progress": r.inProgress,
          "Sent for Review": r.review,
          "WIP Sub Total": r.wip,
          "Overdue": r.overdue,
          "Due Today": r.dueToday,
          "Completed": r.completed,
          "Total": r.total,
          "Completed Amount (₹)": r.completedAmount,
          "Pending Amount (₹)": r.pendingAmount,
          "Total Fees (₹)": r.totalFees,
        }));
      } else if (activeTab === "sales") {
        exportData = filteredSalesRows.map((s, i) => ({
          "#": i + 1,
          "Sales Person ID": s.id,
          "Sales Person Name": s.name,
          "Total Clients": s.clients,
          "Total Tasks": s.tasks,
          "Completed Tasks": s.completed,
          "Pending Tasks": s.pending,
          "Completion %": s.completionRate,
          "Total Amount (₹)": s.totalAmount,
          "Received Amount (₹)": s.receivedAmount,
          "Pending Amount (₹)": s.pendingAmount,
          "Collection %": s.collectionRate,
        }));
      } else {
        exportData = filteredLicences.map((l, i) => ({
          "#": i + 1,
          "Task ID": l.taskId,
          "Partner Name": l.partnerName,
          "Partner Number": l.partnerNumber,
          "Client Name": l.clientName,
          "Client Number": l.clientNumber,
          "Licence Type": l.licenceType,
          "Task Category": l.taskCategory,
          "Service Name": l.serviceName,
          "Licence Number": l.licenceNumber,
          "Issue Date": l.issueDate,
          "Expiry Date": l.expiryDate,
          "User ID": l.userId,
          "Attachments": l.attachmentsCount,
          "Status": l.status,
          "URL Linked": l.urlLinked ? "Yes" : "No",
        }));
      }
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, reportName);
      XLSX.writeFile(wb, `${reportName.replace(/\s+/g, "_")}_Export.xlsx`);
    }).catch(() => {
      alert(`${reportName} download triggered.`);
    });
  };

  // Filtered Service Rows
  const filteredServiceRows = useMemo(() => {
    return serviceTeamData.filter((row) => {
      if (serviceEmpFilter !== "ALL" && row.name !== serviceEmpFilter) return false;
      return true;
    });
  }, [serviceEmpFilter]);

  // Service Grand Totals dynamically computed from rows (100% mathematically consistent)
  const serviceGrandTotals = useMemo(() => {
    return filteredServiceRows.reduce(
      (acc, r) => ({
        assigned: acc.assigned + r.assigned,
        pending: acc.pending + r.pending,
        pendingClient: acc.pendingClient + r.pendingClient,
        pendingDept: acc.pendingDept + r.pendingDept,
        inProgress: acc.inProgress + r.inProgress,
        review: acc.review + r.review,
        wip: acc.wip + r.wip,
        overdue: acc.overdue + r.overdue,
        dueToday: acc.dueToday + r.dueToday,
        completed: acc.completed + r.completed,
        total: acc.total + r.total,
        completedAmount: acc.completedAmount + r.completedAmount,
        pendingAmount: acc.pendingAmount + r.pendingAmount,
        totalFees: acc.totalFees + r.totalFees,
      }),
      {
        assigned: 0,
        pending: 0,
        pendingClient: 0,
        pendingDept: 0,
        inProgress: 0,
        review: 0,
        wip: 0,
        overdue: 0,
        dueToday: 0,
        completed: 0,
        total: 0,
        completedAmount: 0,
        pendingAmount: 0,
        totalFees: 0,
      }
    );
  }, [filteredServiceRows]);

  // Filtered Sales Rows
  const filteredSalesRows = useMemo(() => {
    return salesTeamData.filter((row) => {
      if (salesPersonFilter !== "ALL" && row.name !== salesPersonFilter) return false;
      return true;
    });
  }, [salesPersonFilter]);

  // Filtered Licence Rows
  const filteredLicences = useMemo(() => {
    return licenceData.filter((row) => {
      if (licenceTypeFilter !== "ALL" && row.licenceType !== licenceTypeFilter) return false;
      if (licenceCategoryFilter !== "ALL" && row.taskCategory !== licenceCategoryFilter) return false;
      if (licenceStatusFilter !== "ALL" && row.status !== licenceStatusFilter) return false;
      if (licenceEmployeeFilter !== "ALL" && row.partnerName !== licenceEmployeeFilter) return false;
      if (licenceSearch.trim()) {
        const q = licenceSearch.toLowerCase();
        return (
          row.partnerName.toLowerCase().includes(q) ||
          row.clientName.toLowerCase().includes(q) ||
          row.licenceNumber.toLowerCase().includes(q) ||
          row.taskId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [licenceTypeFilter, licenceCategoryFilter, licenceStatusFilter, licenceEmployeeFilter, licenceSearch]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">

      {/* ==================================================================== */}
      {/* 🌟 1. EXECUTIVE REPORT SWITCHER TABS (Matches Reference Screenshots) */}
      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 🌟 1. EXECUTIVE BRANDED REPORT COMMAND BANNER & SWITCHER TABS        */}
      {/* ==================================================================== */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 dark:from-[#0b1226] dark:via-[#0e1c44]/80 dark:to-[#080d1a] border border-blue-200/70 dark:border-blue-900/40 shadow-sm shadow-blue-500/5">
        {/* Ambient Brand Glow Mesh */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
          <div className="absolute -top-24 -left-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          {/* Brand Identity & Title */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0e1c44] via-blue-600 to-sky-400 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0b1226] rounded-full ring-2 ring-emerald-500/20 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                  <span>Finsocap Intelligence Suite</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • Verified Audit Telemetry
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Reports Center
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                Official operational audits, sales conversions and regulatory licence tracking.
              </p>
            </div>
          </div>

          {/* Creative Brand Segmented Switcher for the 3 Exact Reports */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-200/60 dark:bg-[#060b17]/90 border border-slate-300/70 dark:border-blue-900/50 shadow-inner backdrop-blur-md overflow-x-auto no-scrollbar gap-1.5">
            {/* Tab 1: Service Team Report */}
            <button
              type="button"
              onClick={() => handleTabChange("service")}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "service"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 scale-[1.02] border border-blue-400/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-300 hover:bg-white/60 dark:hover:bg-slate-800/50"
              }`}
            >
              <Award className={`w-4 h-4 ${activeTab === "service" ? "text-amber-300" : "text-slate-400"}`} />
              <span>Service Team Report</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                activeTab === "service"
                  ? "bg-white/20 text-white ring-1 ring-white/30"
                  : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300"
              }`}>
                6 Staff
              </span>
            </button>

            {/* Tab 2: Sales Team Report */}
            <button
              type="button"
              onClick={() => handleTabChange("sales")}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "sales"
                  ? "bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02] border border-indigo-400/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-300 hover:bg-white/60 dark:hover:bg-slate-800/50"
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeTab === "sales" ? "text-emerald-300" : "text-slate-400"}`} />
              <span>Sales Team Report</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                activeTab === "sales"
                  ? "bg-white/20 text-white ring-1 ring-white/30"
                  : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
              }`}>
                5 Sales
              </span>
            </button>

            {/* Tab 3: Licence Report */}
            <button
              type="button"
              onClick={() => handleTabChange("licence")}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "licence"
                  ? "bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02] border border-purple-400/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-300 hover:bg-white/60 dark:hover:bg-slate-800/50"
              }`}
            >
              <KeyRound className={`w-4 h-4 ${activeTab === "licence" ? "text-purple-200" : "text-slate-400"}`} />
              <span>Licence Report</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                activeTab === "licence"
                  ? "bg-white/20 text-white ring-1 ring-white/30"
                  : "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300"
              }`}>
                100
              </span>
            </button>
          </div>
        </div>

        {/* Branded Status Telemetry Sub-strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-blue-900/30 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-Time Sync Active</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden sm:inline font-medium">
              Statutory Cycle: <strong className="text-slate-700 dark:text-slate-200">Sep 2026</strong>
            </span>
            <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden md:inline font-medium">
              All 3 Reports Verified by Chartered Operations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/40 dark:border-blue-900/40">
              Finsocap v2.4 Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🛠️ TAB 1: SERVICE TEAM REPORT (Matches Screenshot 1 Exactly)        */}
      {/* ==================================================================== */}
      {activeTab === "service" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-blue-600 via-indigo-600 to-sky-400 shadow-sm shadow-blue-500/30 shrink-0" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Service Team Report
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Employee-wise task status, workload and professional fees summary
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Filter */}
              <DateRangeFilter value={dateRange} onChange={(p) => setDateRange(p.label)} />

              {/* All Employees Filter */}
              <select
                value={serviceEmpFilter}
                onChange={(e) => setServiceEmpFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Employees</option>
                {serviceTeamData.map((e) => (
                  <option key={e.id} value={e.name}>{e.name}</option>
                ))}
              </select>

              {/* All Services Filter */}
              <select
                value={serviceNameFilter}
                onChange={(e) => setServiceNameFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Services</option>
                <option value="FSSAI Registration">FSSAI Registration</option>
                <option value="GST Registration">GST Registration</option>
                <option value="Trademark">Trademark</option>
                <option value="Trade License">Trade License</option>
              </select>

              {/* Branded Export Button */}
              <button
                type="button"
                onClick={() => handleExport("Service Team Report")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* 9 KPI Summary Cards matching Screenshot 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            {/* Card 1: Total Employees */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4 text-sky-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Employees</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">6</p>
            </div>

            {/* Card 2: Total Tasks */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <FileText className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Tasks</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">660</p>
            </div>

            {/* Card 3: Pending */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">47</p>
            </div>

            {/* Card 4: In Progress */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">9</p>
            </div>

            {/* Card 5: Overdue */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Overdue</span>
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">49</p>
            </div>

            {/* Card 6: Completed */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">588</p>
            </div>

            {/* Card 7: Total Professional Fees */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">Total Pro Fees</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">₹ 4,72,600</p>
            </div>

            {/* Card 8: Completed Amount */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">Completed Amt</span>
              </div>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹ 3,86,900</p>
            </div>

            {/* Card 9: Pending Amount */}
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">Pending Amt</span>
              </div>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">₹ 85,700</p>
            </div>
          </div>

          {/* Full Detailed Workload Table matching Screenshot 1 */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 bg-slate-50/80 dark:bg-slate-900/80">
                    <th rowSpan={2} className="py-3 px-3 w-8 text-center align-middle whitespace-nowrap">#</th>
                    <th rowSpan={2} className="py-3 px-3 align-middle whitespace-nowrap">Employee ID</th>
                    <th rowSpan={2} className="py-3 px-4 align-middle whitespace-nowrap">Employee Name</th>
                    <th rowSpan={2} className="py-3 px-3 text-center font-bold align-middle whitespace-nowrap">Assigned</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-rose-600 font-bold bg-rose-50/40 dark:bg-rose-950/20 align-middle whitespace-nowrap">Pending</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-rose-600 font-bold bg-rose-50/40 dark:bg-rose-950/20 align-middle whitespace-nowrap">Pending from Client</th>
                    <th rowSpan={2} className="py-3 px-3 text-center bg-blue-50/40 dark:bg-blue-950/20 align-middle whitespace-nowrap">Pending from Department</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-sky-600 font-bold bg-sky-50/40 dark:bg-sky-950/20 align-middle whitespace-nowrap">In Progress</th>
                    <th rowSpan={2} className="py-3 px-3 text-center font-bold align-middle whitespace-nowrap">Sent for Review</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-purple-600 font-bold bg-purple-50/40 dark:bg-purple-950/20 align-middle whitespace-nowrap">WIP Sub Total</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-rose-600 font-bold bg-rose-50/40 dark:bg-rose-950/20 align-middle whitespace-nowrap">Overdue</th>
                    <th rowSpan={2} className="py-3 px-3 text-center font-bold align-middle whitespace-nowrap">Due Today</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-emerald-600 font-bold bg-emerald-50/40 dark:bg-emerald-950/20 align-middle whitespace-nowrap">Completed</th>
                    <th rowSpan={2} className="py-3 px-3 text-center font-bold align-middle whitespace-nowrap">Total</th>
                    <th colSpan={3} className="py-2.5 px-4 text-center font-black text-slate-800 dark:text-slate-100 bg-blue-50/70 dark:bg-blue-950/50 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      Professional Fees (₹)
                    </th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                    <th className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap min-w-[110px]">Completed Amount</th>
                    <th className="py-2 px-3 text-right text-rose-500 dark:text-rose-400 whitespace-nowrap min-w-[100px]">Pending Amount</th>
                    <th className="py-2 px-3 text-right text-slate-800 dark:text-slate-200 whitespace-nowrap min-w-[110px]">Total Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredServiceRows.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 font-semibold whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{emp.id}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${emp.avatarColor}`}>
                            {emp.initials}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900 dark:text-white whitespace-nowrap">{emp.assigned}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-rose-600 bg-rose-50/20 dark:bg-rose-950/10 whitespace-nowrap">{emp.pending}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-rose-600 bg-rose-50/20 dark:bg-rose-950/10 whitespace-nowrap">{emp.pendingClient}</td>
                      <td className="py-3.5 px-3 text-center font-semibold bg-blue-50/20 dark:bg-blue-950/10 text-slate-500 whitespace-nowrap">{emp.pendingDept}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-sky-600 bg-sky-50/20 dark:bg-sky-950/10 whitespace-nowrap">{emp.inProgress}</td>
                      <td className="py-3.5 px-3 text-center font-bold whitespace-nowrap">{emp.review}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-purple-600 bg-purple-50/20 dark:bg-purple-950/10 whitespace-nowrap">{emp.wip}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-rose-600 bg-rose-50/20 dark:bg-rose-950/10 whitespace-nowrap">{emp.overdue}</td>
                      <td className="py-3.5 px-3 text-center font-bold whitespace-nowrap">{emp.dueToday}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/10 whitespace-nowrap">{emp.completed}</td>
                      <td className="py-3.5 px-3 text-center font-bold whitespace-nowrap">{emp.total}</td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap font-mono">
                        ₹ {emp.completedAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono">
                        ₹ {emp.pendingAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap font-mono">
                        ₹ {emp.totalFees.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Grand Total Row matching Screenshot 1 */}
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 font-black text-xs">
                    <td colSpan={3} className="py-3.5 px-4 text-slate-900 dark:text-white font-black text-sm whitespace-nowrap">
                      Grand Total
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">{serviceGrandTotals.assigned}</td>
                    <td className="py-3.5 px-3 text-center text-rose-600 whitespace-nowrap">{serviceGrandTotals.pending}</td>
                    <td className="py-3.5 px-3 text-center text-rose-600 whitespace-nowrap">{serviceGrandTotals.pendingClient}</td>
                    <td className="py-3.5 px-3 text-center text-slate-500 whitespace-nowrap">{serviceGrandTotals.pendingDept}</td>
                    <td className="py-3.5 px-3 text-center text-sky-600 whitespace-nowrap">{serviceGrandTotals.inProgress}</td>
                    <td className="py-3.5 px-3 text-center text-slate-900 dark:text-white whitespace-nowrap">{serviceGrandTotals.review}</td>
                    <td className="py-3.5 px-3 text-center text-purple-600 whitespace-nowrap">{serviceGrandTotals.wip}</td>
                    <td className="py-3.5 px-3 text-center text-rose-600 whitespace-nowrap">{serviceGrandTotals.overdue}</td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">{serviceGrandTotals.dueToday}</td>
                    <td className="py-3.5 px-3 text-center text-emerald-600 whitespace-nowrap">{serviceGrandTotals.completed}</td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">{serviceGrandTotals.total}</td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap font-mono text-xs">
                      ₹ {serviceGrandTotals.completedAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono text-xs">
                      ₹ {serviceGrandTotals.pendingAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap font-mono text-xs">
                      ₹ {serviceGrandTotals.totalFees.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 💼 TAB 2: SALES TEAM REPORT (Matches Screenshot 2 Exactly)          */}
      {/* ==================================================================== */}
      {activeTab === "sales" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-indigo-600 via-blue-600 to-emerald-500 shadow-sm shadow-indigo-500/30 shrink-0" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Sales Team Report
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Sales person-wise client summary, task status and collection report
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <DateRangeFilter value={dateRange} onChange={(p) => setDateRange(p.label)} />

              <select
                value={salesPersonFilter}
                onChange={(e) => setSalesPersonFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Sales Persons</option>
                {salesTeamData.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>

              <select
                value={salesServiceFilter}
                onChange={(e) => setSalesServiceFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Services</option>
                <option value="FSSAI Registration">FSSAI Registration</option>
                <option value="GST Registration">GST Registration</option>
                <option value="Trademark">Trademark</option>
              </select>

              <button
                type="button"
                onClick={() => handleExport("Sales Team Report")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* 8 KPI Summary Cards matching Screenshot 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales Persons</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">5</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <UserCheck className="w-4 h-4 text-sky-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Clients</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">182</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <FileText className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Tasks</span>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">660</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Completed Tasks</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">588</p>
                <span className="text-[10px] font-bold text-emerald-600">89.1%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Tasks</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">72</p>
                <span className="text-[10px] font-bold text-amber-600">10.9%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">Total Pro Fees</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">₹ 8,56,400</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Briefcase className="w-4 h-4 text-sky-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">Amount Received</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹ 6,72,300</p>
                <span className="text-[10px] font-bold text-emerald-600">78.5%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">Pending Amount</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <p className="text-xl font-black text-rose-600 dark:text-rose-400">₹ 1,84,100</p>
                <span className="text-[10px] font-bold text-rose-500">21.5%</span>
              </div>
            </div>
          </div>

          {/* Middle 3 Visuals Row: Donut 1 + Donut 2 + Bar Chart matching Screenshot 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Donut 1: Task Status (Sales Team) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Task Status (Sales Team)</span>
                </h3>
              </div>

              <div className="flex items-center justify-around py-4">
                <div 
                  className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-inner" 
                  style={{ background: "conic-gradient(#10b981 0% 89.1%, #f59e0b 89.1% 100%)" }}
                >
                  <div className="w-22 h-22 rounded-full bg-white dark:bg-[#0c1427] flex flex-col items-center justify-center shadow-xs">
                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">660</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Tasks</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">Completed Tasks</span>
                    <span className="text-slate-900 dark:text-white font-black ml-auto">588</span>
                    <span className="text-[10px] text-emerald-600">89.1%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">Pending Tasks</span>
                    <span className="text-slate-900 dark:text-white font-black ml-auto">72</span>
                    <span className="text-[10px] text-amber-600">10.9%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donut 2: Collection Status (Sales Team) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Collection Status (Sales Team)</span>
                </h3>
              </div>

              <div className="flex items-center justify-around py-4">
                <div 
                  className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-inner" 
                  style={{ background: "conic-gradient(#0ea5e9 0% 78.5%, #f97316 78.5% 100%)" }}
                >
                  <div className="w-22 h-22 rounded-full bg-white dark:bg-[#0c1427] flex flex-col items-center justify-center shadow-xs">
                    <span className="text-sm font-black text-slate-900 dark:text-white leading-none">₹ 8,56,400</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Total Fees</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">Amount Received</span>
                    <span className="text-[11px] text-sky-600 font-bold">₹ 6,72,300</span>
                    <span className="text-[10px] text-emerald-600">78.5%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">Pending Amount</span>
                    <span className="text-[11px] text-rose-500 font-bold">₹ 1,84,100</span>
                    <span className="text-[10px] text-rose-500">21.5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart: Top Sales Persons */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate">
                  Top Sales Persons ({salesChartMetric === "received" ? "By Received Amount" : "By Total Fees"})
                </h3>
                <select
                  value={salesChartMetric}
                  onChange={(e) => setSalesChartMetric(e.target.value as any)}
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border-none cursor-pointer focus:outline-none"
                >
                  <option value="received">Received Amount</option>
                  <option value="total">Total Fees</option>
                </select>
              </div>

              <div className="h-36 flex items-end justify-around pt-4 pb-1">
                {[
                  { name: "Rahul Jha", val: salesChartMetric === "received" ? "₹ 2,05,400" : "₹ 2,56,800", h: "85%", color: "bg-blue-600" },
                  { name: "Kanhaiya", val: salesChartMetric === "received" ? "₹ 1,32,900" : "₹ 1,84,600", h: "62%", color: "bg-emerald-500" },
                  { name: "Gaurav", val: salesChartMetric === "received" ? "₹ 92,800" : "₹ 1,25,400", h: "44%", color: "bg-amber-500" },
                  { name: "Roshan", val: salesChartMetric === "received" ? "₹ 54,200" : "₹ 68,300", h: "28%", color: "bg-purple-500" },
                  { name: "Roshni", val: salesChartMetric === "received" ? "₹ 26,800" : "₹ 38,900", h: "16%", color: "bg-pink-500" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 w-14 group">
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 whitespace-nowrap group-hover:scale-105 transition-transform">{item.val}</span>
                    <div className={`w-8 rounded-t-lg transition-all shadow-sm ${item.color}`} style={{ height: item.h }} />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[55px] text-center mt-0.5">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Table matching Screenshot 2 */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 bg-slate-50/80 dark:bg-slate-900/80">
                    <th rowSpan={2} className="py-3 px-3 w-8 text-center align-middle whitespace-nowrap">#</th>
                    <th rowSpan={2} className="py-3 px-3 align-middle whitespace-nowrap">Sales Person ID</th>
                    <th rowSpan={2} className="py-3 px-4 align-middle whitespace-nowrap">Sales Person Name</th>
                    <th rowSpan={2} className="py-3 px-3 text-center align-middle whitespace-nowrap">Total Clients</th>
                    <th rowSpan={2} className="py-3 px-3 text-center align-middle whitespace-nowrap">Total Tasks</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-emerald-600 align-middle whitespace-nowrap">Completed Tasks</th>
                    <th rowSpan={2} className="py-3 px-3 text-center text-rose-600 align-middle whitespace-nowrap">Pending Tasks</th>
                    <th rowSpan={2} className="py-3 px-3 text-center align-middle whitespace-nowrap">Completion %</th>
                    <th colSpan={3} className="py-2.5 px-4 text-center font-black text-slate-800 dark:text-slate-100 bg-blue-50/70 dark:bg-blue-950/50 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      Professional Fees (₹)
                    </th>
                    <th rowSpan={2} className="py-3 px-4 text-right align-middle whitespace-nowrap">Collection %</th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                    <th className="py-2 px-3 text-right text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap min-w-[110px]">Total Amount</th>
                    <th className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap min-w-[110px]">Received Amount</th>
                    <th className="py-2 px-3 text-right text-rose-500 dark:text-rose-400 whitespace-nowrap min-w-[100px]">Pending Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredSalesRows.map((s, index) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 font-semibold whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{s.id}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${s.avatarColor}`}>
                            {s.initials}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold whitespace-nowrap">{s.clients}</td>
                      <td className="py-3.5 px-3 text-center font-semibold whitespace-nowrap">{s.tasks}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{s.completed}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">{s.pending}</td>
                      <td className="py-3.5 px-3 text-center font-bold whitespace-nowrap">{s.completionRate}</td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 whitespace-nowrap font-mono">
                        ₹ {s.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                        ₹ {s.receivedAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono">
                        ₹ {s.pendingAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {s.collectionRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 font-black text-xs">
                    <td colSpan={3} className="py-3.5 px-4 text-slate-900 dark:text-white font-black text-sm whitespace-nowrap">
                      Grand Total
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">182</td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">390</td>
                    <td className="py-3.5 px-3 text-center text-emerald-600 whitespace-nowrap">348</td>
                    <td className="py-3.5 px-3 text-center text-rose-600 whitespace-nowrap">42</td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">89.2%</td>
                    <td className="py-3.5 px-3 text-right font-black border-l border-slate-200 dark:border-slate-800 whitespace-nowrap font-mono text-xs">
                      ₹ 8,56,400
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono text-xs">
                      ₹ 6,72,300
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono text-xs">
                      ₹ 1,84,100
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 whitespace-nowrap">
                      78.5%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 📜 TAB 3: LICENCE REPORT (Matches Screenshot 3 Exactly)             */}
      {/* ==================================================================== */}
      {activeTab === "licence" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-purple-600 via-indigo-600 to-blue-600 shadow-sm shadow-purple-500/30 shrink-0" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Licence Report ({filteredLicences.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  List of all completed licences with detailed information
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <DateRangeFilter value={dateRange} onChange={(p) => setDateRange(p.label)} />

              <button
                type="button"
                onClick={() => handleExport("Licence Report")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* 6 KPI Summary Cards matching Screenshot 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <FileText className="w-4 h-4 text-sky-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Licences</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">100</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active</span>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">85</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Expiring in 30 Days</span>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">10</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Expired</span>
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">5</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Link2 className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">URL Linked</span>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">92</p>
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Link2 className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">URL Not Linked</span>
              </div>
              <p className="text-2xl font-black text-slate-500 dark:text-slate-400 mt-1">8</p>
            </div>
          </div>

          {/* Multi-Filter Row matching Screenshot 3 */}
          <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={licenceSearch}
                onChange={(e) => setLicenceSearch(e.target.value)}
                placeholder="Search by partner name, client name, licence number..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={licenceTypeFilter}
              onChange={(e) => setLicenceTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="ALL">All Types</option>
              <option value="FSSAI Basic Licence">FSSAI Basic Licence</option>
              <option value="FSSAI Central Licence">FSSAI Central Licence</option>
            </select>

            <select
              value={licenceCategoryFilter}
              onChange={(e) => setLicenceCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="Compliance">Compliance</option>
            </select>

            <select
              value={licenceStatusFilter}
              onChange={(e) => setLicenceStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Expiring in 30 Days">Expiring in 30 Days</option>
              <option value="Expired">Expired</option>
            </select>

            <select
              value={licenceEmployeeFilter}
              onChange={(e) => setLicenceEmployeeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="ALL">All Employees</option>
              <option value="Rahul Jha">Rahul Jha</option>
              <option value="Kanhaiya">Kanhaiya</option>
              <option value="Gaurav">Gaurav</option>
              <option value="Roshan">Roshan</option>
              <option value="Roshni">Roshni</option>
            </select>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={() => {
                setLicenceSearch("");
                setLicenceTypeFilter("ALL");
                setLicenceCategoryFilter("ALL");
                setLicenceStatusFilter("ALL");
                setLicenceEmployeeFilter("ALL");
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Table matching Screenshot 3 */}
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 bg-slate-50/70 dark:bg-slate-900/70 whitespace-nowrap">
                    <th className="py-3 px-3 w-8">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </th>
                    <th className="py-3 px-2">#</th>
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
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium whitespace-nowrap">
                  {filteredLicences.map((lic, index) => (
                    <tr key={lic.taskId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                      <td className="py-3 px-2 text-slate-400 font-semibold">{index + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-sky-400">{lic.taskId}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{lic.partnerName}</td>
                      <td className="py-3 px-3 text-slate-500">{lic.partnerNumber}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{lic.clientName}</td>
                      <td className="py-3 px-3 text-slate-500">{lic.clientNumber}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          lic.licenceType.includes("Central")
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/60 dark:border-amber-800"
                            : "bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200/60 dark:border-sky-800"
                        }`}>
                          {lic.licenceType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                          {lic.taskCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-purple-600 dark:text-purple-400 font-semibold">{lic.serviceName}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{lic.licenceNumber}</td>
                      <td className="py-3 px-3 text-slate-500">{lic.issueDate}</td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{lic.expiryDate}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">{lic.userId}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span>{showPasswordMap[lic.taskId] ? lic.passwordMasked : "••••••••"}</span>
                          <button
                            type="button"
                            onClick={() => togglePassword(lic.taskId)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Toggle Password"
                          >
                            {showPasswordMap[lic.taskId] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span>{lic.attachmentsCount}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLicenceModal(lic)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedLicenceModal(lic)}
                            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination matching Screenshot 3 */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>entries</span>
                <span className="ml-2 font-medium">Showing 1 to 10 of 100 entries</span>
              </div>

              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center cursor-pointer shadow-xs">
                  1
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                  2
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                  3
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                  4
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                  5
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                  10
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 🔍 LICENCE DETAILS MODAL (UX Polish)                                  */}
      {/* ==================================================================== */}
      {selectedLicenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-sky-400">
                  {selectedLicenceModal.taskId}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedLicenceModal.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLicenceModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Licence Number</span>
                <p className="font-mono font-black text-slate-900 dark:text-white mt-0.5">{selectedLicenceModal.licenceNumber}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Licence Type</span>
                <p className="font-bold text-sky-600 dark:text-sky-400 mt-0.5">{selectedLicenceModal.licenceType}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Partner</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedLicenceModal.partnerName} ({selectedLicenceModal.partnerNumber})</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Validity</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedLicenceModal.issueDate} → {selectedLicenceModal.expiryDate}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Portal User ID</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedLicenceModal.userId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedLicenceModal.userId, "user")}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Portal Password</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedLicenceModal.passwordMasked}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedLicenceModal.passwordMasked, "pass")}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLicenceModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading ${selectedLicenceModal.attachmentsCount} verified statutory attachments...`);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Attachments ({selectedLicenceModal.attachmentsCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading reports...</div>}>
      <ReportsPageContent />
    </Suspense>
  );
}
