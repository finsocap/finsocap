"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  X,
  FileCheck,
  Send,
  HelpCircle,
  Clock
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { 
  partnerPortalService, 
  PartnerServiceRequestDetail 
} from "@/lib/api/partnerPortalService";
import { useToast } from "@/components/Global/ToastNotification";

interface ApplicationCorrectionModalProps {
  detail: PartnerServiceRequestDetail;
  onClose: () => void;
  onSuccessRefresh: () => void;
}

export default function ApplicationCorrectionModal({
  detail,
  onClose,
  onSuccessRefresh
}: ApplicationCorrectionModalProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form answer fields
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Document replacements map: docKey -> { uploadId, fileName, isUploading }
  const [docUploads, setDocUploads] = useState<Record<string, { uploadId: number; fileName: string; isUploading: boolean }>>({});

  useEffect(() => {
    if (detail.answers) {
      setAnswers({ ...detail.answers });
    }
    // Existing documents retain their uploadIds
    if (detail.documents && Array.isArray(detail.documents)) {
      const existing: Record<string, { uploadId: number; fileName: string; isUploading: boolean }> = {};
      detail.documents.forEach((doc) => {
        existing[doc.fieldKey] = {
          uploadId: doc.uploadId,
          fileName: doc.fileName || "Current attached document",
          isUploading: false
        };
      });
      setDocUploads(existing);
    }
  }, [detail]);

  // Op 09 upload replacement document
  const handleUploadFile = async (docKey: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10 MB limit.", "File Too Large");
      return;
    }

    try {
      setDocUploads((prev) => ({
        ...prev,
        [docKey]: { uploadId: 0, fileName: file.name, isUploading: true }
      }));

      const res = await partnerPortalService.uploads.uploadDocument(
        detail.customerId,
        detail.serviceId,
        docKey,
        file,
        detail.formVersionId
      );

      if (res?.success && res.data?.uploadId) {
        setDocUploads((prev) => ({
          ...prev,
          [docKey]: { uploadId: res.data.uploadId, fileName: file.name, isUploading: false }
        }));
        toast.success(`Uploaded ${file.name}`, "File Attached");
      }
    } catch (err: any) {
      setDocUploads((prev) => {
        const next = { ...prev };
        delete next[docKey];
        return next;
      });
      toast.error(err?.message || "Failed to upload document", "Upload Error");
    }
  };

  // Op 21: Submit application correction
  // CRITICAL PDF RULE: expectedVersion must be detail.submissionVersion (NOT task.version)
  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalDocs: Array<{ fieldKey: string; uploadId: number }> = [];
    Object.entries(docUploads).forEach(([k, v]) => {
      if (v.uploadId > 0) {
        finalDocs.push({ fieldKey: k, uploadId: v.uploadId });
      }
    });

    try {
      setSubmitting(true);
      await partnerPortalService.requests.correctApplication(detail.id, {
        serviceId: detail.serviceId,
        formVersionId: detail.formVersionId,
        answers,
        documents: finalDocs,
        expectedVersion: detail.submissionVersion
      });

      toast.success("Application corrections submitted to specialist successfully!", "Corrected");
      onSuccessRefresh();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to submit correction. If form changed, please reload.",
        "Submission Failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={AlertTriangle}
            badge="CLIENT CORRECTION REQUIRED"
            title={`Application Correction · #${detail.requestCode || detail.id}`}
            description="Respond to the raised query and resubmit corrected fields/documents."
            badgeTag="Op 21 · ExpectedVersion"
            onClose={onClose}
          />
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmitCorrection} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Query message alert banner if present */}
          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/70 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>CA Specialist Query Message</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium pl-6">
              {detail.queryMessage || "Please clarify answers and attach the correct documents as requested."}
            </p>
            <div className="text-[10px] text-slate-500 pl-6 mt-1 flex items-center gap-2">
              <span>Target submissionVersion: <code className="font-mono font-bold text-slate-700 dark:text-slate-300">{detail.submissionVersion}</code></span>
            </div>
          </div>

          {/* Form Answers Fields */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Form Responses / Fields
            </h4>
            <div className="space-y-2.5">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 capitalize text-[11px]">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="text"
                    value={typeof value === "string" ? value : JSON.stringify(value)}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Document Replacements */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Application Documents
            </h4>
            <div className="space-y-2">
              {Object.entries(docUploads).map(([docKey, uploadState]) => (
                <div
                  key={docKey}
                  className="p-3 bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white capitalize">{docKey.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-[10px] text-emerald-600 font-mono mt-0.5 truncate flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      {uploadState.fileName}
                    </p>
                  </div>

                  <label
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      uploadState.isUploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {uploadState.isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadState.isUploading ? "Uploading..." : "Replace File"}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpeg,.jpg"
                      className="hidden"
                      disabled={uploadState.isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(docKey, file);
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors flex items-center gap-2 shadow-sm"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Resubmit Corrected Application</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
