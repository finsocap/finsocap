"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderLock, 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  FileCheck,
  RefreshCw,
  Clock
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { 
  partnerPortalService, 
  PartnerDocumentRequest,
  PartnerTaskFileItem
} from "@/lib/api/partnerPortalService";
import { useToast } from "@/components/Global/ToastNotification";

interface DocumentRequestsModalProps {
  taskId: string | number;
  onClose: () => void;
  onSuccessRefresh?: () => void;
}

export default function DocumentRequestsModal({
  taskId,
  onClose,
  onSuccessRefresh
}: DocumentRequestsModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [docRequests, setDocRequests] = useState<PartnerDocumentRequest[]>([]);
  
  // Stored uploads map: itemKey -> { fileId, fileName, isUploading }
  const [itemUploads, setItemUploads] = useState<Record<string, { fileId: number; fileName: string; isUploading: boolean }>>({});
  const [submittingRequestId, setSubmittingRequestId] = useState<number | null>(null);

  // Op 27: List document requests for this task
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await partnerPortalService.documentRequests.list(taskId);
      if (res?.success && Array.isArray(res?.data)) {
        setDocRequests(res.data);
      } else {
        setDocRequests([]);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load document requests", "Error");
      setDocRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [taskId]);

  // Op 28: Upload file for a specific itemKey in a document request
  const handleFileUpload = async (requestId: number | string, itemKey: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Document file exceeds maximum allowed limit of 10 MB.", "File Too Large");
      return;
    }

    try {
      setItemUploads((prev) => ({
        ...prev,
        [itemKey]: { fileId: 0, fileName: file.name, isUploading: true }
      }));

      const res = await partnerPortalService.documentRequests.uploadItem(taskId, requestId, itemKey, file);
      if (res?.success && res.data?.id) {
        setItemUploads((prev) => ({
          ...prev,
          [itemKey]: { fileId: res.data.id, fileName: file.name, isUploading: false }
        }));
        toast.success(`Uploaded ${file.name} successfully`, "File Attached");
      }
    } catch (e: any) {
      setItemUploads((prev) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
      toast.error(e?.message || `Failed to upload ${file.name}`, "Upload Failed");
    }
  };

  // Op 29: Submit fulfilled document request with version check
  const handleSubmitRequest = async (docReq: PartnerDocumentRequest) => {
    // Validate every item in the request has a valid fileId
    const missingItems = docReq.items.filter((item) => !itemUploads[item.itemKey]?.fileId);
    if (missingItems.length > 0) {
      toast.error(
        `All requested documents are mandatory. Missing: ${missingItems.map((m) => m.label || m.itemKey).join(", ")}`,
        "Incomplete Documents"
      );
      return;
    }

    const payloadDocuments = docReq.items.map((item) => ({
      itemKey: item.itemKey,
      fileId: itemUploads[item.itemKey].fileId
    }));

    try {
      setSubmittingRequestId(docReq.id);
      // PDF specification strictly mandates documentRequest.version as expectedVersion
      await partnerPortalService.documentRequests.submit(
        taskId,
        docReq.id,
        docReq.version,
        payloadDocuments
      );

      toast.success("All requested documents submitted to CA specialist successfully!", "Fulfilled");
      if (onSuccessRefresh) onSuccessRefresh();
      loadRequests();
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to submit document request. If state changed, please reload.",
        "Submission Error"
      );
      // Reload on conflict/stale version
      if (err?.status === 409) {
        loadRequests();
      }
    } finally {
      setSubmittingRequestId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={FolderLock}
            badge="DOCUMENT REQUESTS DESK"
            title={`Required Additional Documents`}
            description={`Actionable document requests from CA specialists for Task #${taskId}.`}
            badgeTag="Op 27, 28, 29"
            onClose={onClose}
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p>Fetching active document requests...</p>
            </div>
          ) : docRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <FileCheck className="w-12 h-12 text-emerald-500 mb-2 stroke-[1.5]" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Pending Document Requests</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                All mandatory verification files are in place. When the CA specialist requires further documents, they will appear here.
              </p>
            </div>
          ) : (
            docRequests.map((req) => {
              const isOpen = req.status === "OPEN";
              const isSubmitting = submittingRequestId === req.id;
              const allUploaded = req.items.every((it) => !!itemUploads[it.itemKey]?.fileId);

              return (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Request ID: #{req.id} &bull; Version: {req.version}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                        {req.message || "Please provide the following supporting documents"}
                      </h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                      isOpen
                        ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400"
                        : "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2">
                    {req.items.map((item) => {
                      const uploadState = itemUploads[item.itemKey];
                      const isItemDone = Boolean(uploadState?.fileId);

                      return (
                        <div
                          key={item.itemKey}
                          className="p-3 bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate">{item.label || item.itemKey}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Key: {item.itemKey}</p>
                            {uploadState?.fileName && (
                              <p className="text-[10px] text-emerald-600 font-mono mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {uploadState.fileName}
                              </p>
                            )}
                          </div>

                          {isOpen ? (
                            <label
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                isItemDone
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
                                  : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400"
                              } ${uploadState?.isUploading ? "opacity-50 pointer-events-none" : ""}`}
                            >
                              {uploadState?.isUploading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isItemDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>{uploadState?.isUploading ? "Uploading..." : isItemDone ? "Replace" : "Upload File"}</span>
                              <input
                                type="file"
                                accept=".pdf,.png,.jpeg,.jpg"
                                className="hidden"
                                disabled={uploadState?.isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(req.id, item.itemKey, file);
                                }}
                              />
                            </label>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400">Fulfilled</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit All Button */}
                  {isOpen && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[11px] text-slate-500">
                        {allUploaded
                          ? "All files attached. Ready to submit to specialist."
                          : "Upload all requested items before submitting."}
                      </p>
                      <button
                        onClick={() => handleSubmitRequest(req)}
                        disabled={!allUploaded || isSubmitting}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                        <span>Submit All Documents</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <button
            onClick={loadRequests}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
