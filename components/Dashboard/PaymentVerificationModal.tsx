"use client";

import React, { useState, useEffect } from "react";
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
  Image as ImageIcon,
  ExternalLink,
  Eye,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { TaskPaymentRequestItem, PaymentProofItem } from "@/types/paymentWorkflow";
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

  // State
  const [proofs, setProofs] = useState<PaymentProofItem[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(true);
  const [proofImageBlobs, setProofImageBlobs] = useState<Record<number, string>>({});
  const [selectedProofPreview, setSelectedProofPreview] = useState<string | null>(null);

  // For completing: transactionReference is mandatory
  const [utrNumber, setUtrNumber] = useState(item.transactionReference || "");
  const [notes, setNotes] = useState(
    item.notes || (isCompleted ? "" : "Transfer verified against UPI / Bank statement.")
  );
  const [revertReason, setRevertReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch partner submitted proofs (GET /api/admin/payment-proofs?paymentId={id})
  useEffect(() => {
    let isMounted = true;
    async function loadProofs() {
      try {
        setLoadingProofs(true);
        const res = await paymentWorkflowService.getPaymentProofs({
          paymentId: item.id,
          taskId: item.taskId,
        });

        if (isMounted && res?.success && res.data) {
          const list = Array.isArray(res.data.items)
            ? res.data.items
            : Array.isArray(res.data)
            ? res.data
            : [];
          setProofs(list);

          // If partner provided a UTR in proof and admin has none yet, pre-populate
          if (list.length > 0 && list[0].utrNumber && !utrNumber) {
            setUtrNumber(list[0].utrNumber);
          }

          // Fetch screenshot image blobs for proofs
          for (const p of list) {
            paymentWorkflowService.getProofScreenshotBlob(p.id).then((blob) => {
              if (isMounted && blob) {
                setProofImageBlobs((prev) => ({
                  ...prev,
                  [p.id]: URL.createObjectURL(blob),
                }));
              }
            });
          }
        }
      } catch (err) {
        // Proofs endpoint might be empty
      } finally {
        if (isMounted) setLoadingProofs(false);
      }
    }

    loadProofs();
    return () => {
      isMounted = false;
    };
  }, [item.id, item.taskId]);

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

          {/* Partner Uploaded Proofs Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                <span>Partner Uploaded Payment Proofs</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {proofs.length} {proofs.length === 1 ? "Proof Uploaded" : "Proofs"}
              </span>
            </div>

            {loadingProofs ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Checking partner proofs...</span>
              </div>
            ) : proofs.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  No Payment Screenshot Uploaded Yet
                </p>
                <p className="text-[10px] text-slate-400">
                  When partner submits UPI payment proof from mobile app, screenshot and UTR will appear here for verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {proofs.map((proof) => {
                  const blobUrl = proofImageBlobs[proof.id];
                  return (
                    <div
                      key={proof.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white block">
                            Submitted by: {proof.submittedBy || proof.partnerName}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {proof.createdAt ? new Date(proof.createdAt).toLocaleString("en-IN") : "Recent"}
                          </span>
                        </div>
                        {proof.utrNumber ? (
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Partner UTR</span>
                            <span className="font-mono font-bold text-xs text-blue-600 dark:text-sky-400">
                              {proof.utrNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No UTR text provided</span>
                        )}
                      </div>

                      {/* Screenshot thumbnail / viewer */}
                      {blobUrl ? (
                        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                          <div
                            onClick={() => setSelectedProofPreview(blobUrl)}
                            className="w-16 h-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 flex items-center justify-center shrink-0 shadow-2xs group relative"
                            title="Click to view full screenshot"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={blobUrl}
                              alt="Payment proof screenshot"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {proof.fileName || "payment-proof.png"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {(proof.sizeBytes / 1024).toFixed(1)} KB • PNG/JPEG
                            </p>
                            <button
                              type="button"
                              onClick={() => setSelectedProofPreview(blobUrl)}
                              className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Full Screenshot</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                          <span>Loading screenshot image bytes...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                  placeholder="e.g. Screenshot reviewed; receipt verified against bank statement."
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
                  <span>Approve &amp; Unlock Partner Documents</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Full Screenshot Preview Lightbox */}
      {selectedProofPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProofPreview(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProofPreview}
              alt="Full screenshot"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded-xl"
            />
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProofPreview(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
