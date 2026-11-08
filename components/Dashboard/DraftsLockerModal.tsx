"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Trash2, 
  Send, 
  Clock, 
  Loader2, 
  ExternalLink,
  AlertCircle,
  FolderOpen,
  CheckCircle2
} from "lucide-react";
import { 
  partnerPortalService, 
  ServiceRequestDraftData, 
  PartnerCustomerItem 
} from "@/lib/api/partnerPortalService";
import { isPartnerMockEnabled } from "@/lib/api/partnerMocks";

interface DraftsLockerModalProps {
  customer?: PartnerCustomerItem | null;
  onSelectDraft?: (draft: ServiceRequestDraftData) => void;
  onSubmitSuccess?: () => void;
  onClose: () => void;
}

export default function DraftsLockerModal({
  customer = null,
  onSelectDraft,
  onSubmitSuccess,
  onClose,
}: DraftsLockerModalProps) {
  const [drafts, setDrafts] = useState<ServiceRequestDraftData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingDraftId, setSubmittingDraftId] = useState<number | null>(null);

  const fetchDrafts = async () => {
    if (!customer) return;
    setLoading(true);
    setError(null);
    try {
      if (isPartnerMockEnabled()) {
        setDrafts([]);
        setLoading(false);
        return;
      }
      const res = await partnerPortalService.drafts.listForCustomer(customer.id);
      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [customer]);

  const handleDeleteDraft = async (draftId: number) => {
    if (!customer) return;
    if (!confirm("Are you sure you want to permanently delete this draft application?")) return;

    try {
      if (!isPartnerMockEnabled()) {
        await partnerPortalService.drafts.delete(customer.id, draftId);
      }
      setDrafts((prev) => prev.filter((d) => d.draftId !== draftId));
    } catch (err: any) {
      alert(`Could not delete draft: ${err?.message || "Conflict error"}`);
    }
  };

  // Submit Draft to Admin (Op 18)
  const handleSubmitDraft = async (draft: ServiceRequestDraftData) => {
    if (!customer) return;
    setSubmittingDraftId(draft.draftId);

    try {
      if (!isPartnerMockEnabled()) {
        // Send expectedVersion as draft.version
        await partnerPortalService.drafts.submit(customer.id, draft.draftId, draft.version);
      }
      alert(`Draft #${draft.draftId} submitted successfully to Admin operations queue!`);
      setDrafts((prev) => prev.filter((d) => d.draftId !== draft.draftId));
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err: any) {
      if (err?.status === 409) {
        alert("Conflict: The draft version has changed. Reloading draft data...");
        fetchDrafts();
      } else {
        alert(`Failed to submit draft: ${err?.message || "Incomplete required fields/documents"}`);
      }
    } finally {
      setSubmittingDraftId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Ops 14–18 &bull; Draft Applications
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Customer Draft Locker {customer ? `(${customer.name})` : ""}
            </h3>
          </div>
          <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading drafts...</span>
            </div>
          ) : drafts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-2">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600 dark:text-slate-300">No saved drafts for this customer</p>
              <p className="text-[11px]">Save any incomplete application form as a draft to resume later.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {drafts.map((d) => (
                <div key={d.draftId} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 flex items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Draft #{d.draftId}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Version {d.version}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Form v{d.formVersionId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {d.documents?.length || 0} attached document(s) &bull; Answers: {Object.keys(d.answers || {}).length} fields
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectDraft) onSelectDraft(d);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 cursor-pointer"
                    >
                      Resume (Op 15)
                    </button>

                    <button
                      type="button"
                      disabled={submittingDraftId === d.draftId}
                      onClick={() => handleSubmitDraft(d)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submittingDraftId === d.draftId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Submit (Op 18)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(d.draftId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete Draft (Op 17)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
