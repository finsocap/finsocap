"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  FileText,
  FolderLock,
  UploadCloud,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Trash2,
  ShieldCheck,
  Building2,
  Phone,
  User,
  Calendar,
  Layers,
  Sparkles,
  CreditCard,
  Briefcase,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { ClientModel, TaskModel, useCrmStore } from "@/lib/crmStore";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";

export interface ClientDocument {
  id: string;
  name: string;
  category: "KYC & Identity" | "Business Legal" | "Tax & Financials" | "Compliance Licences" | "Service Deliverables";
  uploadDate: string;
  size: string;
  format: "PDF" | "PNG" | "JPG" | "DOCX";
  uploadedBy: string;
  verified: boolean;
  serviceTag?: string;
}

interface ClientVaultModalProps {
  client: ClientModel;
  onClose: () => void;
}

const DEFAULT_CATEGORIES = [
  "KYC & Identity",
  "Business Legal",
  "Tax & Financials",
  "Compliance Licences",
  "Service Deliverables",
] as const;

export default function ClientVaultModal({ client, onClose }: ClientVaultModalProps) {
  const { tasks } = useCrmStore();
  const [activeTab, setActiveTab] = useState<"vault" | "services" | "kyc">("vault");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Client-specific tasks from CRM store
  const clientTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.client?.toLowerCase().trim() === client.name.toLowerCase().trim() ||
        (client.phone && t.phone && client.phone.replace(/\D/g, "") === t.phone.replace(/\D/g, ""))
    );
  }, [tasks, client]);

  // Local storage persisted documents for this client
  const storageKey = `finsocap_vault_${client.name.toLowerCase().replace(/\s+/g, "_")}`;
  const [documents, setDocuments] = useState<ClientDocument[]>(() => {
    let savedDocs: ClientDocument[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          savedDocs = JSON.parse(saved);
        }
      } catch (e) {}
    }

    // Automatically import documents uploaded in real tasks for this client (e.g. from service requests)
    const taskDocs: ClientDocument[] = [];
    clientTasks.forEach((t) => {
      if (Array.isArray(t.files) && t.files.length > 0) {
        t.files.forEach((f, idx) => {
          if (!savedDocs.some((d) => d.name === f)) {
            taskDocs.push({
              id: `task-doc-${t.id}-${idx}`,
              name: f,
              category: "Service Deliverables",
              uploadDate: t.date || "Recent",
              size: "1.2 MB",
              format: "PDF",
              uploadedBy: t.partner || "Franchise Partner",
              verified: true,
              serviceTag: t.service,
            });
          }
        });
      }
    });

    return [...taskDocs, ...savedDocs];
  });

  const saveDocs = (newDocs: ClientDocument[]) => {
    setDocuments(newDocs);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(newDocs));
    }
  };

  // Upload state
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<ClientDocument["category"]>("KYC & Identity");
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;

    const newDoc: ClientDocument = {
      id: `doc-${Date.now()}`,
      name: uploadName.endsWith(".pdf") ? uploadName : `${uploadName}.pdf`,
      category: uploadCategory,
      uploadDate: "Today",
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      format: "PDF",
      uploadedBy: "Admin / Operations",
      verified: true,
    };

    saveDocs([newDoc, ...documents]);
    setUploadName("");
    setIsUploading(false);
  };

  const handleDeleteDoc = (id: string) => {
    saveDocs(documents.filter((d) => d.id !== id));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredDocs = useMemo(() => {
    if (selectedCategory === "ALL") return documents;
    return documents.filter((d) => d.category === selectedCategory);
  }, [documents, selectedCategory]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={FolderLock}
            badge="FINSOCAP CLIENT DOSSIER"
            title={`${client.name} · Digital Master Vault`}
            description={`Permanent KYC records, legal compliances, uploaded documentation and service deliverables for ${client.business || "Entity"}.`}
            badgeTag="Encrypted Vault"
            onClose={onClose}
          />

          {/* Quick Info Strip */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{client.business || "Sole Proprietor / Direct"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>Partner: <strong className="text-slate-800 dark:text-slate-200">{client.partner || "Direct"}</strong></span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                KYC Verified
              </span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mt-4 flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("vault")}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
                activeTab === "vault"
                  ? "border-blue-600 text-blue-600 dark:text-sky-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FolderLock className="w-4 h-4" />
              <span>Document Locker ({documents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
                activeTab === "services"
                  ? "border-blue-600 text-blue-600 dark:text-sky-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Service Engagement History ({clientTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("kyc")}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
                activeTab === "kyc"
                  ? "border-blue-600 text-blue-600 dark:text-sky-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Client Entity Details</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: DOCUMENT LOCKER */}
          {activeTab === "vault" && (
            <div className="space-y-4">
              {/* Controls Strip: Categories + Upload New Document */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setSelectedCategory("ALL")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === "ALL"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Docs ({documents.length})
                  </button>
                  {DEFAULT_CATEGORIES.map((cat) => {
                    const count = documents.filter((d) => d.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedCategory === cat
                            ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsUploading(!isUploading)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              {/* Upload Dropdown / Form */}
              {isUploading && (
                <form
                  onSubmit={handleSimulateUpload}
                  className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      Add New Verified File to {client.name}&apos;s Locker
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsUploading(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Document Title / Filename
                      </label>
                      <input
                        type="text"
                        value={uploadName}
                        onChange={(e) => setUploadName(e.target.value)}
                        placeholder="e.g. MOA_AOA_Signed.pdf or Bank_Statement_6M.pdf"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                      >
                        {DEFAULT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsUploading(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
                    >
                      Save to Vault
                    </button>
                  </div>
                </form>
              )}

              {/* Documents Grid / List */}
              {filteredDocs.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No documents found in this folder</p>
                  <p className="text-[11px] text-slate-400">
                    Upload documents or service certificates to store permanently.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-400/60 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 flex items-center justify-center shrink-0 border border-blue-100">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={doc.name}>
                              {doc.name}
                            </h5>
                            {doc.verified && (
                              <span title="Verified Document">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                            <span className="font-bold text-slate-600 dark:text-slate-300">{doc.category}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.uploadDate}</span>
                          </div>
                          {doc.serviceTag && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                              Service: {doc.serviceTag}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => alert(`Previewing secure document: ${doc.name}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert(`Downloading verified attachment: ${doc.name}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete from Vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICE HISTORY */}
          {activeTab === "services" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Services Requested by Franchise Partners for {client.name}
                </h4>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {clientTasks.length} Operations
                </span>
              </div>

              {clientTasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
                  No active or past service requests logged for this client yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {clientTasks.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">{t.id}</span>
                          <span className="font-black text-xs text-slate-900">{t.service}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {t.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                          <span>Raised by: <strong className="text-slate-700">{t.partner || "Direct"}</strong></span>
                          <span>•</span>
                          <span>Assigned: <strong className="text-slate-700">{t.assignee || "Operations Pool"}</strong></span>
                          <span>•</span>
                          <span>Date: {t.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            t.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KYC & ENTITY DETAILS */}
          {activeTab === "kyc" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Authorized Person Information
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-bold text-slate-800">{client.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Contact Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{client.phone}</span>
                        <button
                          onClick={() => handleCopy(client.phone, "phone")}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          {copiedKey === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Official Email</span>
                      <span className="font-bold text-slate-800">
                        {client.phone ? `client_${client.phone.replace(/\D/g, "").slice(-6)}@finsocap.in` : "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Business & Compliance Registry
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Firm / Company</span>
                      <span className="font-bold text-slate-800">{client.business || "Sole Proprietor"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Partner Channel</span>
                      <span className="font-bold text-slate-800">{client.partner || "Direct"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">KYC Status</span>
                      <span className="font-bold text-emerald-600">100% Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <p className="text-[11px] font-medium text-slate-400">
            All files are stored securely with SHA-256 statutory checksums.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
