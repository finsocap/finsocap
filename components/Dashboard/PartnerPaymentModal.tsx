"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  QrCode,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  IndianRupee,
  Lock,
  FileText,
  X,
  Loader2,
  Building2,
  Sparkles,
  Wallet,
  Coins,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { useToast } from "@/components/Global/ToastNotification";
import { paymentWorkflowService } from "@/lib/api/paymentWorkflowService";
import { getAdminPayoutSettings, AdminPayoutSettings } from "@/lib/adminPayoutConfig";

interface PartnerPaymentModalProps {
  taskId: string | number;
  requestCode: string;
  serviceName: string;
  payableAmount?: number; // Total client fee e.g. ₹1,149
  partnerEarning?: number; // Partner profit e.g. ₹600
  initialUtr?: string;
  currentStatus?: "PAYMENT_REQUIRED" | "VERIFICATION_PENDING" | "PAYMENT_RECEIVED" | "REJECTED";
  rejectionReason?: string;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

export default function PartnerPaymentModal({
  taskId,
  requestCode,
  serviceName,
  payableAmount = 1149,
  partnerEarning = 600,
  initialUtr = "",
  currentStatus = "PAYMENT_REQUIRED",
  rejectionReason,
  onClose,
  onPaymentSubmitted,
}: PartnerPaymentModalProps) {
  const toast = useToast();

  // Partner keeps their profit, pays net remittance to FinSoCap
  // e.g. Client Fee: ₹1,149, Partner Profit: ₹600 -> Net Remittance to FinSoCap: ₹549
  const clientFeeTotal = payableAmount;
  const partnerProfit = partnerEarning;
  const netPayableToFinSoCap = Math.max(0, clientFeeTotal - partnerProfit);

  const [paymentMode, setPaymentMode] = useState<"UPI" | "BANK">("UPI");
  const [utrNumber, setUtrNumber] = useState(initialUtr);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [payoutConfig, setPayoutConfig] = useState<AdminPayoutSettings>(getAdminPayoutSettings());

  useEffect(() => {
    setPayoutConfig(getAdminPayoutSettings());
    const handleUpdate = () => setPayoutConfig(getAdminPayoutSettings());
    window.addEventListener("finsocap-payout-settings-updated", handleUpdate);
    return () => window.removeEventListener("finsocap-payout-settings-updated", handleUpdate);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      toast.error("Please enter a valid 12-digit UPI / Bank UTR transaction number");
      return;
    }

    if (!screenshotPreview && !screenshotFile) {
      toast.error("Please upload payment screenshot / receipt proof");
      return;
    }

    try {
      setSubmitting(true);
      const res = await paymentWorkflowService.submitPartnerPayment({
        taskId,
        requestCode,
        utrNumber: cleanUtr,
        screenshotUrl: screenshotPreview || undefined,
        screenshotFile: screenshotFile || undefined,
      });

      if (res?.success) {
        toast.success("Payment submitted successfully! Admin will verify and share details in 1-click.");
        onPaymentSubmitted();
        onClose();
      } else {
        toast.error(res?.message || "Failed to submit payment details");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit payment proof");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = currentStatus === "VERIFICATION_PENDING";
  const isReceived = currentStatus === "PAYMENT_RECEIVED";
  const isRejected = currentStatus === "REJECTED";

  // Dynamic UPI Intent Link configured for Net Remittance
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(payoutConfig.upiId)}&pn=${encodeURIComponent(
    payoutConfig.payeeName
  )}&am=${netPayableToFinSoCap}&cu=INR&tn=${encodeURIComponent(`FinSoCap Fee for ${requestCode}`)}`;
  
  const qrDisplayUrl = payoutConfig.customQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiIntentUrl)}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0c1427] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <ModalHeaderBanner
          title="Task Completed • Partner Settlement & Remittance"
          description={`Application ${requestCode} completed by staff. Remit company share after deducting your profit.`}
          badge="Partner Settlement"
          badgeTag="Instant Release"
          onClose={onClose}
          icon={CreditCard}
        />

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alert if in Pending / Rejected state */}
          {isPending && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-700 dark:text-amber-400">
              <Clock className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-bold text-sm">Payment Under Admin Verification</p>
                <p className="text-xs text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                  Your remittance of ₹{netPayableToFinSoCap.toLocaleString("en-IN")} (UTR: {utrNumber || "Submitted"}) is awaiting admin verification. As soon as admin confirms receipt, official certificate and licence details will be shared in a single click!
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-700 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Previous Payment Submission Rejected</p>
                <p className="text-xs text-rose-600/90 dark:text-rose-400/90 mt-0.5">
                  Reason: {rejectionReason || "UTR number did not match bank statement or invalid screenshot."} Please verify the transaction and resubmit valid details below.
                </p>
              </div>
            </div>
          )}

          {/* Transparent Profit & Remittance Breakdown Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-500/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Client Collection & Profit Retained Model
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Retain Your Profit Upfront
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-center">
              {/* Box 1: Total Collected from Client */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  1. Client Collected Fee
                </span>
                <span className="text-xl font-black text-white mt-1 block">
                  ₹{clientFeeTotal.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Cash / UPI taken from client
                </span>
              </div>

              {/* Box 2: Partner Retained Profit */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  2. Your Profit (Retained)
                </span>
                <span className="text-xl font-black text-emerald-300 mt-1 block">
                  -₹{partnerProfit.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                  Directly keep in your pocket
                </span>
              </div>

              {/* Box 3: Net Remittance to FinSoCap */}
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30 relative">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 block">
                  3. Net Pay to FinSoCap
                </span>
                <span className="text-2xl font-black text-amber-300 mt-0.5 block">
                  ₹{netPayableToFinSoCap.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-blue-200 mt-0.5 block font-bold">
                  Remit to unlock details
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300/90 mt-3 pt-2 border-t border-white/10 text-center sm:text-left">
              💡 <strong>How it works:</strong> Collect ₹{clientFeeTotal.toLocaleString("en-IN")} from client (via cash or your own QR), keep your ₹{partnerProfit.toLocaleString("en-IN")} profit immediately, and pay only the remaining <strong>₹{netPayableToFinSoCap.toLocaleString("en-IN")}</strong> to FinSoCap below.
            </p>
          </div>

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPaymentMode("UPI")}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMode === "UPI"
                  ? "bg-white dark:bg-[#0c1427] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR / UPI ID (₹{netPayableToFinSoCap})</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("BANK")}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMode === "BANK"
                  ? "bg-white dark:bg-[#0c1427] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Direct Bank / NEFT / IMPS</span>
            </button>
          </div>

          {/* Mode 1: UPI / QR Code */}
          {paymentMode === "UPI" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white dark:bg-white rounded-2xl shadow-md border border-slate-200/80">
                  <img
                    src={qrDisplayUrl}
                    alt="FinSoCap UPI QR"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Scan via GPay / PhonePe / Paytm / BHIM</span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Official FinSoCap UPI ID
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="px-3.5 py-2.5 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs text-slate-800 dark:text-slate-200 flex-1 truncate">
                      {payoutConfig.upiId}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(payoutConfig.upiId, "upi")}
                      className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedKey === "upi" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Payee / Verified Entity
                  </label>
                  <div className="px-3.5 py-2 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {payoutConfig.payeeName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-300">
                  Net amount to pay: <span className="font-bold text-blue-900 dark:text-blue-100 text-xs">₹{netPayableToFinSoCap.toLocaleString("en-IN")}</span>. Note down the 12-digit UTR from your UPI payment app.
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Bank Transfer Details */}
          {paymentMode === "BANK" && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Company Corporate Bank Account (NEFT / IMPS / RTGS)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{payoutConfig.bankName}</span>
                </div>

                <div className="p-3 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Beneficiary Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{payoutConfig.payeeName}</span>
                </div>

                <div className="p-3 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{payoutConfig.accountNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(payoutConfig.accountNumber, "acc")}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    {copiedKey === "acc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{payoutConfig.ifscCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(payoutConfig.ifscCode, "ifsc")}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    {copiedKey === "ifsc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{payoutConfig.accountType}</span>
                </div>

                <div className="p-3 bg-white dark:bg-[#0c1427] rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Branch</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{payoutConfig.branch}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form: UTR & Proof Upload */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Step 2: Enter Transaction Confirmation Details</span>
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                12-digit UTR / UPI Reference Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={24}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ""))}
                placeholder="e.g. 328109247812"
                required
                disabled={submitting || isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1427] font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found on your payment confirmation screen or SMS from bank/UPI app.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Upload Payment Receipt / Screenshot <span className="text-rose-500">*</span>
              </label>

              {screenshotPreview ? (
                <div className="relative p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={screenshotPreview}
                      alt="Payment Proof"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {screenshotFile?.name || "Uploaded Proof"}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ready for submission</span>
                      </p>
                    </div>
                  </div>

                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotFile(null);
                        setScreenshotPreview(null);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30">
                  <Upload className="w-7 h-7 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to upload payment screenshot
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={submitting || isPending}
                  />
                </label>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || isPending}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting UTR...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isRejected ? "Resubmit Payment Proof" : `Submit ₹${netPayableToFinSoCap.toLocaleString("en-IN")} for Verification`}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
