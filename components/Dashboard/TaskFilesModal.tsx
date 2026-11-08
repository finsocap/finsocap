"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderGit2, 
  Download, 
  Eye, 
  FileText, 
  Loader2, 
  Clock, 
  User, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { partnerPortalService, PartnerTaskFileItem } from "@/lib/api/partnerPortalService";
import { useToast } from "@/components/Global/ToastNotification";

interface TaskFilesModalProps {
  taskId: string | number;
  onClose: () => void;
}

export default function TaskFilesModal({ taskId, onClose }: TaskFilesModalProps) {
  const toast = useToast();
  const [files, setFiles] = useState<PartnerTaskFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);

  // Op 23: List files uploaded in this task
  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await partnerPortalService.documents.listTaskFiles(taskId);
      if (res?.success && Array.isArray(res?.data)) {
        setFiles(res.data);
      } else {
        setFiles([]);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load task files", "Error");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [taskId]);

  // Op 24: Secure binary download via Bearer token blob
  const handleDownload = async (file: PartnerTaskFileItem, inline: boolean = false) => {
    try {
      setDownloadingFileId(file.id);
      const { objectUrl } = await partnerPortalService.documents.downloadTaskFile(taskId, file.id, inline);
      
      if (inline) {
        window.open(objectUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = file.fileName || "task-file";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to retrieve private file with Bearer token", "Download Error");
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={FolderGit2}
            badge="SECURE TASK FILES"
            title={`Collaboration Files Locker`}
            description={`Protected document repository for Task #${taskId}. Token-authenticated access only.`}
            badgeTag="Op 23 & 24"
            onClose={onClose}
          />
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3 text-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p>Loading files list...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Task Files Found</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                Files generated during processing or shared by specialists will appear here.
              </p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="p-3.5 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-400/50 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{file.title || file.fileName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>&bull;</span>
                      <span>{file.uploadedBy || "Specialist"}</span>
                      <span>&bull;</span>
                      <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString("en-GB") : ""}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDownload(file, true)}
                    disabled={downloadingFileId === file.id}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    title="Preview File"
                  >
                    {downloadingFileId === file.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(file, false)}
                    disabled={downloadingFileId === file.id}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-sky-300 hover:bg-blue-100 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <button
            onClick={loadFiles}
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
