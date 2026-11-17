"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Save,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  Edit2,
  RotateCcw,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { paymentWorkflowService } from "@/lib/api/paymentWorkflowService";
import { AdminPaymentSettings } from "@/types/paymentWorkflow";
import { useToast } from "@/components/Global/ToastNotification";

interface PayoutSettingsModalProps {
  onClose: () => void;
  onSaved: (settings: AdminPaymentSettings) => void;
}

export default function PayoutSettingsModal({
  onClose,
  onSaved,
}: PayoutSettingsModalProps) {
  const toast = useToast();

  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("FinSocap");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingQrUrl, setExistingQrUrl] = useState<string | null>(null);
  const [isAlreadyConfigured, setIsAlreadyConfigured] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load existing settings if configured (GET /api/admin/payment-settings)
  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await paymentWorkflowService.getPaymentSettings();
        if (isMounted && res?.success && res.data) {
          setUpiId(res.data.upiId || "");
          setPayeeName(res.data.payeeName || "FinSocap");
          setIsAlreadyConfigured(true);

          // Fetch raw image blob for QR
          const blob = await paymentWorkflowService.getAdminQrBlob();
          if (isMounted && blob) {
            setExistingQrUrl(URL.createObjectURL(blob));
          }
        }
      } catch (err: any) {
        // 404 means not configured yet
        setIsAlreadyConfigured(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        toast.error("Invalid format", "Only PNG and JPEG images are allowed.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large", "QR Code image must be strictly under 2MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard", upiId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!upiId.trim() || !payeeName.trim()) {
      toast.error("Validation error", "UPI ID and Payee Name are required.");
      return;
    }

    // When editing or creating new, replacement file is required
    if (!selectedFile && (!isAlreadyConfigured || isEditing)) {
      toast.error("QR Code required", "Please select a replacement PNG or JPEG QR Code image.");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("upiId", upiId.trim());
      fd.append("payeeName", payeeName.trim());
      if (selectedFile) {
        fd.append("qr", selectedFile);
      }

      // Use PUT /admin/payment-settings if updating existing, otherwise POST
      const res = isAlreadyConfigured
        ? await paymentWorkflowService.updatePaymentSettings(fd)
        : await paymentWorkflowService.savePaymentSettings(fd);

      if (res?.success && res.data) {
        toast.success(
          "Settings Updated",
          isAlreadyConfigured
            ? "Payment settings & QR code updated successfully."
            : "Admin QR and UPI payment settings saved successfully."
        );
        onSaved(res.data);
        onClose();
      } else {
        toast.error("Failed", res?.message || "Could not save payment settings.");
      }
    } catch (err: any) {
      console.error("[PayoutSettingsModal] save error:", err);
      toast.error(
        "Update Error",
        err?.message || "Server rejected update. Ensure QR image is PNG/JPEG < 2MB."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isFormDisabled = isAlreadyConfigured && !isEditing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Banner Header */}
        <ModalHeaderBanner
          title={isEditing ? "Edit Admin UPI & QR Code" : "Admin UPI & QR Payment Setup"}
          description="Configure or update official receiving UPI handle & QR code image for partner manual settlement"
          icon={QrCode}
          badge={isAlreadyConfigured ? (isEditing ? "Editing Mode" : "Active Gateway") : "Initial Setup"}
          onClose={onClose}
        />

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading live payment configuration...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {/* Note alert */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-sky-300 flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {isEditing ? "Updating Payment Setup (PUT /admin/payment-settings)" : "Official Payment Gateway"}
                  </p>
                  <p className="text-[11px] text-blue-700/90 dark:text-sky-300/80 leading-relaxed">
                    {isEditing
                      ? "Enter the new UPI ID, Payee Name, and select a new replacement QR Code image (PNG/JPEG max 2MB)."
                      : "Saved QR image bytes are served directly from the database to partners upon payment request."}
                  </p>
                </div>
              </div>

              {isAlreadyConfigured && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-sky-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 hover:bg-blue-50 flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit / Re-upload</span>
                </button>
              )}
            </div>

            {/* Payee Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Payee / Merchant Name *
              </label>
              <input
                type="text"
                required
                disabled={isFormDisabled}
                placeholder="e.g. FinSocap Financial Services"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            {/* UPI ID Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Admin UPI ID / VPA *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isFormDisabled}
                  placeholder="e.g. finsocap@icici"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-75 disabled:cursor-not-allowed pr-20"
                />
                {upiId && (
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="absolute right-2 top-2 px-2 py-1 text-[10px] font-bold rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-sky-300 hover:bg-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* QR Image Upload & Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{isEditing ? "Upload Replacement QR Code *" : "Official UPI QR Code *"}</span>
                <span className="text-[10px] font-semibold text-slate-400">PNG / JPEG (Max 2MB)</span>
              </label>

              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-center space-y-3">
                {previewUrl || existingQrUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-44 h-44 rounded-2xl bg-white p-2 shadow-md border border-slate-200 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl || existingQrUrl || ""}
                        alt="Admin UPI QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {isAlreadyConfigured && !previewUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Stored in DB (Active)
                      </span>
                    )}
                    {previewUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                        <Upload className="w-3.5 h-3.5" />
                        New Image Selected (Pending Save)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mb-2">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Select official payment QR image
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Must match the UPI ID entered above
                    </p>
                  </div>
                )}

                {/* Upload button shown when initially configuring OR when editing */}
                {(!isAlreadyConfigured || isEditing) && (
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{previewUrl || existingQrUrl ? "Change / Re-upload Image" : "Browse File"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              )}

              {/* Submit / Update Button */}
              {(!isAlreadyConfigured || isEditing) && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isEditing ? "Update & Save Changes" : "Save QR & UPI Setup"}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
