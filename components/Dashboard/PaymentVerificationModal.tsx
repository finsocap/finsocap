"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  FileText,
  User,
  Calendar,
  IndianRupee,
  Loader2,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { TaskPaymentRequestItem } from "@/types/paymentWorkflow";
import { paymentWorkflowService } from "@/lib/api/paymentWorkflowService";
import { useToast } from "@/components/Global/ToastNotification";

interface PaymentVerificationModalProps {
  item: TaskPaymentRequestItem;
  onClose: () => void;
  onSuccess: (updated: TaskPaymentRequestItem) => void;
}

export default function PaymentVerificationModal({
  item,
  onClose,
  onSuccess,
}: PaymentVerificationModalProps) {
  const toast = useToast();

  const isCompleted = item.status === "COMPLETED";

  // For completing: transactionReference is mandatory
  const [utrNumber, setUtrNumber] = useState(item.transactionReference || "");
  const [notes, setNotes] = useState(
    item.notes || (isCompleted ? "" : "Transfer verified against UPI / Bank statement.")
  );
  const [revertReason, setRevertReason] = useState("");
  const [mode, setMode] = useState<"CONFIRM" | "REVERT">(isCompleted ? "REVERT" : "CONFIRM");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!utrNumber.trim()) {
      toast.error(
        "UTR Required",
        "Please enter the UPI / Bank Transaction Reference (UTR) from your statement."
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await paymentWorkflowService.updatePaymentStatus(item.id, {
        status: "COMPLETED",
        expectedVersion: item.version,
        transactionReference: utrNumber.trim(),
        notes: notes.trim(),
      });

      if (res?.success && res.data) {
        toast.success(
          "Payment Confirmed",
          `Payment of ₹${item.amount.toLocaleString("en-IN")} marked COMPLETED. Documents unlocked for partner.`
        );
        onSuccess(res.data);
        onClose();
      } else {
        toast.error("Update failed", res?.message || "Failed to update payment status.");
      }
    } catch (err: any) {
      console.error("[PaymentVerificationModal] confirm error:", err);
      toast.error(
        "Confirmation Error",
        err?.message || "Could not confirm payment. Ensure expected version matches."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevertToPending = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!revertReason.trim()) {
      toast.error(
        "Reason Required",
        "Please provide a reason for reverting this payment back to PENDING (e.g., transfer not received)."
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await paymentWorkflowService.updatePaymentStatus(item.id, {
        status: "PENDING",
        expectedVersion: item.version,
        notes: revertReason.trim(),
      });

      if (res?.success && res.data) {
        toast.warning(
          "Payment Reverted",
          "Payment marked PENDING. Partner output document access has been locked again."
        );
        onSuccess(res.data);
        onClose();
      } else {
        toast.error("Revert failed", res?.message || "Failed to revert payment status.");
      }
    } catch (err: any) {
      console.error("[PaymentVerificationModal] revert error:", err);
      toast.error("Revert Error", err?.message || "Could not revert status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        <ModalHeaderBanner
          title={isCompleted ? "Payment Audit & Status Control" : "Verify & Confirm Payment Receipt"}
          description={`Task #${item.taskId} • ${item.serviceName} • Partner: ${item.partnerName}`}
          icon={ShieldCheck}
          badge={item.status}
          onClose={onClose}
        />

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount Due</span>
              <span className="text-base font-black text-slate-900 dark:text-white block mt-0.5">
                ₹{item.amount?.toLocaleString("en-IN") || "0"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black mt-1 ${
                  item.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300/40"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300/40"
                }`}
              >
                {item.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Client / Customer</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                {item.customerName || "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Documents Access</span>
              <span className="inline-flex items-center gap-1 font-bold text-xs mt-0.5">
                {item.documentsUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Unlocked for Partner</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-600">Locked (Requires Payment)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Form switch if already completed */}
          {isCompleted ? (
            <form onSubmit={handleRevertToPending} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Correct a Mistaken Confirmation</p>
                  <p className="text-[11px] leading-relaxed">
                    If this payment was confirmed in error or funds reversed, you may revert status to PENDING. This will immediately re-lock partner document access.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Existing Recorded UTR / Reference
                </label>
                <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {item.transactionReference || "None recorded"}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reason for Reversion *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Correction: transfer was not received or failed clearance."
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  <span>Revert to PENDING &amp; Lock Docs</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Bank / UPI Transaction Reference (UTR) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Mandatory for verification</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 432109876543 or UTR123456789"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Verify receipt against your UPI app statement before confirming.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Verification Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Transfer verified against UPI statement."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Mark COMPLETED &amp; Unlock Docs</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
