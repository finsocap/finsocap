"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Plus, Trash2, Edit3, Link as LinkIcon, 
  Video, BookOpen, HelpCircle, FileText, CheckCircle2,
  ChevronDown, ChevronUp, AlertCircle, Sparkles, ExternalLink, X
} from "lucide-react";
import { ServiceItem, ServiceDocument, ServiceLink, ServiceMaterial, ServiceFaq } from "@/types";
import { serviceCatalog } from "@/lib/services/serviceCatalog";
import { useTheme } from "@/components/Providers/ThemeProvider";

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
  const [eligibility, setEligibility] = useState(initialData?.eligibility || "");

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
      { id: "doc-1", name: "Aadhaar Card / Voter ID", type: "Required" },
      { id: "doc-2", name: "Electricity Bill / Shop Agreement", type: "Required" },
      { id: "doc-3", name: "Cancelled Cheque / Bank Passbook", type: "Optional" },
    ]
  );

  const [usefulLinks, setUsefulLinks] = useState<ServiceLink[]>(
    initialData?.usefulLinks || [
      { id: "link-1", title: "Official Government Portal", url: "https://example.gov.in" },
    ]
  );

  const [videoLink, setVideoLink] = useState(initialData?.videoLink || "https://youtube.com/watch?v=sample");

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

  // Document modal state
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"Required" | "Optional">("Required");

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
        status,
        content,
        eligibility,
        highlights: highlights.filter((h) => h.trim() !== ""),
        steps: steps.filter((s) => s.trim() !== ""),
        documents,
        usefulLinks: usefulLinks.filter((l) => l.title.trim() !== ""),
        videoLink,
        studyMaterials: studyMaterials.filter((m) => m.title.trim() !== ""),
        faqs: faqs.filter((f) => f.question.trim() !== ""),
      };

      await serviceCatalog.save(payload);
      router.push("/dashboard/services");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save service");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7 pb-20">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800/80 relative overflow-hidden">
        {/* Ambient glow light */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1.5">
            <Link href="/dashboard/services" className="hover:text-amber-400 transition-colors">
              Products / Services
            </Link>
            <span>&rsaquo;</span>
            <span className="text-amber-400 font-bold">
              {isEditMode ? "Edit Service" : "Add New Service"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            {isEditMode ? `Edit: ${name || "Service"}` : "Create New Catalog Service"}
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {category}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Configure retail pricing, statutory government fees, required client documents, and processing SLA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/dashboard/services"
            className="btn-glass-modern text-xs py-2 px-4 cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-gold-vibrant text-xs py-2.5 px-6 shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Service..." : "Save Service"}</span>
          </button>
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
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">1</span>
                <span>Basic Service Information</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FSSAI Registration"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-xs"
                />
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
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
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
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      disabled={!newCategoryName.trim()}
                      className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                  >
                    {categoryList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__ADD_NEW__" className="text-amber-600 font-bold">
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
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Processing Time (SLA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 - 7 Days"
                  value={processingTime}
                  onChange={(e) => setProcessingTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Government Fee (₹)
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Professional / Service Fee (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="1500"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Content / Detailed Information */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">2</span>
              <span>Content / Detailed Information</span>
            </h3>

            <textarea
              rows={4}
              placeholder="Write detailed content about the service (process, eligibility, documents, benefits etc.)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

          {/* Section 3: Key Features / Highlights */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">3</span>
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
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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
              className="btn-gold-vibrant text-xs py-1.5 px-3.5 cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Feature</span>
            </button>
          </div>

          {/* Section 4: Service Steps / Process */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">4</span>
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
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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
              className="btn-gold-vibrant text-xs py-1.5 px-3.5 cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          {/* Section 5: Eligibility / Who Can Apply */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">5</span>
              <span>Eligibility & Requirements</span>
            </h3>

            <textarea
              rows={3}
              placeholder="Enter eligibility criteria, applicable entities, turnover thresholds etc..."
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-xs"
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
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">6</span>
                <span>Required Documents</span>
              </h3>
              <button
                type="button"
                onClick={() => setDocModalOpen(true)}
                className="btn-gold-vibrant text-xs py-1.5 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doc</span>
              </button>
            </div>

            {/* Document Modal */}
            {docModalOpen && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <input
                  type="text"
                  placeholder="Document Name (e.g. Electricity Bill)"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="Required">Required</option>
                    <option value="Optional">Optional</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (newDocName.trim()) {
                        setDocuments([
                          ...documents,
                          { id: `doc-${Date.now()}`, name: newDocName.trim(), type: newDocType },
                        ]);
                        setNewDocName("");
                        setDocModalOpen(false);
                      }
                    }}
                    className="btn-gold-vibrant text-xs py-1.5 px-3"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocModalOpen(false)}
                    className="px-2 py-1 text-slate-500 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center font-medium">No documents added yet.</p>
              ) : (
                documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400">{idx + 1}.</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                          doc.type === "Required"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {doc.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                        className="w-7 h-7 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 7: Useful Links */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">7</span>
                <span>Official Government Links</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  setUsefulLinks([
                    ...usefulLinks,
                    { id: `link-${Date.now()}`, title: "Portal Link", url: "https://" },
                  ])
                }
                className="btn-gold-vibrant text-xs py-1.5 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {usefulLinks.map((link, idx) => (
                <div key={link.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const updated = [...usefulLinks];
                        updated[idx].title = e.target.value;
                        setUsefulLinks(updated);
                      }}
                      placeholder="Portal Name (e.g. FoSCoS Government Portal)"
                      className="font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setUsefulLinks(usefulLinks.filter((l) => l.id !== link.id))}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...usefulLinks];
                      updated[idx].url = e.target.value;
                      setUsefulLinks(updated);
                    }}
                    placeholder="https://..."
                    className="w-full text-blue-600 dark:text-sky-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 8: Video Link */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">8</span>
              <span>Training Video Link</span>
            </h3>
            <input
              type="url"
              placeholder="e.g. https://youtube.com/watch?v=..."
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Section 9: Study Material */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">9</span>
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
                className="btn-gold-vibrant text-xs py-1.5 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add SOP</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {studyMaterials.map((mat, idx) => (
                <div key={mat.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
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
                  <button
                    type="button"
                    onClick={() => setStudyMaterials(studyMaterials.filter((m) => m.id !== mat.id))}
                    className="w-7 h-7 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 10: FAQ */}
          <div className="card-luxury p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">10</span>
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
                className="btn-gold-vibrant text-xs py-1.5 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-500">FAQ #{idx + 1}</span>
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
    </form>
  );
}
