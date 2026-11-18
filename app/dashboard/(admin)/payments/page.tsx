"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  IndianRupee,
  RefreshCw,
  Copy,
  Check,
  FileText,
  User,
  ShieldCheck,
  Download,
  Loader2,
  QrCode,
  Sparkles,
  Send,
  Lock,
  Unlock,
  CheckCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import PageBanner from "@/components/Dashboard/PageBanner";
import { toTitleCase } from "@/lib/formatters";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import {
  TaskPaymentRequestItem,
  AdminPaymentSettings,
} from "@/types/paymentWorkflow";
import { paymentWorkflowService } from "@/lib/api/paymentWorkflowService";
import { adminWorkflowService } from "@/lib/api/adminWorkflowService";
import PaymentVerificationModal from "@/components/Dashboard/PaymentVerificationModal";
import PayoutSettingsModal from "@/components/Dashboard/PayoutSettingsModal";
import TaskIdBadge from "@/components/Dashboard/TaskIdBadge";
import { useToast } from "@/components/Global/ToastNotification";

export default function PaymentVerificationsPage() {
  const toast = useToast();

  const [paymentRequests, setPaymentRequests] = useState<TaskPaymentRequestItem[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<AdminPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "COMPLETED_TASKS">("REQUESTS");

  const [selectedRequest, setSelectedRequest] = useState<TaskPaymentRequestItem | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [sendingTaskId, setSendingTaskId] = useState<number | null>(null);

  // 1. Fetch live payment requests & settings
  const loadPaymentData = useCallback(async () => {
    try {
      setLoading(true);

      const [requestsRes, settingsRes, serviceRequestsRes] = await Promise.allSettled([
        paymentWorkflowService.getPaymentRequests({ size: 100 }),
        paymentWorkflowService.getPaymentSettings(),
        adminWorkflowService.getServiceRequests({ status: "COMPLETED", size: 100 }),
      ]);

      if (requestsRes.status === "fulfilled" && requestsRes.value?.success) {
        const items = requestsRes.value.data?.items || [];
        setPaymentRequests(Array.isArray(items) ? items : []);
      } else {
        setPaymentRequests([]);
      }

      if (settingsRes.status === "fulfilled" && settingsRes.value?.success) {
        setPaymentSettings(settingsRes.value.data);
      } else {
        setPaymentSettings(null);
      }

      if (serviceRequestsRes.status === "fulfilled" && serviceRequestsRes.value?.success) {
        const srData = serviceRequestsRes.value.data;
        const list = Array.isArray(srData?.items)
          ? srData.items
          : Array.isArray((srData as any)?.content)
          ? (srData as any).content
          : [];
        setCompletedTasks(list);
      } else {
        setCompletedTasks([]);
      }
    } catch (err) {
      console.error("[PaymentVerificationsPage] load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  // Filtered payment requests
  const filteredRequests = useMemo(() => {
    return paymentRequests.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.requestCode?.toLowerCase().includes(q) ||
          String(item.taskId).includes(q) ||
          item.partnerName?.toLowerCase().includes(q) ||
          item.customerName?.toLowerCase().includes(q) ||
          item.serviceName?.toLowerCase().includes(q) ||
          item.transactionReference?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [paymentRequests, statusFilter, search]);

  // Tasks completed that don't have a payment request yet
  const tasksPendingPaymentCreation = useMemo(() => {
    const existingTaskIds = new Set(paymentRequests.map((r) => r.taskId));
    return completedTasks.filter((t) => !existingTaskIds.has(t.id));
  }, [completedTasks, paymentRequests]);

  // KPI Metrics calculated strictly from live database responses
  const metrics = useMemo(() => {
    const pending = paymentRequests.filter((r) => r.status === "PENDING");
    const completed = paymentRequests.filter((r) => r.status === "COMPLETED");

    const totalCollected = completed.reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPending = pending.reduce((acc, r) => acc + (r.amount || 0), 0);

    return {
      totalRequests: paymentRequests.length,
      pendingCount: pending.length,
      completedCount: completed.length,
      totalCollected,
      totalPending,
      readyToRequestCount: tasksPendingPaymentCreation.length,
    };
  }, [paymentRequests, tasksPendingPaymentCreation]);

  // Handler: Admin sends payment request for a completed task
  const handleSendPaymentRequest = async (taskId: number) => {
    if (!paymentSettings) {
      toast.error(
        "Payment Setup Required",
        "Please configure Admin QR & UPI setup first before sending payment requests."
      );
      setShowConfigModal(true);
      return;
    }

    try {
      setSendingTaskId(taskId);
      const res = await paymentWorkflowService.sendPaymentRequest(taskId, {
        notes: "Please settle service fee to unlock final certificates.",
      });

      if (res?.success && res.data) {
        toast.success(
          "Payment Request Sent",
          `Payment request for Task #${taskId} has been created and sent to partner.`
        );
        loadPaymentData();
      } else {
        toast.error("Failed", res?.message || "Could not create payment request.");
      }
    } catch (err: any) {
      console.error("sendPaymentRequest error:", err);
      toast.error("Error", err?.message || "Failed to create payment request on server.");
    } finally {
      setSendingTaskId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Page Banner */}
      <PageBanner
        icon={CreditCard}
        badge="Statutory Settlement"
        title="Payment Verification & Document Gate"
        description="Verify incoming partner payments, manage UPI/QR settings, and unlock certificates upon verified settlement."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>{paymentSettings ? "View QR & UPI Setup" : "Setup QR & UPI"}</span>
            </button>
            <button
              onClick={loadPaymentData}
              disabled={loading}
              className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Collected */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Verified Revenue
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              ₹{metrics.totalCollected.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] font-bold text-emerald-600">
              {metrics.completedCount} Payments Completed
            </span>
          </div>
        </div>

        {/* Card 2: Pending Verifications */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Pending Verification
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              ₹{metrics.totalPending.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] font-bold text-amber-600">
              {metrics.pendingCount} Awaiting UTR Confirmation
            </span>
          </div>
        </div>

        {/* Card 3: Completed Tasks Ready for Invoicing */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Ready for Request
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {metrics.readyToRequestCount} Tasks
            </div>
            <span className="text-[10px] font-bold text-blue-600">
              Tasks Completed (Unbilled)
            </span>
          </div>
        </div>

        {/* Card 4: UPI Gateway Active Status */}
        <div
          onClick={() => setShowConfigModal(true)}
          className="p-4 rounded-3xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
          title="Click to configure or view QR & UPI Setup"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Admin UPI Gateway
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 group-hover:underline">
                {paymentSettings ? "View QR" : "Setup Now →"}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5 font-mono">
              {paymentSettings?.upiId || "Not Set"}
            </div>
            <span className={`text-[10px] font-bold truncate block ${paymentSettings ? "text-emerald-600" : "text-amber-600"}`}>
              {paymentSettings ? `Active: ${paymentSettings.payeeName}` : "Setup Required (Click to configure)"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("REQUESTS")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "REQUESTS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>Payment Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "REQUESTS" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700"
            }`}
          >
            {paymentRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COMPLETED_TASKS")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "COMPLETED_TASKS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>Completed Tasks to Request</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "COMPLETED_TASKS"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-700"
            }`}
          >
            {tasksPendingPaymentCreation.length}
          </span>
        </button>
      </div>

      {/* 4. Main Content Area */}
      {activeTab === "REQUESTS" ? (
        <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-4">
          {/* Controls: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by Task ID, Client, Partner, Service or UTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["ALL", "PENDING", "COMPLETED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60 dark:bg-slate-900/60">
                  <th className="py-3 px-3.5">TASK ID</th>
                  <th className="py-3 px-3.5">SERVICE</th>
                  <th className="py-3 px-3.5">PARTNER</th>
                  <th className="py-3 px-3.5">CUSTOMER</th>
                  <th className="py-3 px-3.5">AMOUNT</th>
                  <th className="py-3 px-3.5">STATUS</th>
                  <th className="py-3 px-3.5">TRANSACTION UTR</th>
                  <th className="py-3 px-3.5">DOCUMENTS</th>
                  <th className="py-3 px-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="font-semibold text-xs">Loading payment requests from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          No Payment Requests Found
                        </span>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Switch to the &quot;Completed Tasks to Request&quot; tab to send a payment request for finished client work.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <TaskIdBadge id={req.requestCode || `#${req.taskId}`} />
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                        {toTitleCase(req.serviceName)}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                        {toTitleCase(req.partnerName)}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                        {toTitleCase(req.customerName)}
                      </td>
                      <td className="py-3 px-3.5 font-black text-slate-900 dark:text-white">
                        ₹{req.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            req.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300/40"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300/40"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              req.status === "COMPLETED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                            }`}
                          />
                          {toTitleCase(req.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {req.transactionReference ? (
                          <span className="font-bold text-slate-900 dark:text-white">
                            {req.transactionReference}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Awaiting UTR</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="inline-flex items-center gap-1 font-bold text-[11px]">
                          {req.documentsUnlocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Unlocked</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-600">Locked</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                            req.status === "COMPLETED"
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                          }`}
                        >
                          {req.status === "COMPLETED" ? "Manage / Audit" : "Verify & Settle"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Completed Tasks Ready to Request Payment */
        <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                Tasks Completed by Specialist Team
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                These requests are marked COMPLETED. Click &quot;Send Payment Request&quot; to snapshot catalog fee and dispatch UPI/QR to the partner.
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 dark:text-sky-400 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40">
              {tasksPendingPaymentCreation.length} Unbilled Tasks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60 dark:bg-slate-900/60">
                  <th className="py-3 px-3.5">TASK ID</th>
                  <th className="py-3 px-3.5">SERVICE</th>
                  <th className="py-3 px-3.5">PARTNER</th>
                  <th className="py-3 px-3.5">CUSTOMER</th>
                  <th className="py-3 px-3.5">STATUS</th>
                  <th className="py-3 px-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {tasksPendingPaymentCreation.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <CheckCircle className="w-7 h-7 text-emerald-500" />
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                          All completed tasks have been billed!
                        </span>
                        <p className="text-[11px] text-slate-400">
                          When specialists complete new cases, they will appear here ready for payment dispatch.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasksPendingPaymentCreation.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <TaskIdBadge id={task.requestCode || `#${task.id}`} href={`/dashboard/tasks/${task.id}`} />
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                        {toTitleCase(task.serviceName || task.service || "Service")}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                        {toTitleCase(task.partnerName || task.partner || "—")}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                        {toTitleCase(task.customerName || task.client || "—")}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300/40">
                          Completed
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleSendPaymentRequest(task.id)}
                          disabled={sendingTaskId === task.id}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 flex items-center gap-1.5 ml-auto transition-all cursor-pointer disabled:opacity-50"
                        >
                          {sendingTaskId === task.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Send Payment Request</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Payment Verification Modal */}
      {selectedRequest && (
        <PaymentVerificationModal
          item={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            loadPaymentData();
          }}
        />
      )}

      {/* 6. Admin Payout / QR Settings Modal */}
      {showConfigModal && (
        <PayoutSettingsModal
          onClose={() => setShowConfigModal(false)}
          onSaved={(newSettings) => {
            setPaymentSettings(newSettings);
            loadPaymentData();
          }}
        />
      )}
    </div>
  );
}
