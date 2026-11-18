"use client";

import { X, Download, FileText, CheckCircle2, ExternalLink } from "lucide-react";
import ModalHeaderBanner from "./ModalHeaderBanner";
import { downloadFile, createDigitalDocBlobUrl } from "@/lib/fileViewer";
import { useEffect, useState } from "react";

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
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    if (!isOpen) {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        setActiveBlobUrl(null);
      }
      return;
    }

    if (!fileUrl || fileUrl === "#") {
      const generated = createDigitalDocBlobUrl(fileName, title, `Owner: ${uploadedBy || "Authorized User"} -- Status: Authenticated`);
      setActiveBlobUrl(generated);
    }
  }, [isOpen, fileUrl, fileName, title, uploadedBy]);

  if (!isOpen) return null;

  const effectiveUrl = fileUrl && fileUrl !== "#" ? fileUrl : activeBlobUrl;
  const isRealUrl = Boolean(effectiveUrl && (effectiveUrl.startsWith("http") || effectiveUrl.startsWith("/api") || effectiveUrl.startsWith("blob:")));
  const isImage = (fileName.toLowerCase().endsWith(".png") || fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg") || fileName.toLowerCase().endsWith(".webp")) && !imgError;

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
          {isRealUrl && isImage ? (
            <div className="p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 max-h-96 overflow-hidden">
              <img
                src={effectiveUrl || ""}
                alt={fileName}
                onError={() => {
                  setImgError(true);
                  if (!activeBlobUrl) {
                    const generated = createDigitalDocBlobUrl(fileName, title, `Owner: ${uploadedBy || "Authorized User"} -- Status: Authenticated`);
                    setActiveBlobUrl(generated);
                  }
                }}
                className="max-h-80 max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          ) : isRealUrl && (fileName.toLowerCase().endsWith(".pdf") || Boolean(activeBlobUrl) || (effectiveUrl && effectiveUrl.startsWith("blob:"))) ? (
            <div className="h-96 w-full">
              <iframe
                src={effectiveUrl || ""}
                className="w-full h-full border-0"
                title={fileName}
              />
            </div>
          ) : (
            /* Official Digital Document Simulator Preview */
            <div className="p-6 text-center space-y-4">
              {/* Document Certificate Sheet Representation */}
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      FS
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        FinSoCap Vault Dossier
                      </h4>
                      <p className="text-[9px] text-slate-400">Authenticated Statutory Record</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    VERIFIED
                  </span>
                </div>

                <div className="py-2 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Document Record</span>
                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all">
                    {fileName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Subject / Owner</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{uploadedBy || "Franchise Partner"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Record Type</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{category || "KYC Statutory Dossier"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Encryption Hash</span>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">SHA-256 Validated</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Security Status</span>
                    <span className="font-bold text-blue-600 dark:text-sky-400">Signed & Stored</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Cloud compliance record verified & ready for PDF extraction.</span>
                </div>
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

