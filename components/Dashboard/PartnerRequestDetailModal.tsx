"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  User, 
  Building2, 
  Calendar, 
  ArrowRight, 
  MessageSquare, 
  FolderLock, 
  Award, 
  Edit3,
  ExternalLink,
  ShieldCheck,
  History
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { 
  partnerPortalService, 
  PartnerServiceRequestDetail, 
  PartnerServiceRequestHistory 
} from "@/lib/api/partnerPortalService";
import { useToast } from "@/components/Global/ToastNotification";
import PartnerChatDrawer from "./PartnerChatDrawer";
import DocumentRequestsModal from "./DocumentRequestsModal";
import TaskFilesModal from "./TaskFilesModal";
import TaskCompletionModal from "./TaskCompletionModal";
import ApplicationCorrectionModal from "./ApplicationCorrectionModal";

interface PartnerRequestDetailModalProps {
  requestId: string | number;
  onClose: () => void;
  onRefreshList?: () => void;
}

export default function PartnerRequestDetailModal({
  requestId,
  onClose,
  onRefreshList
}: PartnerRequestDetailModalProps) {
  const toast = useToast();
  const [detail, setDetail] = useState<PartnerServiceRequestDetail | null>(null);
  const [history, setHistory] = useState<PartnerServiceRequestHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-modal states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDocRequestsOpen, setIsDocRequestsOpen] = useState(false);
  const [isTaskFilesOpen, setIsTaskFilesOpen] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  // Op 22 blob viewing state
  const [viewingDocKey, setViewingDocKey] = useState<string | null>(null);

  // Op 20: Read full request detail
  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await partnerPortalService.requests.getDetails(requestId);
      if (res?.success && res.data) {
        setDetail(res.data);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load request details", "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [requestId]);

  // Op 22: Binary original file preview / download with Bearer auth
  const handleViewOriginalFile = async (documentId: number, inline: boolean = true) => {
    try {
      setViewingDocKey(String(documentId));
      const { objectUrl } = await partnerPortalService.documents.readOriginalFile(documentId, inline);
      if (inline) {
        window.open(objectUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `document-${documentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to fetch file ID ${documentId}`, "File Retrieval Error");
    } finally {
      setViewingDocKey(null);
    }
  };

  const isTaskClosed = detail?.status === "COMPLETED" || detail?.status === "CANCELLED";
  const canCorrect = detail?.status === "PENDING_FROM_CLIENT";

  return (
    <>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
            <ModalHeaderBanner
              icon={FileText}
              badge="SERVICE REQUEST LIFECYCLE"
              title={detail ? `${detail.serviceName} · #${detail.requestCode || detail.id}` : `Request #${requestId}`}
              description={detail ? `Customer: ${detail.customerName || "Customer"}` : "Service request tracker"}
              badgeTag="Op 20 & 22"
              onClose={onClose}
            />
          </div>

          {/* Quick Action Toolbar */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Status:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                detail?.status === "COMPLETED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : detail?.status === "PENDING_FROM_CLIENT"
                  ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400"
                  : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-400"
              }`}>
                {detail?.status || "LOADING"}
              </span>
              {detail?.assignmentStatus && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {detail.assignmentStatus}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Op 21 Correction Button (Only visible if PENDING_FROM_CLIENT) */}
              {canCorrect && (
                <button
                  onClick={() => setIsCorrectionOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Submit Correction (Op 21)</span>
                </button>
              )}

              {/* Op 27-29 Document Requests */}
              <button
                onClick={() => setIsDocRequestsOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <FolderLock className="w-3.5 h-3.5 text-amber-500" />
                <span>Doc Requests</span>
              </button>

              {/* Op 23-24 Task Files */}
              <button
                onClick={() => setIsTaskFilesOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Task Files</span>
              </button>

              {/* Op 25-26 Live Chat */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-sky-300 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Chat</span>
              </button>

              {/* Op 30 Completion / Licence */}
              <button
                onClick={() => setIsCompletionOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Licence / Certificate</span>
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                <p>Loading service request details...</p>
              </div>
            ) : !detail ? (
              <div className="py-20 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                <p className="font-bold">Request details not available.</p>
              </div>
            ) : (
              <>
                {/* Query message alert banner if present */}
                {detail.queryMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-1">
                    <div className="font-bold text-xs flex items-center gap-2 text-rose-700 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4" />
                      <span>CA Specialist Action Query</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 pl-6 leading-relaxed font-medium">
                      {detail.queryMessage}
                    </p>
                  </div>
                )}

                {/* 2-column details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Metadata & Client Info */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      Filing & Customer Overview
                    </h4>
                    <div className="space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Service:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{detail.serviceName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Customer:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{detail.customerName || `Customer #${detail.customerId}`}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span>{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString("en-GB") : "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Submission Version:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{detail.submissionVersion}</span>
                      </div>
                      {detail.assignedToName && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Assigned Specialist:</span>
                          <span className="font-bold text-blue-600 dark:text-sky-300">{detail.assignedToName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Attached Original Documents (Op 22) */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Attached Application Documents (Op 22)
                    </h4>
                    {detail.documents && detail.documents.length > 0 ? (
                      <div className="space-y-2">
                        {detail.documents.map((doc) => (
                          <div
                            key={doc.uploadId}
                            className="p-2.5 bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white capitalize truncate">
                                {doc.fieldKey.replace(/([A-Z])/g, " $1")}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{doc.fileName} ({(doc.sizeBytes / 1024).toFixed(0)} KB)</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleViewOriginalFile(doc.uploadId, true)}
                                disabled={viewingDocKey === String(doc.uploadId)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 transition-colors"
                                title="View inline with Bearer auth"
                              >
                                {viewingDocKey === String(doc.uploadId) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleViewOriginalFile(doc.uploadId, false)}
                                disabled={viewingDocKey === String(doc.uploadId)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                                title="Download with Bearer auth"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">No application documents attached.</p>
                    )}
                  </div>
                </div>

                {/* Answers / Form Data */}
                {detail.answers && Object.keys(detail.answers).length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                      Submitted Dynamic Form Answers
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {Object.entries(detail.answers).map(([key, val]) => (
                        <div key={key} className="p-3 bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="font-semibold text-slate-800 dark:text-white mt-0.5 break-words">
                            {typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status History Timeline */}
                {history.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-600" />
                      Status Progression History
                    </h4>
                    <div className="space-y-2 border-l-2 border-blue-200 dark:border-blue-900/60 ml-2 pl-4">
                      {history.map((h, idx) => (
                        <div key={idx} className="relative space-y-0.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1" />
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{h.status}</span>
                            <span className="text-[10px] text-slate-400">
                              {h.timestamp ? new Date(h.timestamp).toLocaleString("en-GB") : ""}
                            </span>
                          </div>
                          {h.remarks && <p className="text-[11px] text-slate-600 dark:text-slate-400">{h.remarks}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Sub Modals */}
      {isChatOpen && (
        <PartnerChatDrawer
          taskId={requestId}
          serviceName={detail?.serviceName}
          isClosed={isTaskClosed}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {isDocRequestsOpen && (
        <DocumentRequestsModal
          taskId={requestId}
          onClose={() => setIsDocRequestsOpen(false)}
          onSuccessRefresh={loadDetail}
        />
      )}

      {isTaskFilesOpen && (
        <TaskFilesModal
          taskId={requestId}
          onClose={() => setIsTaskFilesOpen(false)}
        />
      )}

      {isCompletionOpen && (
        <TaskCompletionModal
          taskId={requestId}
          serviceName={detail?.serviceName}
          onClose={() => setIsCompletionOpen(false)}
        />
      )}

      {isCorrectionOpen && detail && (
        <ApplicationCorrectionModal
          detail={detail}
          onClose={() => setIsCorrectionOpen(false)}
          onSuccessRefresh={() => {
            loadDetail();
            if (onRefreshList) onRefreshList();
          }}
        />
      )}
    </>
  );
}
