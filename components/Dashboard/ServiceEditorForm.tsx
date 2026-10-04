"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Plus, Trash2, Edit3, Link as LinkIcon, 
  Video, BookOpen, HelpCircle, FileText, CheckCircle2,
  ChevronDown, ChevronUp, AlertCircle, Sparkles, ExternalLink, X,
  Image as ImageIcon, Eye, Upload, CalendarRange, Boxes
} from "lucide-react";
import { ServiceItem, ServiceDocument, ServiceLink, ServiceMaterial, ServiceFaq, ServiceYearFee } from "@/types";
import { serviceCatalog } from "@/lib/services/serviceCatalog";
import { useTheme } from "@/components/Providers/ThemeProvider";
import RichTextEditor from "@/components/Dashboard/RichTextEditor";

interface ServiceEditorFormProps {
  initialData?: ServiceItem | null;
  isEditMode?: boolean;
}

export default function ServiceEditorForm({ initialData, isEditMode = false }: ServiceEditorFormProps) {
  const router = useRouter();
  const { config } = useTheme();

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "Food & Beverage");
  const [categoryList, setCategoryList] = useState<string[]>(() => {
    const defaultList = [
      "Food & Beverage",
      "Taxation",
      "Business Compliance",
      "Intellectual Property",
      "Import Export",
      "Digital Services",
      "Business Growth",
    ];
    if (initialData?.category && !defaultList.includes(initialData.category)) {
      defaultList.push(initialData.category);
    }
    return defaultList;
  });
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categoryList.includes(trimmed)) {
      setCategoryList((prev) => [...prev, trimmed]);
    }
    setCategory(trimmed);
    setNewCategoryName("");
    setIsAddingNewCategory(false);
  };

  const [description, setDescription] = useState(initialData?.description || "");
  const [recurring, setRecurring] = useState<"Yes" | "No">(initialData?.recurring || "No");
  const [frequency, setFrequency] = useState<"One Time" | "Monthly" | "Yearly" | "Quarterly">(initialData?.frequency || "One Time");
  const [processingTime, setProcessingTime] = useState(initialData?.processingTime || "3 - 7 Days");
  const [governmentFee, setGovernmentFee] = useState<number>(initialData?.governmentFee ?? 0);
  const [price, setPrice] = useState<number>(initialData?.price ?? 1500);
  const [status, setStatus] = useState<"Active" | "Inactive" | "Draft">(initialData?.status || "Active");
  const [content, setContent] = useState(initialData?.content || "");
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const [eligibility, setEligibility] = useState(initialData?.eligibility || "");

  // Year-wise Statutory & Professional Fee breakdown (e.g. 1 Year to 5+ Years)
  const [hasYearFees, setHasYearFees] = useState<boolean>(initialData?.hasYearFees || false);
  const [yearFees, setYearFees] = useState<ServiceYearFee[]>(
    initialData?.yearFees && initialData.yearFees.length > 0
      ? initialData.yearFees
      : [
          { id: "yf-1", year: 1, label: "1 Year", governmentFee: 100, professionalFee: 1400 },
          { id: "yf-2", year: 2, label: "2 Years", governmentFee: 200, professionalFee: 2300 },
          { id: "yf-3", year: 3, label: "3 Years", governmentFee: 300, professionalFee: 3200 },
          { id: "yf-5", year: 5, label: "5 Years", governmentFee: 500, professionalFee: 4500 },
        ]
  );

  const handleAddYearTier = () => {
    const nextYear = yearFees.length > 0 ? Math.max(...yearFees.map((y) => y.year)) + 1 : 1;
    const newTier: ServiceYearFee = {
      id: `yf-${Date.now()}`,
      year: nextYear,
      label: `${nextYear} Year${nextYear > 1 ? "s" : ""}`,
      governmentFee: 100 * nextYear,
      professionalFee: 1000 + 500 * (nextYear - 1),
    };
    setYearFees([...yearFees, newTier]);
  };

  const handleUpdateYearTier = (id: string, field: "year" | "label" | "governmentFee" | "professionalFee", val: any) => {
    setYearFees(
      yearFees.map((y) => {
        if (y.id === id) {
          const updated = { ...y, [field]: val };
          if (field === "year") {
            const num = Number(val) || 1;
            updated.year = num;
            updated.label = `${num} Year${num > 1 ? "s" : ""}`;
          }
          return updated;
        }
        return y;
      })
    );
  };

  const handleDeleteYearTier = (id: string) => {
    if (yearFees.length <= 1) return;
    setYearFees(yearFees.filter((y) => y.id !== id));
  };

  // Dynamic Lists
  const [highlights, setHighlights] = useState<string[]>(
    initialData?.highlights || [
      "100% Online Government Filing",
      "Immediate ARN generation for bank accounts",
    ]
  );

  const [steps, setSteps] = useState<string[]>(
    initialData?.steps || [
      "Collect PAN, Aadhaar & address proof from client",
      "Pay official government challan & submit application",
      "Download verified certificate & issue to client",
    ]
  );

  const [documents, setDocuments] = useState<ServiceDocument[]>(
    initialData?.documents || [
      { id: "doc-1", name: "Aadhaar Card / Voter ID", type: "Required", sampleImageName: "aadhaar_sample.png" },
      { id: "doc-2", name: "Electricity Bill / Shop Agreement", type: "Required", sampleImageName: "electricity_bill_sample.pdf" },
      { id: "doc-3", name: "Cancelled Cheque / Bank Passbook", type: "Optional" },
    ]
  );

  const [usefulLinks, setUsefulLinks] = useState<ServiceLink[]>(
    initialData?.usefulLinks || [
      { id: "link-1", title: "Official Government Portal", url: "https://example.gov.in" },
    ]
  );

  const [videoLink, setVideoLink] = useState(initialData?.videoLink || "https://youtube.com/watch?v=sample");
  const [trainingVideos, setTrainingVideos] = useState<Array<{ id: string; title: string; url: string }>>(() => {
    if (initialData?.videoLink) {
      return [{ id: "vid-1", title: "Official Step-by-Step Filing Tutorial", url: initialData.videoLink }];
    }
    return [{ id: "vid-1", title: "Official Step-by-Step Filing Tutorial", url: "https://youtube.com/watch?v=sample" }];
  });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoModalTitle, setVideoModalTitle] = useState("");
  const [videoModalUrl, setVideoModalUrl] = useState("");
  const [activeVideoPreview, setActiveVideoPreview] = useState<{ title: string; url: string } | null>(null);

  const [isCustomSla, setIsCustomSla] = useState(false);

  const [studyMaterials, setStudyMaterials] = useState<ServiceMaterial[]>(
    initialData?.studyMaterials || [
      { id: "mat-1", title: "Filing Process Guide.pdf", fileUrl: "https://example.com/guide.pdf" },
    ]
  );

  const [faqs, setFaqs] = useState<ServiceFaq[]>(
    initialData?.faqs || [
      { id: "faq-1", question: "How long does processing take?", answer: "Standard turnaround time is 3 to 7 business days." },
    ]
  );

  // Document modal state (Add / Edit)
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"Required" | "Optional">("Required");
  const [newDocSampleUrl, setNewDocSampleUrl] = useState<string>("");
  const [newDocSampleName, setNewDocSampleName] = useState<string>("");
  const [previewSpecimenModal, setPreviewSpecimenModal] = useState<{ name: string; url?: string } | null>(null);

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a service name.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload: Partial<ServiceItem> = {
        id: initialData?.id,
        name,
        category,
        description,
        recurring,
        frequency,
        processingTime,
        governmentFee: Number(governmentFee) || 0,
        price: Number(price) || 0,
        hasYearFees,
        yearFees: hasYearFees ? yearFees : undefined,
        status,
        content,
        eligibility,
        highlights: highlights.filter((h) => h.trim() !== ""),
        steps: steps.filter((s) => s.trim() !== ""),
        documents,
        usefulLinks: usefulLinks.filter((l) => l.title.trim() !== ""),
        videoLink: trainingVideos.length > 0 ? trainingVideos[0].url : videoLink,
        studyMaterials: studyMaterials.filter((m) => m.title.trim() !== ""),
        faqs: faqs.filter((f) => f.question.trim() !== ""),
      };

      await serviceCatalog.save(payload);

      // Sync with crmStore so services table reflects changes immediately
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("finsocap-crm-data");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.services)) {
              const numId = parseInt(String(initialData?.id || "").replace(/\D/g, ""), 10);
              let found = false;
              parsed.services = parsed.services.map((srv: any) => {
                if (
                  (numId && srv.id === numId) ||
                  srv.id === initialData?.id ||
                  srv.name.toLowerCase() === (initialData?.name || name).toLowerCase()
                ) {
                  found = true;
                  return {
                    ...srv,
                    name,
                    category,
                    price: Number(price) || srv.price,
                    gov: Number(governmentFee) || srv.gov,
                    time: processingTime || srv.time,
                    description,
                    recurring: recurring === "Yes",
                    frequency,
                    status,
                  };
                }
                return srv;
              });

              if (!found && !isEditMode) {
                parsed.services.push({
                  id: parsed.services.length + 1,
                  name,
                  category,
                  recurring: recurring === "Yes",
                  frequency,
                  price: Number(price) || 0,
                  gov: Number(governmentFee) || 0,
                  time: processingTime || "3 - 7 Days",
                  status: status || "Active",
                  description,
                });
              }

              localStorage.setItem("finsocap-crm-data", JSON.stringify(parsed));
            }
          }
        } catch (e) {
          console.error("Failed to sync crm store", e);
        }
      }

      router.push("/dashboard/services");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save service");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7 pb-20">
      {/* 1. Header & Actions (Matching Screenshot 2 - Official Finsocap Theme) */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 dark:from-[#0b1226] dark:via-[#0e1c44]/80 dark:to-[#080d1a] border border-blue-200/70 dark:border-blue-900/40 shadow-sm shadow-blue-500/5">
        {/* Ambient Brand Glow Mesh */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
          <div className="absolute -top-24 -left-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-20 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          {/* Brand Identity & Title */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0e1c44] via-blue-600 to-sky-400 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0b1226] rounded-full ring-2 ring-emerald-500/20 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                  <span>FINSOCAP INTELLIGENCE SUITE</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • <Link href="/dashboard/services" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Products / Services</Link> &rsaquo; <span className="font-bold text-blue-600 dark:text-sky-400">{isEditMode ? "Edit Service" : "Add New Service"}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2.5">
                {isEditMode ? `Edit: ${name || "Service"}` : "Create New Catalog Service"}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/80 dark:border-blue-800/80 font-mono">
                  {category}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                Configure retail pricing, statutory government fees, required client documents, and processing SLA.
              </p>
            </div>
          </div>

          {/* Right Action / Controls */}
          <div className="relative z-30 flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/services"
              className="btn-glass-modern text-xs py-2 px-3.5 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary-vibrant text-xs py-2 px-4 shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Service..." : "Save Service"}</span>
            </button>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="relative z-10 mt-5 pt-3.5 border-t border-blue-100/80 dark:border-blue-900/40 flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Sync Active
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Category: <strong className="text-slate-700 dark:text-slate-300">{category}</strong> &bull; Status: <strong className="text-slate-700 dark:text-slate-300">{status}</strong></span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 font-bold text-[10px] border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
            Finsocap v2.4 Enterprise
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =================================================================== */}
        {/* LEFT COLUMN (Wide): Core Details, Content, Highlights, Steps, Eligibility */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Service Details */}
          <div className="card-luxury p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">1</span>
                <span>Basic Service Information</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Service Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 inline-flex items-center gap-1">
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Editable</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. FSSAI Registration"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                  />
                  <div className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" title="Field is editable">
                    <Edit3 className="w-3.5 h-3.5 text-blue-500/70" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  {!isAddingNewCategory ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(true);
                        setNewCategoryName("");
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      + Add New
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryName("");
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Choose existing
                    </button>
                  )}
                </div>

                {isAddingNewCategory ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewCategory();
                        } else if (e.key === "Escape") {
                          setIsAddingNewCategory(false);
                        }
                      }}
                      autoFocus
                      placeholder="Type new category..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-blue-500/50 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      disabled={!newCategoryName.trim()}
                      className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryName("");
                      }}
                      className="p-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === "__ADD_NEW__") {
                        setIsAddingNewCategory(true);
                        setNewCategoryName("");
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {categoryList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__ADD_NEW__" className="text-blue-600 dark:text-sky-400 font-bold">
                      + Add New Category...
                    </option>
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Write a brief description about the service..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Recurring
                </label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="One Time">One Time</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Processing Time (SLA)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSla(!isCustomSla)}
                    className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>{isCustomSla ? "Select Preset" : "Custom SLA"}</span>
                  </button>
                </div>
                {isCustomSla ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 3 - 7 Days"
                      value={processingTime}
                      onChange={(e) => setProcessingTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Edit3 className="w-3.5 h-3.5 text-blue-500/70 absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={["Same Day (12-24 Hrs)", "1 - 2 Days", "3 - 7 Days", "7 - 15 Days", "15 - 30 Days"].includes(processingTime) ? processingTime : "__CUSTOM__"}
                      onChange={(e) => {
                        if (e.target.value === "__CUSTOM__") {
                          setIsCustomSla(true);
                        } else {
                          setProcessingTime(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="Same Day (12-24 Hrs)">Same Day (12-24 Hrs)</option>
                      <option value="1 - 2 Days">1 - 2 Days</option>
                      <option value="3 - 7 Days">3 - 7 Days</option>
                      <option value="7 - 15 Days">7 - 15 Days</option>
                      <option value="15 - 30 Days">15 - 30 Days</option>
                      <option value="__CUSTOM__">✎ Custom SLA (Type manually)...</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Base Government Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={governmentFee}
                  onChange={(e) => setGovernmentFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Base Professional Fee (₹) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 inline-flex items-center gap-1">
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Editable</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="1500"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 pr-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 font-bold"
                  />
                  <Edit3 className="w-3.5 h-3.5 text-blue-500/70 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Year-wise Fee Matrix Toggle & Rows */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center font-black">
                    <CalendarRange className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Year-wise Government & Professional Fees
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Configure 1-year, 2-year, 3-year, 5-year or custom validity slabs
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasYearFees}
                    onChange={(e) => {
                      setHasYearFees(e.target.checked);
                      if (e.target.checked && (!yearFees || yearFees.length === 0)) {
                        setYearFees([
                          { id: "yf-1", year: 1, label: "1 Year", governmentFee: Number(governmentFee) || 100, professionalFee: Number(price) || 1400 },
                          { id: "yf-2", year: 2, label: "2 Years", governmentFee: (Number(governmentFee) || 100) * 2, professionalFee: (Number(price) || 1400) + 900 },
                          { id: "yf-3", year: 3, label: "3 Years", governmentFee: (Number(governmentFee) || 100) * 3, professionalFee: (Number(price) || 1400) + 1800 },
                          { id: "yf-5", year: 5, label: "5 Years", governmentFee: (Number(governmentFee) || 100) * 5, professionalFee: (Number(price) || 1400) + 3100 },
                        ]);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {hasYearFees && (
                <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Configured Year Tiers ({yearFees.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddYearTier}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Year Tier</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {yearFees.map((tier, idx) => {
                      const total = (Number(tier.governmentFee) || 0) + (Number(tier.professionalFee) || 0);
                      return (
                        <div
                          key={tier.id}
                          className="grid grid-cols-12 gap-2 p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 items-center text-xs"
                        >
                          <div className="col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                              Tenure / Year
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={tier.year}
                                onChange={(e) => handleUpdateYearTier(tier.id, "year", e.target.value)}
                                className="w-12 px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center"
                              />
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                                {tier.year > 1 ? "Years" : "Year"}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                              Govt Fee (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tier.governmentFee}
                              onChange={(e) => handleUpdateYearTier(tier.id, "governmentFee", Number(e.target.value))}
                              placeholder="0"
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-200"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                              Prof Fee (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tier.professionalFee}
                              onChange={(e) => handleUpdateYearTier(tier.id, "professionalFee", Number(e.target.value))}
                              placeholder="1000"
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-blue-600 dark:text-sky-400"
                            />
                          </div>

                          <div className="col-span-2 text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Total</span>
                            <span className="font-black text-slate-900 dark:text-white font-mono text-[11px]">
                              ₹{total.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteYearTier(tier.id)}
                              disabled={yearFees.length <= 1}
                              title="Delete Tier"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Content / Detailed Information (Exact match with user reference screenshot) */}
          <div className="card-luxury p-6 space-y-4">
            <div
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 cursor-pointer select-none group"
            >
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">2</span>
                <span>Content / Detailed Information</span>
              </h3>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors cursor-pointer"
                title={isContentExpanded ? "Collapse Section" : "Expand Section"}
              >
                {isContentExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {isContentExpanded && (
              <div className="animate-in fade-in duration-200">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write detailed content about the service (process, eligibility, documents, benefits etc.)..."
                  minHeight="min-h-[180px]"
                />
              </div>
            )}
          </div>

          {/* Section 3: Key Features / Highlights */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">3</span>
                <span>Key Features / Highlights</span>
              </h3>
            </div>

            <div className="space-y-3">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...highlights];
                      updated[idx] = e.target.value;
                      setHighlights(updated);
                    }}
                    placeholder="Enter key feature or highlight..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                    className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setHighlights([...highlights, ""])}
              className="btn-primary-vibrant text-xs py-1.5 px-3.5 cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Feature</span>
            </button>
          </div>

          {/* Section 4: Service Steps / Process */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">4</span>
              <span>Service Steps / Workflow</span>
            </h3>

            <div className="space-y-3">
              {steps.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[idx] = e.target.value;
                      setSteps(updated);
                    }}
                    placeholder="Enter process step..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                    className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSteps([...steps, ""])}
              className="btn-primary-vibrant text-xs py-1.5 px-3.5 cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          {/* Section 5: Eligibility / Who Can Apply */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">5</span>
              <span>Eligibility & Requirements</span>
            </h3>

            <textarea
              rows={3}
              placeholder="Enter eligibility criteria, applicable entities, turnover thresholds etc..."
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Documents, Links, Video, Materials, FAQs */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 6: Documents */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">6</span>
                <span>Documents & Checklist</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingDocId(null);
                  setNewDocName("");
                  setNewDocType("Required");
                  setNewDocSampleUrl("");
                  setNewDocSampleName("");
                  setDocModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Document</span>
              </button>
            </div>

            {/* Add / Edit Document Modal / Drawer */}
            {docModalOpen && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                    <span>{editingDocId ? "Edit / Modify Client Document" : "Add Required Client Document"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDocModalOpen(false);
                      setEditingDocId(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Document Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electricity Bill / Rent Agreement"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Requirement Type
                    </label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="Required">Required (Mandatory)</option>
                      <option value="Optional">Optional</option>
                    </select>
                  </div>

                  {/* Sample / Specimen Image Upload for Seller / Franchise Dashboard */}
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span>Sample Specimen Image (For Seller / Partner Dashboard)</span>
                      </div>
                      {newDocSampleName && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewDocSampleUrl("");
                            setNewDocSampleName("");
                          }}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Upload an official sample/specimen image so franchise partners can show clients what format is acceptable.
                    </p>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-dashed border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800/80 cursor-pointer transition-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Upload className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{newDocSampleName || "Choose Specimen File (Image / PDF)..."}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewDocSampleName(file.name);
                              const reader = new FileReader();
                              reader.onload = () => {
                                setNewDocSampleUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {newDocSampleUrl && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img
                          src={newDocSampleUrl}
                          alt="Specimen preview"
                          className="w-10 h-10 object-cover rounded-md border"
                        />
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Specimen Ready
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setDocModalOpen(false);
                      setEditingDocId(null);
                    }}
                    className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!newDocName.trim()}
                    onClick={() => {
                      if (newDocName.trim()) {
                        if (editingDocId) {
                          setDocuments(documents.map((d) => 
                            d.id === editingDocId
                              ? {
                                  ...d,
                                  name: newDocName.trim(),
                                  type: newDocType,
                                  sampleImageUrl: newDocSampleUrl || undefined,
                                  sampleImageName: newDocSampleName || undefined,
                                }
                              : d
                          ));
                        } else {
                          setDocuments([
                            ...documents,
                            {
                              id: `doc-${Date.now()}`,
                              name: newDocName.trim(),
                              type: newDocType,
                              sampleImageUrl: newDocSampleUrl || undefined,
                              sampleImageName: newDocSampleName || undefined,
                            },
                          ]);
                        }
                        setNewDocName("");
                        setNewDocSampleUrl("");
                        setNewDocSampleName("");
                        setEditingDocId(null);
                        setDocModalOpen(false);
                      }
                    }}
                    className="btn-primary-vibrant text-xs py-1.5 px-4 cursor-pointer disabled:opacity-50"
                  >
                    {editingDocId ? "Update Document" : "Save Document"}
                  </button>
                </div>
              </div>
            )}

            {/* Documents Table with Edit & Delete Actions */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Document Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Sample Specimen</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No documents added yet. Click &quot;+ Add Document&quot; above.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc, idx) => (
                      <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                          {doc.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                              doc.type === "Required"
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {doc.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {doc.sampleImageUrl || doc.sampleImageName ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewSpecimenModal({
                                  name: doc.name,
                                  url: doc.sampleImageUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 font-bold text-[11px] cursor-pointer transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Specimen</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No specimen</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDocId(doc.id);
                                setNewDocName(doc.name);
                                setNewDocType(doc.type);
                                setNewDocSampleUrl(doc.sampleImageUrl || "");
                                setNewDocSampleName(doc.sampleImageName || "");
                                setDocModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                              title="Edit / Modify Document"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 7: Useful Links */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">7</span>
                <span>Official Government Links</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  setUsefulLinks([
                    ...usefulLinks,
                    { id: `link-${Date.now()}`, title: "Official Government Portal", url: "https://" },
                  ])
                }
                className="btn-primary-vibrant text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Link</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {usefulLinks.map((link, idx) => (
                <div key={link.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const updated = [...usefulLinks];
                          updated[idx].title = e.target.value;
                          setUsefulLinks(updated);
                        }}
                        placeholder="Portal Name (e.g. FoSCoS Government Portal)"
                        className="font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {link.url && link.url !== "https://" && (
                        <a
                          href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 cursor-pointer transition-colors"
                          title="Test / Open Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setUsefulLinks(usefulLinks.filter((l) => l.id !== link.id))}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...usefulLinks];
                        updated[idx].url = e.target.value;
                        setUsefulLinks(updated);
                      }}
                      placeholder="https://..."
                      className="w-full text-blue-600 dark:text-sky-400 bg-white dark:bg-slate-800 px-3 py-1.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                    />
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8: Training Video Link & Tutorials */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">8</span>
                <span>Training Video Link & Tutorials</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingVideoId(null);
                  setVideoModalTitle("");
                  setVideoModalUrl("https://youtube.com/watch?v=");
                  setVideoModalOpen(true);
                }}
                className="btn-primary-vibrant text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Video</span>
              </button>
            </div>

            {/* Add / Edit Video Modal */}
            {videoModalOpen && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                    <span>{editingVideoId ? "Edit / Modify Training Video" : "Add Training Video Tutorial"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoModalOpen(false);
                      setEditingVideoId(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FSSAI Official Filing Step-by-Step Tutorial"
                      value={videoModalTitle}
                      onChange={(e) => setVideoModalTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      YouTube / Video URL *
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoModalUrl}
                      onChange={(e) => setVideoModalUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoModalOpen(false);
                      setEditingVideoId(null);
                    }}
                    className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!videoModalUrl.trim()}
                    onClick={() => {
                      if (videoModalUrl.trim()) {
                        if (editingVideoId) {
                          setTrainingVideos(trainingVideos.map((v) => 
                            v.id === editingVideoId 
                              ? { ...v, title: videoModalTitle.trim() || "Training Tutorial Video", url: videoModalUrl.trim() }
                              : v
                          ));
                        } else {
                          const newVid = {
                            id: `vid-${Date.now()}`,
                            title: videoModalTitle.trim() || "Training Tutorial Video",
                            url: videoModalUrl.trim()
                          };
                          setTrainingVideos([...trainingVideos, newVid]);
                        }
                        setVideoLink(videoModalUrl.trim());
                        setVideoModalTitle("");
                        setVideoModalUrl("");
                        setEditingVideoId(null);
                        setVideoModalOpen(false);
                      }
                    }}
                    className="btn-primary-vibrant text-xs py-1.5 px-4 cursor-pointer disabled:opacity-50"
                  >
                    {editingVideoId ? "Update Video" : "Save Video"}
                  </button>
                </div>
              </div>
            )}

            {/* Video List */}
            <div className="space-y-2.5">
              {trainingVideos.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No training videos added yet. Click &quot;+ Add Video&quot; above.
                </div>
              ) : (
                trainingVideos.map((vid) => (
                  <div key={vid.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {vid.title}
                        </p>
                        <p className="font-mono text-[10px] text-blue-600 dark:text-sky-400 truncate">
                          {vid.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveVideoPreview(vid)}
                        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
                        title="Watch / Preview Video"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideoId(vid.id);
                          setVideoModalTitle(vid.title);
                          setVideoModalUrl(vid.url);
                          setVideoModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                        title="Edit / Modify Video"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = trainingVideos.filter((v) => v.id !== vid.id);
                          setTrainingVideos(updated);
                          setVideoLink(updated[0]?.url || "");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 9: Study Material */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">9</span>
                <span>Study Material & SOPs</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  setStudyMaterials([
                    ...studyMaterials,
                    { id: `mat-${Date.now()}`, title: "Standard Operating Procedure.pdf", fileUrl: "#" },
                  ])
                }
                className="btn-primary-vibrant text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add SOP</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {studyMaterials.map((mat, idx) => (
                <div key={mat.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <input
                      type="text"
                      value={mat.title}
                      onChange={(e) => {
                        const updated = [...studyMaterials];
                        updated[idx].title = e.target.value;
                        setStudyMaterials(updated);
                      }}
                      placeholder="Material Title / PDF"
                      className="font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none flex-1 pr-2"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newTitle = prompt("Edit SOP / Document Title:", mat.title);
                        if (newTitle && newTitle.trim()) {
                          const updated = [...studyMaterials];
                          updated[idx].title = newTitle.trim();
                          setStudyMaterials(updated);
                        }
                      }}
                      className="p-1.5 rounded-lg text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                      title="Edit / Modify SOP"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudyMaterials(studyMaterials.filter((m) => m.id !== mat.id))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                      title="Delete SOP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 10: FAQ */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">10</span>
                <span>Frequently Asked Questions</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  setFaqs([
                    ...faqs,
                    { id: `faq-${Date.now()}`, question: "", answer: "" },
                  ])
                }
                className="btn-primary-vibrant text-xs py-1.5 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-600 dark:text-sky-400">FAQ #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((f) => f.id !== faq.id))}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].question = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder="Enter question..."
                    className="w-full font-bold bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].answer = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder="Enter answer..."
                    className="w-full text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specimen Preview Modal */}
      {previewSpecimenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  Specimen: {previewSpecimenModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSpecimenModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center min-h-[240px] border border-dashed border-slate-300 dark:border-slate-700">
              {previewSpecimenModal.url ? (
                <img
                  src={previewSpecimenModal.url}
                  alt={previewSpecimenModal.name}
                  className="max-h-72 object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold">Standard Government Format Specimen</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              This specimen is displayed to franchises / partners on the Seller Dashboard to guide clients during document collection.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewSpecimenModal(null)}
                className="btn-glass-modern text-xs py-2 px-4 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {activeVideoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {activeVideoPreview.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoPreview(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
              {activeVideoPreview.url.includes("youtube.com") || activeVideoPreview.url.includes("youtu.be") ? (
                <iframe
                  src={
                    activeVideoPreview.url.includes("embed")
                      ? activeVideoPreview.url
                      : activeVideoPreview.url.includes("watch?v=")
                      ? activeVideoPreview.url.replace("watch?v=", "embed/")
                      : activeVideoPreview.url.replace("youtu.be/", "youtube.com/embed/")
                  }
                  title={activeVideoPreview.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="text-center p-6 text-white space-y-3">
                  <Video className="w-12 h-12 mx-auto text-blue-400" />
                  <p className="text-xs font-semibold">{activeVideoPreview.url}</p>
                  <a
                    href={activeVideoPreview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
                {activeVideoPreview.url}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideoPreview(null)}
                className="btn-glass-modern text-xs py-2 px-4 cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
