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
import { serviceCatalogService } from "@/lib/api/serviceCatalogService";
import { categoryService, ServiceCategoryItem } from "@/lib/api/categoryService";
import { CreateServicePayload, normalizeServiceCategory } from "@/types/api";
import { fetchLiveDbData } from "@/lib/crmStore";
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
  const [category, setCategory] = useState(initialData?.category ? normalizeServiceCategory(initialData.category) : "LICENSES");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    (initialData as any)?.categoryId ? Number((initialData as any).categoryId) : undefined
  );
  const [apiCategories, setApiCategories] = useState<ServiceCategoryItem[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Load categories from API (GET /api/admin/categories)
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      setIsCategoriesLoading(true);
      try {
        const res = await categoryService.getCategories();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (isMounted && list.length > 0) {
          setApiCategories(list);
          // If no selectedCategoryId, match by name or pick first
          if (!selectedCategoryId) {
            const currentNorm = normalizeServiceCategory(category);
            const matched = list.find((c) => normalizeServiceCategory(c.name) === currentNorm || c.name.toLowerCase() === category.toLowerCase());
            if (matched) {
              setSelectedCategoryId(matched.id);
              setCategory(normalizeServiceCategory(matched.name));
            } else if (list[0]) {
              setSelectedCategoryId(list[0].id);
              setCategory(normalizeServiceCategory(list[0].name));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live categories from API:", err);
      } finally {
        if (isMounted) setIsCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setIsCreatingCategory(true);
    try {
      const res = await categoryService.createCategory(trimmed);
      const created = res?.data;
      if (created && created.id) {
        setApiCategories((prev) => [...prev, created]);
        setSelectedCategoryId(created.id);
        setCategory(normalizeServiceCategory(created.name));
      } else {
        // Fallback local addition if api returns non-standard
        const fakeItem = { id: Date.now(), name: trimmed };
        setApiCategories((prev) => [...prev, fakeItem]);
        setSelectedCategoryId(fakeItem.id);
        setCategory(normalizeServiceCategory(trimmed));
      }
      setNewCategoryName("");
      setIsAddingNewCategory(false);
    } catch (err: any) {
      console.error("Error creating category:", err);
      alert(err?.message || "Unable to create category. Please try again.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const [description, setDescription] = useState(initialData?.description || "");
  const [recurring, setRecurring] = useState<"Yes" | "No">(initialData?.recurring || "No");
  const [frequency, setFrequency] = useState<"One Time" | "Monthly" | "Yearly" | "Quarterly">(initialData?.frequency || "One Time");
  const [processingTime, setProcessingTime] = useState(initialData?.processingTime || "3 - 7 Days");
  const [governmentFee, setGovernmentFee] = useState<number>(initialData?.governmentFee ?? 0);
  const [price, setPrice] = useState<number>(initialData?.price ?? 0);
  const [partnerProfit, setPartnerProfit] = useState<number>(initialData?.partnerProfit ?? 0);
  const [status, setStatus] = useState<"Active" | "Inactive" | "Draft">(initialData?.status || "Active");
  const [content, setContent] = useState(initialData?.content || "");
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const [eligibility, setEligibility] = useState(initialData?.eligibility || "");

  // Year-wise Statutory & Professional Fee breakdown (e.g. 1 Year to 5+ Years)
  const [hasYearFees, setHasYearFees] = useState<boolean>(initialData?.hasYearFees || false);
  const [yearFees, setYearFees] = useState<ServiceYearFee[]>(
    initialData?.yearFees && initialData.yearFees.length > 0
      ? initialData.yearFees
      : []
  );

  const handleAddYearTier = () => {
    const nextYear = yearFees.length > 0 ? Math.max(...yearFees.map((y) => y.year)) + 1 : 1;
    const newTier: ServiceYearFee = {
      id: `yf-${Date.now()}`,
      year: nextYear,
      label: `${nextYear} Year${nextYear > 1 ? "s" : ""}`,
      governmentFee: 0,
      professionalFee: 0,
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

  // Dynamic Lists - Clean by default for New Services
  const [highlights, setHighlights] = useState<string[]>(
    initialData?.highlights || []
  );

  const [steps, setSteps] = useState<string[]>(
    initialData?.steps || []
  );

  const [documents, setDocuments] = useState<ServiceDocument[]>(
    initialData?.documents || []
  );

  const [usefulLinks, setUsefulLinks] = useState<ServiceLink[]>(
    initialData?.usefulLinks || []
  );

  const [videoLink, setVideoLink] = useState(initialData?.videoLink || "");
  const [trainingVideos, setTrainingVideos] = useState<Array<{ id: string; title: string; url: string }>>(() => {
    if (initialData?.videoLink) {
      return [{ id: "vid-1", title: "Official Step-by-Step Filing Tutorial", url: initialData.videoLink }];
    }
    return [];
  });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoModalTitle, setVideoModalTitle] = useState("");
  const [videoModalUrl, setVideoModalUrl] = useState("");
  const [activeVideoPreview, setActiveVideoPreview] = useState<{ title: string; url: string } | null>(null);

  const [isCustomSla, setIsCustomSla] = useState(false);

  const [studyMaterials, setStudyMaterials] = useState<ServiceMaterial[]>(
    initialData?.studyMaterials || []
  );

  const [faqs, setFaqs] = useState<ServiceFaq[]>(
    initialData?.faqs || []
  );

  // Document modal state (Add / Edit)
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
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

      const docNames = documents.map((d) => d.name).filter(Boolean);
      const cleanHighlights = highlights.filter((h) => h.trim() !== "");
      const cleanSteps = steps.filter((s) => s.trim() !== "");
      const cleanGovLinks = usefulLinks.map((l) => l.url.trim()).filter(Boolean);
      const cleanTrainingVideos = trainingVideos.map((v) => v.url.trim()).filter(Boolean);
      // Backend MySQL study_materials table maps material_link to VARCHAR.
      // Strip giant base64 strings so SQL statement data truncation error does not occur;
      // Full document/base64 details are preserved safely in sopsJson.
      const cleanMaterials = studyMaterials
        .map((m) => m.fileUrl.trim())
        .filter((url) => Boolean(url) && !url.startsWith("data:") && url.length < 500);
      const formattedFaqs = faqs
        .filter((f) => f.question.trim() !== "")
        .map((f) => `${f.question.trim()} ${f.answer.trim()}`.trim());

      const formattedYearFees = hasYearFees
        ? yearFees.map((yf) => ({
            year: String(yf.year || "1"),
            governmentFee: String(yf.governmentFee ?? 0),
            professionalFee: String(yf.professionalFee ?? 0),
            total: String((Number(yf.governmentFee) || 0) + (Number(yf.professionalFee) || 0)),
          }))
        : [];

      // JSON strings for backend storage
      const sopsJsonPayload = studyMaterials.length > 0 ? JSON.stringify(studyMaterials) : null;
      const faqsJsonPayload = faqs.length > 0 ? JSON.stringify(faqs) : null;
      const pricingTiersJsonPayload = hasYearFees && yearFees.length > 0 ? JSON.stringify(formattedYearFees) : null;

      // Backend ServiceFrequency Enum accepts: [QUARTERLY, YEARLY, MONTHLY]
      // When recurring is "NO" or frequency is "One Time", frequency must be null
      const backendFrequency =
        recurring === "Yes"
          ? frequency === "Monthly"
            ? "MONTHLY"
            : frequency === "Quarterly"
            ? "QUARTERLY"
            : frequency === "Yearly"
            ? "YEARLY"
            : null
          : null;

      const apiPayload: CreateServicePayload = {
        name: name.trim(),
        category: normalizeServiceCategory(category),
        categoryId: selectedCategoryId,
        subtitle: description.trim(),
        badges: ["Popular"],
        startingClientPrice: Number(price) || 0,
        partnerProfit: Number(partnerProfit) || 0,
        processingTime: processingTime || "3 - 7 Days",
        overviewHtml: content || `<p>${description || name}</p>`,
        eligibilityCriteria: eligibility || "",
        keyFeatures: cleanHighlights,
        workflowSteps: cleanSteps,
        requiredDocuments: docNames,
        officialGovernmentPortalLinks: cleanGovLinks,
        trainingVideoTutorials: cleanTrainingVideos.length > 0 ? cleanTrainingVideos : (videoLink ? [videoLink] : []),
        studyMaterials: cleanMaterials,
        faqs: formattedFaqs,
        contentDetails: content || "",
        yearWiseFeesEnabled: Boolean(hasYearFees),
        yearWiseFees: formattedYearFees,
        sopsJson: sopsJsonPayload,
        faqsJson: faqsJsonPayload,
        pricingTiersJson: pricingTiersJsonPayload,
        recurring: recurring === "Yes" ? "YES" : "NO",
        frequency: backendFrequency,
        baseGovernmentFee: String(governmentFee || 0),
      };

      if (isEditMode && initialData?.id) {
        const numId = typeof initialData.id === "number" ? initialData.id : parseInt(String(initialData.id).replace(/\D/g, ""), 10);
        if (numId) {
          await serviceCatalogService.updateService(numId, apiPayload).catch(err => {
            console.warn("API update service warning:", err);
          });
        }
      } else {
        const apiRes = await serviceCatalogService.createService(apiPayload);
        if (apiRes && apiRes.data?.id) {
          payload.id = String(apiRes.data.id);
        }
      }

      await serviceCatalog.save(payload).catch(() => {});
      await fetchLiveDbData().catch(() => {});

      router.push("/dashboard/services");
    } catch (err: any) {
      console.error("Save service error:", err);
      setErrorMsg(err.message || "Unable to save service changes. Please try again.");
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

      {/* Section 1: Basic Service Information (Full Width Top Card) */}
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
                      Add New
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
                      disabled={!newCategoryName.trim() || isCreatingCategory}
                      className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isCreatingCategory ? "Saving..." : "Add"}
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
                    value={selectedCategoryId ?? category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__ADD_NEW__") {
                        setIsAddingNewCategory(true);
                        setNewCategoryName("");
                      } else {
                        const numId = Number(val);
                        if (!isNaN(numId)) {
                          setSelectedCategoryId(numId);
                          const matched = apiCategories.find((c) => c.id === numId);
                          if (matched) {
                            setCategory(normalizeServiceCategory(matched.name));
                          }
                        } else {
                          setCategory(normalizeServiceCategory(val));
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {apiCategories.length > 0 ? (
                      apiCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      [
                        { value: "LICENSES", label: "Licenses & Permits (LICENSES)" },
                        { value: "FOOD_BEVERAGE", label: "Food & Beverage / FSSAI (FOOD_BEVERAGE)" },
                        { value: "LEGAL_IP", label: "Legal & IP (LEGAL_IP)" },
                        { value: "TAXATION", label: "Taxation & Accounting (TAXATION)" },
                        { value: "COMPANY_REG", label: "Company Registration (COMPANY_REG)" },
                      ].map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))
                    )}
                    <option value="__ADD_NEW__" className="text-blue-600 dark:text-sky-400 font-bold">
                      Add New Category...
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
                    Client Price (₹) <span className="text-rose-500">*</span>
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
                    placeholder="0"
                    value={price === 0 ? "" : price}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value) || 0;
                      setPrice(newPrice);
                      setPartnerProfit(Math.round(newPrice * 0.15));
                    }}
                    className="w-full px-3.5 py-2.5 pr-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-200 font-bold"
                  />
                  <Edit3 className="w-3.5 h-3.5 text-blue-500/70 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Partner Profit (₹) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>15% Default</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={partnerProfit === 0 ? "" : partnerProfit}
                    onChange={(e) => setPartnerProfit(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 pr-8 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700/80 rounded-xl text-sm text-emerald-900 dark:text-emerald-300 font-bold"
                  />
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500/70 absolute right-2.5 top-3 pointer-events-none" />
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
                          {
                            id: `yf-${Date.now()}`,
                            year: 1,
                            label: "1 Year",
                            governmentFee: 0,
                            professionalFee: 0,
                          },
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
                      <span>Add Year Tier</span>
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

      {/* Balanced 2-Column Grid: Left (Sections 2 to 5) & Right (Sections 6 to 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Section 2 (Content), Section 3 (Highlights), Section 4 (Steps), Section 5 (Eligibility) */}
        {/* =================================================================== */}
        <div className="space-y-6">
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
        <div className="space-y-6">
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
                  setDocModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Document</span>
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
                            },
                          ]);
                        }
                        setNewDocName("");
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
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        No documents added yet. Click &quot;Add Document&quot; above.
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
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDocId(doc.id);
                                setNewDocName(doc.name);
                                setNewDocType(doc.type);
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
                <span>Add Link</span>
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
                <span>Add Video</span>
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
                  No training videos added yet. Click &quot;Add Video&quot; above.
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
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">9</span>
                  <span>Study Material &amp; SOPs</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Attach official guidelines, PDF materials, or standard operating procedure documents.
                </p>
              </div>

              <label className="btn-primary-vibrant text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Attach PDF / SOP</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64Url = reader.result as string;
                        setStudyMaterials([
                          ...studyMaterials,
                          {
                            id: `mat-${Date.now()}`,
                            title: file.name,
                            fileUrl: base64Url,
                          },
                        ]);
                      };
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>

            <div className="space-y-2.5">
              {studyMaterials.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No PDF/SOP materials attached yet. Click &quot;Attach PDF / SOP&quot; above to upload document files.
                </div>
              ) : (
                studyMaterials.map((mat, idx) => (
                  <div key={mat.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={mat.title}
                          onChange={(e) => {
                            const updated = [...studyMaterials];
                            updated[idx].title = e.target.value;
                            setStudyMaterials(updated);
                          }}
                          placeholder="Document Title (e.g. FSSAI_Guidelines.pdf)"
                          className="font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none w-full truncate"
                        />
                        <p className="text-[10px] text-slate-400 truncate">
                          {mat.fileUrl?.startsWith("data:application/pdf") ? "PDF Document Attached" : mat.fileUrl || "No URL"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {mat.fileUrl && mat.fileUrl !== "#" && (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={mat.title || "document.pdf"}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
                          title="View / Download Attached PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <label
                        className="p-1.5 rounded-lg text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                        title="Replace PDF File"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const base64Url = reader.result as string;
                                const updated = [...studyMaterials];
                                updated[idx].title = file.name;
                                updated[idx].fileUrl = base64Url;
                                setStudyMaterials(updated);
                              };
                              reader.readAsDataURL(file);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>

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
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Rename Title"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyMaterials(studyMaterials.filter((m) => m.id !== mat.id))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
