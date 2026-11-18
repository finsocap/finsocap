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
  ZoomIn,
  ZoomOut,
  X,
  ExternalLink,
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
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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
  const currentQrImage = previewUrl || existingQrUrl;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh] my-auto">
          {/* Banner Header */}
          <ModalHeaderBanner
            title={isEditing ? "Edit Admin UPI & QR Code" : "Admin UPI & QR Payment Setup"}
            description="Configure or update official receiving UPI handle & QR code image for partner manual settlement"
            icon={QrCode}
            badge={isAlreadyConfigured ? (isEditing ? "Editing Mode" : "Active Gateway") : "Initial Setup"}
            onClose={onClose}
          />

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Loading live payment configuration...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-6">
              
              {/* Double-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* ────────────────────────────────────────────────────────
                    LEFT COLUMN: Form Controls & Pure Visual Background Design
                   ──────────────────────────────────────────────────────── */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                  
                  <div className="space-y-4">
                    {/* Top Status Card: Official Payment Gateway */}
                    <div className="p-4 rounded-2xl bg-[#f0f6ff] dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            {isEditing ? "Updating Payment Setup" : "Official Payment Gateway"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Saved QR image bytes are served directly from the database to partners upon payment request.
                          </p>
                        </div>
                      </div>

                      {isAlreadyConfigured && !isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-sky-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit / Re-upload</span>
                        </button>
                      )}
                    </div>

                    {/* Input 1: Payee Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Official Payee / Merchant Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isFormDisabled}
                        placeholder="e.g. FinSocap"
                        value={payeeName}
                        onChange={(e) => setPayeeName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-85 disabled:cursor-not-allowed transition-all"
                      />
                    </div>

                    {/* Input 2: Admin UPI ID / VPA */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Admin UPI ID / VPA *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          disabled={isFormDisabled}
                          placeholder="e.g. 7859801218@pthdfc"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-85 disabled:cursor-not-allowed pr-24 transition-all"
                        />
                        {upiId && (
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="absolute right-2 top-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Badge (Shows only when new file is staged) */}
                    {previewUrl && (
                      <div className="pt-1">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-sky-300 shadow-2xs">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>New Image Selected (Pending Save)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ────────────────────────────────────────────────────────
                      3D FINTECH PAYMENT ILLUSTRATION (Border-Free Seamless Blend)
                     ──────────────────────────────────────────────────────── */}
                  <div className="relative w-full h-44 -mt-3 overflow-hidden bg-white dark:bg-[#0c1427]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/payment_bg_3d.jpg"
                      alt="3D Payment Design"
                      className="w-full h-full object-cover object-center scale-105"
                    />

                    {/* Subtle feathered gradient edges so image remains crisp and visible */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/70 dark:from-[#0c1427]/60 dark:via-transparent dark:to-[#0c1427]/70 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40 dark:from-[#0c1427]/40 dark:via-transparent dark:to-[#0c1427]/40 pointer-events-none" />
                  </div>

                  {/* Upload & Save controls only when editing */}
                  {(!isAlreadyConfigured || isEditing) && (
                    <div className="pt-2 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/20 transition-all">
                        <Upload className="w-4 h-4" />
                        <span>{currentQrImage ? "Select Replacement QR Code" : "Browse QR Code"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

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
                        <span>{isEditing ? "Update & Save" : "Save Settings"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                </div>

                {/* ────────────────────────────────────────────────────────
                    RIGHT COLUMN: Full-Height Clean QR Preview Card (5 cols)
                   ──────────────────────────────────────────────────────── */}
                <div className="lg:col-span-5 p-4 rounded-3xl bg-[#f0f6ff]/70 dark:bg-slate-900/60 border border-blue-100 dark:border-slate-800 flex flex-col items-center justify-center relative">
                  
                  {currentQrImage ? (
                    <div className="relative group w-full flex flex-col items-center">
                      
                      {/* Zoom Button on top right */}
                      <button
                        type="button"
                        onClick={() => setIsZoomOpen(true)}
                        title="Click to zoom full screen"
                        className="absolute -top-1 right-0 p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center z-10"
                      >
                        <ZoomIn className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                      </button>

                      {/* Preserved 9:16 Portrait Aspect Ratio Container */}
                      <div className="w-full max-w-[290px] rounded-2xl overflow-hidden shadow-xl border border-slate-900/10 dark:border-slate-800 bg-black cursor-zoom-in">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentQrImage}
                          alt="Admin Official Payment QR Code"
                          onClick={() => setIsZoomOpen(true)}
                          className="w-full h-auto object-contain block mx-auto rounded-2xl"
                        />
                      </div>

                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No QR Code Uploaded
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Upload the 1080 × 1920 mobile screenshot QR code
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </form>
          )}
        </div>
      </div>

      {/* Full-Screen Zoom Lightbox Modal */}
      {isZoomOpen && currentQrImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-full max-h-[95vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Zoom Button */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* High-Resolution Full Size QR Display */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentQrImage}
              alt="Full Resolution QR Code"
              className="max-h-[85vh] w-auto h-auto rounded-2xl shadow-2xl object-contain border border-white/10"
            />

            <div className="mt-3 text-center text-xs font-bold text-white/90 bg-black/60 px-4 py-1.5 rounded-full border border-white/20">
              <span>{payeeName} • {upiId}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
