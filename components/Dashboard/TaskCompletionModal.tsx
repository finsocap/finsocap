"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Download,
  FileCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Hash,
  Lock,
  Unlock,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { partnerPortalService, PartnerTaskCompletion } from "@/lib/api/partnerPortalService";
import { useToast } from "@/components/Global/ToastNotification";

interface TaskCompletionModalProps {
  taskId: string | number;
  requestCode?: string;
  serviceName?: string;
  onClose: () => void;
}

export default function TaskCompletionModal({
  taskId,
  requestCode,
  serviceName,
  onClose,
}: TaskCompletionModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState<PartnerTaskCompletion | null>(null);
  const [attachments, setAttachments] = useState<Array<{ id: number; fileName: string; downloadUrl: string }>>([]);
  const [documentsUnlocked, setDocumentsUnlocked] = useState<boolean>(false);

  // Read task completion details & certificate URLs from partner API
  const loadCompletion = async () => {
    try {
      setLoading(true);
      const res = await partnerPortalService.completion.getDetails(taskId);

      if (res?.success && res.data) {
        setCompletion(res.data.completion || null);
        setDocumentsUnlocked(Boolean(res.data.documentsUnlocked));
        if (Array.isArray(res.data.completionAttachments)) {
          setAttachments(res.data.completionAttachments);
        }
      } else {
        setCompletion(null);
      }
    } catch (err: any) {
      setCompletion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletion();
  }, [taskId]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            title={serviceName || `Task #${taskId}`}
            description="Verified regulatory output certificate and licence issuance registry."
            icon={Award}
            badge="Completion"
            onClose={onClose}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p>Retrieving completion certificate status...</p>
            </div>
          ) : !completion ? (
            <div className="flex flex-col items-center justify-center py-14 text-center text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Not Completed Yet</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  This service filing is actively being processed by the operational CA desk. Final certificates and regulatory licence numbers will be published here upon completion.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Certificate Overview Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                      Official Licence Issued
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    {completion.licenceType || "PERMANENT"}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" />
                      Licence / Reg No:
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs select-all">
                      {completion.licenceNumber || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Issue Date:
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {completion.issueDate || "—"}
                    </span>
                  </div>

                  {completion.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Validity / Expiry:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {completion.expiryDate}
                      </span>
                    </div>
                  )}

                  {completion.notes && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold">Remarks: </span>
                      {completion.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Download Links or Gate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Output Documents & Certificates
                  </h5>
                  {!documentsUnlocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      <Lock className="w-3 h-3" />
                      Admin Settlement Confirmation Required
                    </span>
                  )}
                </div>

                {!documentsUnlocked ? (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-900 dark:text-amber-200 text-xs block">
                          Output Documents Locked
                        </span>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                          Staff has completed the filing. Output documents unlock automatically once the administrator confirms the payment request in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {att.fileName || "Government Issued Certificate.pdf"}
                            </p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Verified by Admin • Ready for download
                            </p>
                          </div>
                        </div>
                        <a
                          href={att.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-slate-400 text-xs">
                    No certificate files uploaded yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
