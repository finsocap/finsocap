"use client";

import React, { useState } from "react";
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Save, 
  Loader2,
  ShieldCheck,
  CreditCard,
  Building2
} from "lucide-react";
import { 
  ApplicationFormVersionData, 
  ApplicationDocumentRequirement,
  partnerPortalService, 
  PartnerCustomerItem 
} from "@/lib/api/partnerPortalService";
import { isPartnerMockEnabled } from "@/lib/api/partnerMocks";
import CustomerPicker from "./CustomerPicker";

interface DynamicApplicationFormProps {
  formVersion: ApplicationFormVersionData;
  initialCustomer?: PartnerCustomerItem | null;
  onSuccess: (requestCode: string) => void;
  onCancel: () => void;
}

export default function DynamicApplicationForm({
  formVersion,
  initialCustomer = null,
  onSuccess,
  onCancel,
}: DynamicApplicationFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<PartnerCustomerItem | null>(initialCustomer);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [instructions, setInstructions] = useState("");
  
  // Document Upload State map: fieldKey -> { uploadId, fileName, sizeBytes, uploading, error }
  const [docUploads, setDocUploads] = useState<
    Record<string, { uploadId?: number; fileName?: string; sizeBytes?: number; uploading?: boolean; error?: string }>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { schema, ui, documents, service } = formVersion;
  const properties = schema?.properties || {};
  const requiredFields = schema?.required || [];

  const handleInputChange = (key: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  // Upload Document (Op 09)
  const handleFileUpload = async (docReq: ApplicationDocumentRequirement, file: File) => {
    if (!selectedCustomer) {
      setFormError("Please select or create a customer first before uploading files.");
      return;
    }

    // Client-side validations
    if (file.size > (docReq.maxBytes || 10485760)) {
      setDocUploads((prev) => ({
        ...prev,
        [docReq.fieldKey]: { error: `File exceeds maximum allowed size (${((docReq.maxBytes || 10485760) / (1024 * 1024)).toFixed(1)} MB)` },
      }));
      return;
    }

    if (docReq.mimeTypes && docReq.mimeTypes.length > 0) {
      const allowed = docReq.mimeTypes.some((m) => file.type.includes(m.replace("*", "")) || file.name.endsWith(m.replace("application/", ".")));
      if (!allowed && file.type) {
        setDocUploads((prev) => ({
          ...prev,
          [docReq.fieldKey]: { error: `Invalid file format. Allowed: ${docReq.mimeTypes.join(", ")}` },
        }));
        return;
      }
    }

    setDocUploads((prev) => ({
      ...prev,
      [docReq.fieldKey]: { uploading: true, error: undefined },
    }));

    try {
      if (isPartnerMockEnabled()) {
        const mockUploadId = Date.now();
        setDocUploads((prev) => ({
          ...prev,
          [docReq.fieldKey]: {
            uploadId: mockUploadId,
            fileName: file.name,
            sizeBytes: file.size,
            uploading: false,
          },
        }));
        return;
      }

      const res = await partnerPortalService.uploads.uploadDocument(
        selectedCustomer.id,
        service.id,
        docReq.fieldKey,
        file,
        formVersion.formVersionId || undefined
      );

      setDocUploads((prev) => ({
        ...prev,
        [docReq.fieldKey]: {
          uploadId: res.data.uploadId,
          fileName: res.data.fileName || file.name,
          sizeBytes: res.data.sizeBytes || file.size,
          uploading: false,
        },
      }));
    } catch (err: any) {
      setDocUploads((prev) => ({
        ...prev,
        [docReq.fieldKey]: { uploading: false, error: err?.message || "Failed to upload document" },
      }));
    }
  };

  // Delete Unused Upload (Op 10)
  const handleDeleteUpload = async (fieldKey: string) => {
    const uploadItem = docUploads[fieldKey];
    if (!uploadItem?.uploadId) {
      setDocUploads((prev) => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
      return;
    }

    try {
      if (!isPartnerMockEnabled()) {
        await partnerPortalService.uploads.deleteUpload(uploadItem.uploadId);
      }
      setDocUploads((prev) => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    } catch (err: any) {
      alert(`Could not delete upload: ${err?.message || "Conflict or attachment error"}`);
    }
  };

  // Direct Submit Service Application (Op 11)
  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission

    if (!selectedCustomer) {
      setFormError("Please select a customer before submitting.");
      return;
    }

    // Validate required form fields
    for (const field of requiredFields) {
      if (answers[field] === undefined || answers[field] === "") {
        setFormError(`Required field "${field}" is missing.`);
        return;
      }
    }

    // Validate required documents
    for (const doc of documents) {
      if (doc.required && !docUploads[doc.fieldKey]?.uploadId) {
        setFormError(`Mandatory document "${doc.label}" must be uploaded.`);
        return;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    const docPayload = Object.entries(docUploads)
      .filter(([_, val]) => val.uploadId)
      .map(([fieldKey, val]) => ({
        fieldKey,
        uploadId: val.uploadId!,
      }));

    try {
      if (isPartnerMockEnabled()) {
        onSuccess("T-MOCK-" + Math.floor(1000 + Math.random() * 9000));
        return;
      }

      const res = await partnerPortalService.requests.directSubmit(selectedCustomer.id, {
        serviceId: service.id,
        formVersionId: formVersion.formVersionId,
        answers,
        documents: docPayload,
        instructions,
      });

      onSuccess(res.data.requestCode || `T-${res.data.id}`);
    } catch (err: any) {
      setFormError(err?.message || "Submission failed. Please check required fields.");
      setIsSubmitting(false);
    }
  };

  // Save as Draft (Op 13)
  const handleSaveDraft = async () => {
    if (isSavingDraft) return;

    if (!selectedCustomer) {
      setFormError("Please select a customer to save a draft.");
      return;
    }

    setIsSavingDraft(true);
    setFormError(null);

    const docPayload = Object.entries(docUploads)
      .filter(([_, val]) => val.uploadId)
      .map(([fieldKey, val]) => ({
        fieldKey,
        uploadId: val.uploadId!,
      }));

    try {
      if (isPartnerMockEnabled()) {
        alert("Draft saved successfully in local mock storage!");
        setIsSavingDraft(false);
        return;
      }

      await partnerPortalService.drafts.create(selectedCustomer.id, {
        serviceId: service.id,
        formVersionId: formVersion.formVersionId,
        answers,
        documents: docPayload,
        instructions,
      });

      alert("Draft saved! You can resume and submit it anytime from your Drafts locker.");
      setIsSavingDraft(false);
    } catch (err: any) {
      setFormError(err?.message || "Could not save draft.");
      setIsSavingDraft(false);
    }
  };

  return (
    <form onSubmit={handleDirectSubmit} className="space-y-6 text-xs">
      {/* Service Header Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            {service.category} &bull; Service Application
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {service.name}
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">{service.subtitle || "Statutory compliance application"}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Standard Service Fee</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              ₹{service.startingClientPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="text-right border-l pl-4 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Partner Profit</span>
            <span className="text-sm font-black text-emerald-600">
              +₹{service.partnerProfit.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* 1. Customer Selector */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <CustomerPicker
          selectedCustomer={selectedCustomer}
          onSelectCustomer={(c) => setSelectedCustomer(c)}
        />
      </div>

      {/* 2. Dynamic Answers Form (Rendered dynamically from schema) */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Application Specific Details</span>
        </h4>

        {Object.keys(properties).length === 0 ? (
          <p className="text-slate-400 text-[11px] italic">No custom fields configured for this service catalog.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(properties).map(([fieldKey, propDef]: [string, any]) => {
              const isRequired = requiredFields.includes(fieldKey);
              const label = propDef.title || fieldKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
              const placeholder = ui?.[fieldKey]?.["ui:placeholder"] || `Enter ${label.toLowerCase()}...`;
              const value = answers[fieldKey] || "";

              return (
                <div key={fieldKey} className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {label} {isRequired && <span className="text-rose-500">*</span>}
                  </label>
                  {propDef.type === "number" ? (
                    <input
                      type="number"
                      required={isRequired}
                      value={value}
                      placeholder={placeholder}
                      onChange={(e) => handleInputChange(fieldKey, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  ) : propDef.enum ? (
                    <select
                      required={isRequired}
                      value={value}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-blue-600"
                    >
                      <option value="">Select an option...</option>
                      {propDef.enum.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required={isRequired}
                      value={value}
                      placeholder={placeholder}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Mandatory & Optional Document Slots (Ops 09, 10) */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-purple-600" />
            <span>Required Documents ({documents.length} Slots)</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-semibold">Max 10 MB per file &bull; PDF, PNG, JPG</span>
        </div>

        {documents.length === 0 ? (
          <p className="text-slate-400 text-[11px] italic">No document uploads required for this service.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((docReq) => {
              const uploadInfo = docUploads[docReq.fieldKey];
              const isUploaded = Boolean(uploadInfo?.uploadId);

              return (
                <div
                  key={docReq.fieldKey}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isUploaded
                      ? "bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-800 shadow-2xs"
                      : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                        {docReq.label} {docReq.required && <span className="text-rose-500">*</span>}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Formats: {docReq.mimeTypes?.join(", ") || "PDF, PNG, JPG"}
                      </span>
                    </div>
                    {isUploaded && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Uploaded (ID #{uploadInfo.uploadId})
                      </span>
                    )}
                  </div>

                  {uploadInfo?.error && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">{uploadInfo.error}</p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    {isUploaded ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                          {uploadInfo.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteUpload(docReq.fieldKey)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete Upload (Op 10)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full py-1.5 px-3 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-600 text-center font-bold text-[11px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                        {uploadInfo?.uploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading (Op 09)...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Choose &amp; Upload Document</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept={docReq.mimeTypes?.join(",") || ".pdf,.png,.jpg,.jpeg"}
                          disabled={uploadInfo?.uploading}
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(docReq, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Instructions Note */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Partner Administrative Instructions / Notes for Specialist (Optional)
        </label>
        <textarea
          rows={2}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Please expedite verification. Applicant needs license within 48 hours."
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Actions Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          {/* Save as Draft (Op 13) */}
          <button
            type="button"
            disabled={isSavingDraft || isSubmitting}
            onClick={handleSaveDraft}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save as Draft (Op 13)</span>
          </button>

          {/* Direct Submit (Op 11) */}
          <button
            type="submit"
            disabled={isSubmitting || isSavingDraft}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Direct Submit Application (Op 11)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

