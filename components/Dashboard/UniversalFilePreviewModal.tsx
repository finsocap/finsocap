"use client";

import { X, Download, FileText, CheckCircle2, ExternalLink } from "lucide-react";
import ModalHeaderBanner from "./ModalHeaderBanner";
import { downloadFile } from "@/lib/fileViewer";

interface UniversalFilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileName: string;
  fileUrl?: string;
  uploadedBy?: string;
  uploadDate?: string;
  category?: string;
}

export default function UniversalFilePreviewModal({
  isOpen,
  onClose,
  title,
  fileName,
  fileUrl,
  uploadedBy,
  uploadDate,
  category,
}: UniversalFilePreviewModalProps) {
  if (!isOpen) return null;

  const isRealUrl = fileUrl && (fileUrl.startsWith("http") || fileUrl.startsWith("/api") || fileUrl.startsWith("blob:"));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl relative space-y-4">
        <ModalHeaderBanner
          icon={FileText}
          badge={category || "VERIFIED DOCUMENT"}
          title={title}
          description={`Inspecting document: ${fileName}`}
          badgeTag="Document Dossier"
          onClose={onClose}
        />

        {/* Document Content View / Viewer Canvas */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 overflow-hidden">
          {isRealUrl && (fileName.endsWith(".pdf") || fileUrl.includes("inline=true")) ? (
            <div className="h-96 w-full">
              <iframe
                src={fileUrl}
                className="w-full h-full border-0"
                title={fileName}
              />
            </div>
          ) : isRealUrl && (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) ? (
            <div className="p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 max-h-96 overflow-hidden">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-h-80 max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          ) : (
            /* Official Digital Document Simulator Preview */
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-sky-400 mx-auto flex items-center justify-center shadow-inner">
                <FileText className="w-9 h-9" />
              </div>

              <div>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {fileName}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  FinSoCap Compliance Vault &bull; Protected Document Record
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Uploaded By</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{uploadedBy || "Authorized Entity"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Timestamp</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{uploadDate || "Verified"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Encryption</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">SHA-256 Bit SSL</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Status</span>
                  <span className="font-bold text-blue-600 dark:text-sky-400">Authenticated</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Digitally Verified Copy Available for Immediate Download</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => downloadFile(fileUrl || "", fileName)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Original File</span>
          </button>
        </div>
      </div>
    </div>
  );
}

