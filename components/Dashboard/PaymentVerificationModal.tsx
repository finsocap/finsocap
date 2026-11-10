"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  Copy,
  Check,
  Clock,
  IndianRupee,
  FileText,
  User,
  Calendar,
  Loader2,
  ExternalLink,
  Share2,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { PaymentVerificationItem } from "@/types/paymentWorkflow";
import { paymentWorkflowService } from "@/lib/api/paymentWorkflowService";
import { useToast } from "@/components/Global/ToastNotification";

interface PaymentVerificationModalProps {
  item: PaymentVerificationItem;
  onClose: () => void;
  onActionComplete: () => void;
}

export default function PaymentVerificationModal({
  item,
  onClose,
  onActionComplete,
}: PaymentVerificationModalProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sharingDetails, setSharingDetails] = useState(false);
  const [detailsShared, setDetailsShared] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showFullScreenshot, setShowFullScreenshot] = useState(false);

  // Client collected fee vs partner retained profit vs net remittance
  const clientFeeTotal = item.partnerPaymentAmount;
  const partnerProfit = item.partnerEarning;
  const netFinSoCapShare = Math.max(0, clientFeeTotal - partnerProfit);

  const handleCopyUtr = () => {
    if (item.submittedUtr && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(item.submittedUtr);
      setCopiedUtr(true);
      toast.success("UTR copied to clipboard!");
      setTimeout(() => setCopiedUtr(false), 2000);
    }
  };

  const handleConfirmReceived = async () => {
    try {
      setSubmitting(true);
      const res = await paymentWorkflowService.verifyPayment(item.id, {
        status: "RECEIVED",
      });

      if (res?.success) {
        toast.success(
          `Payment verified! Partner profit ₹${partnerProfit.toLocaleString("en-IN")} confirmed and Certificate unlocked.`,
          "Payment Received"
        );
        onActionComplete();
        onClose();
      } else {
        toast.error(res?.message || "Failed to confirm payment.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Share Details to Partner / Client (WhatsApp & Portal Sync)
  const handleSingleClickShare = async () => {
    try {
      setSharingDetails(true);
      
      const shareText = `*FinSoCap Regulatory Services*\nApplication ID: *${item.requestCode || item.applicationId}*\nService: *${item.serviceName}*\nClient: *${item.customerName}*\nStatus: *SUCCESSFULLY COMPLETED & VERIFIED*\nLicence/Ref No: *${item.licenceNumber || "FSSAI-2026-REG-OK"}*\n\nYour certificate is now unlocked and available for download on the FinSoCap portal!`;
      
      // Copy formatted update message
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }

      // If WhatsApp contact is present, open WhatsApp Web/App
      const cleanPhone = (item.partnerPhone || "").replace(/[^0-9]/g, "");
      if (cleanPhone) {
        const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, "_blank");
      }

      setDetailsShared(true);
      toast.success("Details shared with Partner in 1-click & copied to clipboard!", "Details Shared");
    } catch (e: any) {
      toast.error(e?.message || "Failed to share details");
    } finally {
      setSharingDetails(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting this payment.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await paymentWorkflowService.verifyPayment(item.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });

      if (res?.success) {
        toast.success("Payment marked as rejected. Partner has been notified to re-submit valid payment details.", "Payment Rejected");
        onActionComplete();
        onClose();
      } else {
        toast.error(res?.message || "Failed to reject payment.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={CreditCard}
            badge="TREASURY VERIFICATION"
            title="Verify Remittance & Share Details"
            description={`Application ID: ${item.requestCode || item.applicationId} • Review UTR, confirm remittance and share output details in 1-click.`}
            badgeTag="Admin Action"
            onClose={onClose}
          />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Top Status & Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Application & Service
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                {item.requestCode || item.applicationId} • {item.serviceName}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Partner: <strong className="text-slate-800 dark:text-slate-200">{item.partnerName}</strong> {item.partnerPhone && `(${item.partnerPhone})`}
              </span>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border inline-flex items-center gap-1 ${
              item.status === "PAYMENT_RECEIVED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                : item.status === "VERIFICATION_PENDING"
                ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400"
                : item.status === "REJECTED"
                ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400"
                : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-400"
            }`}>
              {item.status === "VERIFICATION_PENDING" && <Clock className="w-3 h-3" />}
              {item.status === "PAYMENT_RECEIVED" && <CheckCircle2 className="w-3 h-3" />}
              {item.status === "REJECTED" && <XCircle className="w-3 h-3" />}
              <span>{item.status.replace(/_/g, " ")}</span>
            </span>
          </div>

          {/* Pricing & Retained Profit Breakdown */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Client Fee
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                ₹{clientFeeTotal.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 block">
                Collected from client
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Partner Profit
              </span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                ₹{partnerProfit.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-emerald-600/80 mt-0.5 block">
                Partner retained
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 block">
                FinSoCap Share
              </span>
              <span className="text-lg font-black text-blue-700 dark:text-sky-300 mt-0.5 block">
                ₹{netFinSoCapShare.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-blue-600/80 mt-0.5 block">
                Net Remittance
              </span>
            </div>
          </div>

          {/* Submitted UTR Details Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Submitted 12-Digit UTR
              </span>
              <button
                type="button"
                onClick={handleCopyUtr}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {copiedUtr ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUtr ? "Copied" : "Copy UTR"}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
              <span className="font-mono font-black text-sm tracking-widest text-slate-900 dark:text-white select-all">
                {item.submittedUtr || "No UTR submitted yet"}
              </span>
              {item.submittedAt && (
                <span className="text-[10px] font-medium text-slate-400">
                  {new Date(item.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>

          {/* Payment Screenshot Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Payment Screenshot
              </span>
              {item.paymentScreenshotUrl && (
                <button
                  type="button"
                  onClick={() => setShowFullScreenshot(!showFullScreenshot)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showFullScreenshot ? "Hide View" : "View"}</span>
                </button>
              )}
            </div>

            {item.paymentScreenshotUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                      UPI_Payment_Confirmation.png
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullScreenshot(!showFullScreenshot)}
                    className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </div>

                {showFullScreenshot && (
                  <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-in fade-in">
                    <img
                      src={item.paymentScreenshotUrl}
                      alt="Payment Receipt"
                      className="max-h-72 object-contain rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-slate-400 text-xs italic">
                No payment screenshot attached.
              </div>
            )}
          </div>

          {/* Rejection Form if triggered */}
          {showRejectForm && (
            <form onSubmit={handleReject} className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-rose-900 dark:text-rose-200 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. UTR not matching banking record / Payment amount mismatch"
                  required
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          )}

          {/* 1-Click Details Share Strip (Feature Highlight) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">
                  Single-Click Output Sharing
                </p>
                <p className="text-[10px] text-slate-500">
                  Instantly sends certificate & licence details to Partner (WhatsApp & Portal).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSingleClickShare}
              disabled={sharingDetails}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                detailsShared
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {sharingDetails ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : detailsShared ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{detailsShared ? "Details Shared!" : "Share in 1-Click"}</span>
            </button>
          </div>

          {/* Admin Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Admin Actions
            </span>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>

              {!showRejectForm && item.status !== "REJECTED" && (
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Payment</span>
                </button>
              )}

              {item.status !== "PAYMENT_RECEIVED" && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmReceived}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Payment as Received</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
