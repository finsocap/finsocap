"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  IndianRupee,
  RefreshCw,
  Copy,
  Check,
  Building2,
  FileText,
  User,
  ShieldCheck,
  Download,
  Loader2,
  ArrowUpDown,
  Settings2,
  QrCode,
  Sparkles,
  Send,
  Share2,
  Bell,
  Coins,
} from "lucide-react";
import PageBanner from "@/components/Dashboard/PageBanner";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import { PaymentVerificationItem } from "@/types/paymentWorkflow";
import { paymentWorkflowService } from "@/lib/api/paymentWorkflowService";
import PaymentVerificationModal from "@/components/Dashboard/PaymentVerificationModal";
import PayoutSettingsModal from "@/components/Dashboard/PayoutSettingsModal";
import { getAdminPayoutSettings, AdminPayoutSettings } from "@/lib/adminPayoutConfig";
import { useToast } from "@/components/Global/ToastNotification";

export default function PaymentVerificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<PaymentVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PAYMENT_NOT_REQUESTED" | "PAYMENT_REQUESTED" | "VERIFICATION_PENDING" | "PAYMENT_RECEIVED" | "REJECTED"
  >("ALL");
  const [selectedItem, setSelectedItem] = useState<PaymentVerificationItem | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [payoutSettings, setPayoutSettings] = useState<AdminPayoutSettings>(getAdminPayoutSettings());
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await paymentWorkflowService.getVerifications();
      if (res?.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setPayoutSettings(getAdminPayoutSettings());
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (item.requestCode && item.requestCode.toLowerCase().includes(q)) ||
          (item.applicationId && item.applicationId.toLowerCase().includes(q)) ||
          (item.partnerName && item.partnerName.toLowerCase().includes(q)) ||
          (item.customerName && item.customerName.toLowerCase().includes(q)) ||
          (item.serviceName && item.serviceName.toLowerCase().includes(q)) ||
          (item.submittedUtr && item.submittedUtr.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, statusFilter, search]);

  // Handle Step 1: Raise Payment Request
  const handleRaisePaymentRequest = async (e: React.MouseEvent, item: PaymentVerificationItem) => {
    e.stopPropagation();
    try {
      setActionLoadingId(item.id);
      const res = await paymentWorkflowService.raisePaymentRequest(item.id);
      if (res?.success) {
        const netPay = Math.max(0, item.partnerPaymentAmount - item.partnerEarning);
        toast.success(
          `Payment Request of ₹${netPay.toLocaleString("en-IN")} sent to ${item.partnerName}! Partner can now pay via configured QR / Bank details.`,
          "Payment Request Raised"
        );
        loadData();
      } else {
        toast.error("Failed to raise payment request");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to raise payment request");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Step 3: Send Service Completed Data in 1-Click
  const handleSendCompletedData = async (e: React.MouseEvent, item: PaymentVerificationItem) => {
    e.stopPropagation();
    try {
      setActionLoadingId(item.id);
      await paymentWorkflowService.shareCompletedData(item.id);

      const netFinSoCap = Math.max(0, item.partnerPaymentAmount - item.partnerEarning);
      const shareMessage = `*FinSoCap Regulatory Services - Service Completed*\n\nApplication ID: *${item.requestCode}*\nService: *${item.serviceName}*\nClient: *${item.customerName}*\nTotal Client Fee: *₹${item.partnerPaymentAmount}*\nPartner Profit Retained: *₹${item.partnerEarning}*\nRemittance Paid: *₹${netFinSoCap}*\nLicence/Ref: *${item.licenceNumber || "VERIFIED"}*\nStatus: *DELIVERED & UNLOCKED*\n\nAll completion documents are now available for direct download on your partner dashboard!`;

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
      }

      const cleanPhone = (item.partnerPhone || "").replace(/[^0-9]/g, "");
      if (cleanPhone) {
        window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(shareMessage)}`, "_blank");
      }

      toast.success("Service completed data & certificates sent to Partner in 1-Click!", "Data Sent");
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to send completed data");
    } finally {
      setActionLoadingId(null);
    }
  };

  const completedCount = items.length;
  const pendingRequestCount = items.filter((i) => i.status === "PAYMENT_NOT_REQUESTED").length;
  const verificationPendingCount = items.filter((i) => i.status === "VERIFICATION_PENDING" || i.status === "PAYMENT_REQUESTED").length;
  const verifiedCount = items.filter((i) => i.status === "PAYMENT_RECEIVED").length;
  const totalVolume = items.reduce((acc, i) => acc + (i.status === "PAYMENT_RECEIVED" ? (i.partnerPaymentAmount - i.partnerEarning) : 0), 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header Banner */}
      <PageBanner
        icon={CreditCard}
        badge="Enterprise Treasury & Payment Lifecycle"
        badgeMeta="3-Stage Settlement: Request → Verify → Release"
        title="Payment Verification"
        description="Completed task payment pipeline: Raise payment requests to partners, verify submitted UTRs against bank inflow, and share completed service data in a single click."
        bottomMeta={`${completedCount} Completed Tasks • ${pendingRequestCount} Awaiting Payment Request • ${verificationPendingCount} Under Verification`}
      />

      {/* 2. Pipeline Lifecycle Flow Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <span>Workflow Stages</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            Real Live Staff Completed Tasks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
            <span className="text-[10px] font-black text-blue-600 dark:text-sky-400 uppercase tracking-wider block">Stage 1</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">Staff Completes Task</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Partner client case completed</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Stage 2</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">Raise Payment Request</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Admin sends QR & Bank details</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Stage 3</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">Payment Verification</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Admin checks UTR & marks received</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Stage 4</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">Single-Click Data Send</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Licence & cert sent to partner</span>
          </div>
        </div>
      </div>

      {/* 3. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completed Tasks (Ready for Payment Request) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "PAYMENT_NOT_REQUESTED" ? "ALL" : "PAYMENT_NOT_REQUESTED")}
          className={`p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
            statusFilter === "PAYMENT_NOT_REQUESTED"
              ? "bg-blue-50/90 dark:bg-blue-950/50 border-2 border-blue-500 shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-colors shadow-xs ${
            statusFilter === "PAYMENT_NOT_REQUESTED"
              ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
              : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Raise Request Due
            </p>
            <p className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
              <AnimatedCounter value={pendingRequestCount} />
            </p>
          </div>
        </button>

        {/* Card 2: Pending Review */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "VERIFICATION_PENDING" ? "ALL" : "VERIFICATION_PENDING")}
          className={`p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
            statusFilter === "VERIFICATION_PENDING"
              ? "bg-amber-50/90 dark:bg-amber-950/50 border-2 border-amber-500 shadow-md shadow-amber-500/20"
              : "bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-colors shadow-xs ${
            statusFilter === "VERIFICATION_PENDING"
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
              : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Awaiting Verification
            </p>
            <p className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
              <AnimatedCounter value={verificationPendingCount} />
            </p>
          </div>
        </button>

        {/* Card 3: Payment Received */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "PAYMENT_RECEIVED" ? "ALL" : "PAYMENT_RECEIVED")}
          className={`p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
            statusFilter === "PAYMENT_RECEIVED"
              ? "bg-emerald-50/90 dark:bg-emerald-950/50 border-2 border-emerald-500 shadow-md shadow-emerald-500/20"
              : "bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-colors shadow-xs ${
            statusFilter === "PAYMENT_RECEIVED"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
              : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          }`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Payment Confirmed
            </p>
            <p className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
              <AnimatedCounter value={verifiedCount} />
            </p>
          </div>
        </button>

        {/* Card 4: Total Verified Inflow */}
        <div className="p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Net FinSoCap Inflow
            </p>
            <p className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">
              ₹{totalVolume.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Search & Actions Bar with Payment Settings configuration */}
      <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, UTR, partner or service..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="PAYMENT_NOT_REQUESTED">1. Ready to Raise Request</option>
            <option value="PAYMENT_REQUESTED">2. Request Sent to Partner</option>
            <option value="VERIFICATION_PENDING">3. Awaiting Admin Verification</option>
            <option value="PAYMENT_RECEIVED">4. Payment Confirmed & Released</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Configure Payment / Bank / QR Details button */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="h-9 px-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Configure Payment & QR Details</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            title="Refresh list"
            className="p-2 h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Active Receiving Account Preview Strip */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 dark:from-slate-900/90 dark:via-blue-950/30 dark:to-slate-900/90 border border-blue-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white">Active Payment Receiver:</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px]">
                {payoutSettings.upiId}
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold hidden sm:inline">
                {payoutSettings.bankName} (A/C: ••••{payoutSettings.accountNumber.slice(-4)})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              These details and generated QR are sent automatically when you click <strong>Raise Payment Request</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 text-left cursor-pointer"
        >
          Edit Bank & QR →
        </button>
      </div>

      {/* 6. Completed Tasks & Verification Pipeline Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                <th className="py-3.5 px-4 whitespace-nowrap">Task ID / Request</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Partner Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Client & Service</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Client Fee</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Partner Profit</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Net Remittance</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Pipeline Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading completed tasks and verifications...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No completed tasks found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      When staff finishes tasks, they appear here ready for Payment Request and Verification.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isNotRequested = item.status === "PAYMENT_NOT_REQUESTED";
                  const isRequested = item.status === "PAYMENT_REQUESTED";
                  const isPending = item.status === "VERIFICATION_PENDING";
                  const isReceived = item.status === "PAYMENT_RECEIVED";
                  const netRemittance = Math.max(0, item.partnerPaymentAmount - item.partnerEarning);
                  const isActionLoading = actionLoadingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Real Task ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <span>{item.requestCode}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Completed: {item.taskCompletedAt || "2026-11-01"}
                        </div>
                      </td>

                      {/* 2. Partner Name & Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.partnerName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.partnerPhone || item.partnerId}
                        </div>
                      </td>

                      {/* 3. Client & Service Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {item.serviceName}
                        </div>
                      </td>

                      {/* 4. Client Fee */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-black text-slate-900 dark:text-white">
                        ₹{item.partnerPaymentAmount.toLocaleString("en-IN")}
                      </td>

                      {/* 5. Partner Retained Profit */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{item.partnerEarning.toLocaleString("en-IN")}
                      </td>

                      {/* 6. Net Remittance to FinSoCap */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-black text-blue-600 dark:text-sky-400">
                        ₹{netRemittance.toLocaleString("en-IN")}
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border inline-flex items-center gap-1 ${
                          isReceived
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : isPending
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse"
                            : isRequested
                            ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-400"
                            : isNotRequested
                            ? "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
                            : item.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {isNotRequested && <span>Ready for Request</span>}
                          {isRequested && <Send className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isReceived && <CheckCircle2 className="w-3 h-3" />}
                          {!isNotRequested && <span>{item.status.replace(/_/g, " ")}</span>}
                        </span>
                      </td>

                      {/* 8. Sequential Action Button: Raise Request -> Verify -> Send Data */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        {isNotRequested ? (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={(e) => handleRaisePaymentRequest(e, item)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {isActionLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Raise Payment Request</span>
                          </button>
                        ) : isPending || isRequested ? (
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Payment</span>
                          </button>
                        ) : isReceived ? (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={(e) => handleSendCompletedData(e, item)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {isActionLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                            <span>{item.detailsSharedAt ? "Resend Completed Data" : "Send Completed Data (1-Click)"}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Verification Modal */}
      {selectedItem && (
        <PaymentVerificationModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onActionComplete={loadData}
        />
      )}

      {/* Corporate Payout / UPI / Bank Config Modal */}
      {showConfigModal && (
        <PayoutSettingsModal
          initialSettings={payoutSettings}
          onClose={() => setShowConfigModal(false)}
          onSaved={(newSettings) => setPayoutSettings(newSettings)}
        />
      )}

    </div>
  );
}
