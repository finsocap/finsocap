"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Boxes, Plus, Search, Filter, RotateCcw, Edit2, Eye, 
  Trash2, Clock, CheckCircle2, AlertCircle, X, Sparkles,
  IndianRupee, Layers, Check, PowerOff, AlertTriangle, Loader2, ArrowRight
} from "lucide-react";
import { ServiceModel } from "@/lib/crmStore";
import { serviceCatalogService } from "@/lib/api/serviceCatalogService";
import { normalizeServiceCategory } from "@/types/api";
import ServicesInfographic from "@/components/Charts/ServicesInfographic";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import PageBanner from "@/components/Dashboard/PageBanner";
import { useToast } from "@/components/Global/ToastNotification";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";

const DEFAULT_CATEGORIES = [
  "Food & Beverage",
  "Taxation",
  "Business Compliance",
  "Intellectual Property",
  "Import Export",
  "Digital Services",
  "Business Growth",
];

export default function ServicesPage() {
  const toast = useToast();

  // ONLY API FETCH DYNAMIC DATA - NO STATIC DATA
  const [apiServices, setApiServices] = useState<ServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("ADMIN");

  useEffect(() => {
    try {
      const sess = localStorage.getItem("finsocap_user_session");
      if (sess) {
        const p = JSON.parse(sess);
        if (p?.user?.role) {
          setUserRole(p.user.role);
        }
      }
    } catch (e) {}
  }, []);

  const fetchServicesFromApi = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await serviceCatalogService.getServices();
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? (res as any) : [];

      if (rawList && rawList.length > 0) {
        const mapped: ServiceModel[] = rawList.map((item: any) => {
          const isRecurring = item.recurring === "YES" || item.recurring === true;
          const freqRaw = String(item.frequency || "").toUpperCase();
          const frequency =
            freqRaw === "MONTHLY"
              ? "Monthly"
              : freqRaw === "YEARLY"
              ? "Yearly"
              : freqRaw === "QUARTERLY"
              ? "Quarterly"
              : "One Time";

          return {
            id: item.id,
            name: item.name || "Untitled Service",
            category: (item.category || "General").replace(/_/g, " "),
            recurring: isRecurring,
            frequency: frequency,
            price: Number(item.startingClientPrice || item.price || 0),
            partnerProfit: Number(item.partnerProfit || 0),
            gov: Number(item.baseGovernmentFee || item.governmentFee || 0),
            time: item.processingTime || (item.estimatedTurnaroundDays ? `${item.estimatedTurnaroundDays} Days` : "3 - 5 Days"),
            status: item.active !== false && item.status !== "Inactive" ? "Active" : "Inactive",
            description: item.subtitle || item.description || "",
            requiredDocuments: Array.isArray(item.requiredDocuments) ? item.requiredDocuments : [],
            keyFeatures: Array.isArray(item.keyFeatures) ? item.keyFeatures : [],
            workflowSteps: Array.isArray(item.workflowSteps) ? item.workflowSteps : [],
            officialGovernmentPortalLinks: Array.isArray(item.officialGovernmentPortalLinks) ? item.officialGovernmentPortalLinks : [],
            trainingVideoTutorials: Array.isArray(item.trainingVideoTutorials) ? item.trainingVideoTutorials : [],
            studyMaterials: Array.isArray(item.studyMaterials) ? item.studyMaterials : [],
            faqs: Array.isArray(item.faqs) ? item.faqs : [],
            contentDetails: item.contentDetails || item.overviewHtml || "",
            yearWiseFeesEnabled: Boolean(item.yearWiseFeesEnabled),
            yearWiseFees: Array.isArray(item.yearWiseFees) ? item.yearWiseFees : [],
            baseGovernmentFee: item.baseGovernmentFee || 0,
          };
        });
        setApiServices(mapped);
      } else {
        setApiServices([]);
      }
    } catch (err: any) {
      console.error("Failed to load services:", err);
      setError("Unable to load services at this time. Please refresh the page or try logging in again.");
      setApiServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchServicesFromApi();
    return () => {
      mounted = false;
    };
  }, [fetchServicesFromApi]);

  const [categoryList, setCategoryList] = useState<string[]>([]);

  useEffect(() => {
    if (apiServices.length > 0) {
      const fromServices = Array.from(new Set(apiServices.map((s) => s.category).filter(Boolean)));
      setCategoryList(fromServices);
    } else {
      setCategoryList([]);
    }
  }, [apiServices]);

  const [activeTab, setActiveTab] = useState<"All Services" | "Active" | "Inactive" | "Draft" | "Popular" | "Recently Added">("All Services");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categoryList.includes(trimmed)) {
      setCategoryList((prev) => [...prev, trimmed]);
    }
    setFormCategory(trimmed);
    setNewCategoryName("");
    setIsAddingNewCategory(false);
    showToast(`Category "${trimmed}" added!`);
  };

  // Modals & Popups
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [viewingService, setViewingService] = useState<ServiceModel | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);
  const [deleteConfirmService, setDeleteConfirmService] = useState<ServiceModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Food & Beverage");
  const [formRecurring, setFormRecurring] = useState(false);
  const [formFrequency, setFormFrequency] = useState("One Time");
  const [formPrice, setFormPrice] = useState<number>(1000);
  const [formGov, setFormGov] = useState<number>(0);
  const [formTime, setFormTime] = useState("3 - 7 Days");
  const [formDesc, setFormDesc] = useState("");

  // Year-wise fee state for modal
  const [formHasYearFees, setFormHasYearFees] = useState(false);
  const [formYearFees, setFormYearFees] = useState<Array<{ id: string; year: number; label: string; gov: number; price: number }>>([]);

  // Standard Documents state for modal
  const [formDocs, setFormDocs] = useState<Array<{ id: string; name: string; type: "Mandatory" | "Optional" }>>([]);
  const [newModalDocName, setNewModalDocName] = useState("");
  const [newModalDocType, setNewModalDocType] = useState<"Mandatory" | "Optional">("Mandatory");

  const handleAddModalYearTier = () => {
    const nextYear = formYearFees.length > 0 ? Math.max(...formYearFees.map((y) => y.year)) + 1 : 1;
    setFormYearFees([
      ...formYearFees,
      {
        id: `yf-${Date.now()}`,
        year: nextYear,
        label: `${nextYear} Year${nextYear > 1 ? "s" : ""}`,
        gov: 100 * nextYear,
        price: 1000 + 500 * (nextYear - 1),
      },
    ]);
  };

  const handleAddModalDoc = () => {
    if (!newModalDocName.trim()) return;
    setFormDocs([
      ...formDocs,
      {
        id: `doc-${Date.now()}`,
        name: newModalDocName.trim(),
        type: newModalDocType,
      },
    ]);
    setNewModalDocName("");
  };

  const showToast = (msg: string) => {
    toast.success(msg, "Success!");
  };

  const openAddModal = () => {
    setEditingServiceId(null);
    setFormName("");
    setFormCategory(categoryList[0] || "Food & Beverage");
    setIsAddingNewCategory(false);
    setNewCategoryName("");
    setFormRecurring(false);
    setFormFrequency("One Time");
    setFormPrice(1000);
    setFormGov(0);
    setFormTime("3 - 7 Days");
    setFormDesc("");
    setFormHasYearFees(false);
    setFormYearFees([]);
    setFormDocs([]);
    setNewModalDocName("");
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (service: ServiceModel) => {
    setEditingServiceId(service.id);
    setFormName(service.name);
    setFormCategory(service.category);
    setIsAddingNewCategory(false);
    setNewCategoryName("");
    if (service.category && !categoryList.includes(service.category)) {
      setCategoryList((prev) => [...prev, service.category]);
    }
    setFormRecurring(service.recurring);
    setFormFrequency(service.frequency);
    setFormPrice(service.price);
    setFormGov(service.gov);
    setFormTime(service.time);
    setFormDesc(service.description || "");
    setIsAddEditModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingServiceId) {
        await serviceCatalogService.updateService(editingServiceId, {
          name: formName.trim(),
          category: normalizeServiceCategory(formCategory),
          startingClientPrice: Number(formPrice),
          subtitle: formDesc,
        });
        showToast(`"${formName}" updated successfully.`);
      } else {
        await serviceCatalogService.createService({
          name: formName.trim(),
          category: normalizeServiceCategory(formCategory),
          subtitle: formDesc,
          startingClientPrice: Number(formPrice),
          partnerCommission: Math.round(Number(formPrice) * 0.3),
          estimatedTurnaroundDays: Number(String(formTime).replace(/\D/g, "")) || 5,
          badges: ["Standard", "Verified"],
          requiredDocs: ["PAN Card", "Identity Proof", "Business Address"],
        });
        showToast(`Service "${formName}" created.`);
      }
      setIsAddEditModalOpen(false);
      await fetchServicesFromApi();
    } catch (err: any) {
      console.error("Save service error:", err);
      showToast(err?.message || "Unable to save service changes. Please try again.");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await serviceCatalogService.toggleActive(id);
      showToast("Service status updated successfully.");
      await fetchServicesFromApi();
    } catch (err: any) {
      console.warn("Toggle active error:", err);
      setApiServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s))
      );
    }
  };

  const handleDeleteService = async (id: number) => {
    setIsDeleting(true);
    setDeleteErrorMsg(null);
    try {
      await serviceCatalogService.deleteService(id);
      showToast("Service deleted successfully.");
      // Optimistically update list immediately
      setApiServices((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmService(null);
      await fetchServicesFromApi();
    } catch (err: any) {
      console.warn("Delete service blocked by backend constraint:", err);
      let rawMsg =
        err?.data?.message ||
        err?.message ||
        "";

      let cleanMsg = "This service cannot be deleted because it is linked to active tasks, application forms, or assigned staff in the system.";

      if (rawMsg.includes("service_form_versions") || rawMsg.includes("foreign key constraint")) {
        cleanMsg = "Cannot delete this service because published application forms, statutory documents, or active tasks are linked to it in the system database.";
      } else if (rawMsg) {
        cleanMsg = rawMsg;
      }

      setDeleteErrorMsg(cleanMsg);
      toast.error(cleanMsg, "Cannot Delete Service");
    } finally {
      setIsDeleting(false);
    }
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: apiServices.length,
      active: apiServices.filter((s) => s.status === "Active").length,
      inactive: apiServices.filter((s) => s.status === "Inactive").length,
      draft: apiServices.filter((s) => s.status === "Draft").length,
      popular: apiServices.filter((s) => s.id <= 3).length,
      recent: apiServices.filter((s) => s.id > 9).length,
    };
  }, [apiServices]);

  // Filtered rows
  const filteredServices = useMemo(() => {
    return apiServices.filter((s) => {
      // Tab filter
      if (activeTab === "Active" && s.status !== "Active") return false;
      if (activeTab === "Inactive" && s.status !== "Inactive") return false;
      if (activeTab === "Draft" && s.status !== "Draft") return false;
      if (activeTab === "Popular" && s.id > 3) return false;
      if (activeTab === "Recently Added" && s.id <= 9) return false;

      // Category
      if (selectedCategory !== "ALL" && s.category !== selectedCategory) return false;

      // Status
      if (selectedStatus !== "ALL" && s.status !== selectedStatus) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [apiServices, activeTab, selectedCategory, selectedStatus, search]);

  const money = (val: number) => "₹" + Number(val || 0).toLocaleString("en-IN");

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Food & Beverage":
        return "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      case "Taxation":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "Intellectual Property":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Business Compliance":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Import Export":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "Digital Services":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      default:
        return "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Executive Branded Command Banner (Signature Finsocap Glassmorphic Gradient) */}
      <PageBanner
        icon={Boxes}
        badge="Finsocap Service Hub"
        badgeMeta="Taxation, FSSAI & Corporate Compliance"
        title="Products / Services"
        description="Manage your corporate services, categories, pricing, statutory documents and lifecycle status."
        bottomMeta={`${apiServices.length} Total Services • Verified Catalog`}
        actions={
          userRole !== "STAFF" ? (
            <Link
              href="/dashboard/services/new"
              className="btn-primary-vibrant text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </Link>
          ) : undefined
        }
      />

      {/* Services Rate Card & Category Breakdown Infographic */}
      <ServicesInfographic services={apiServices} />

      {/* 2. Modern Pill Tabs Switcher matching Reference */}
      <div className="p-1.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { key: "All Services", count: tabCounts.all },
          { key: "Active", count: tabCounts.active },
          { key: "Inactive", count: tabCounts.inactive },
          { key: "Draft", count: tabCounts.draft },
          { key: "Popular", count: tabCounts.popular },
          { key: "Recently Added", count: tabCounts.recent },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.key}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-black ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-3 sm:p-3.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 w-full sm:col-span-2 lg:col-span-1">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search service name, category or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="w-full lg:w-52">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categoryList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {(search || selectedCategory !== "ALL" || selectedStatus !== "ALL" || activeTab !== "All Services") && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
              setActiveTab("All Services");
            }}
            className="btn-glass-modern text-xs py-2 px-3.5 cursor-pointer whitespace-nowrap flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Loading & Error / Auth Token Status */}
      {error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href="/dashboard/login"
              className="px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer text-[11px] inline-flex items-center"
            >
              Go to Login
            </Link>
            <button
              onClick={() => fetchServicesFromApi()}
              className="px-3 py-1.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer text-[11px]"
            >
              Retry Fetch
            </button>
          </div>
        </div>
      ) : null}

      {/* 4. Services Table matching Reference */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                <th className="py-3.5 px-4 w-10 text-center">#</th>
                <th className="py-3.5 px-4">Service Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Recurring</th>
                <th className="py-3.5 px-4">Frequency</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4">Government Fee</th>
                <th className="py-3.5 px-4">Processing Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="font-semibold text-xs">Loading services...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                          No Services Found
                        </span>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          There are currently no services in this view. Click "Add New Service" to create a service.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={openAddModal}
                        className={`mt-2 btn-primary-vibrant text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-blue-500/20 ${userRole === "STAFF" ? "hidden" : ""}`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Service</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {i + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] border ${getCategoryColor(s.category)}`}>
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        s.recurring
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {s.recurring ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                      {s.frequency}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {money(s.price)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                      {money(s.gov)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {s.time}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        s.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {userRole !== "STAFF" && (
                          <Link
                            href={`/dashboard/services/${s.id}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Edit
                          </Link>
                        )}
                        <button
                          onClick={() => setViewingService(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        
                        {/* Delete Service Action - Admin Only */}
                        {userRole !== "STAFF" && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteErrorMsg(null);
                              setDeleteConfirmService(s);
                            }}
                            title="Delete Service"
                            className="w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{filteredServices.length} services loaded</span>
        </div>
      </div>

      {/* Modal: Add / Edit Service */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative my-8 space-y-4">
            <ModalHeaderBanner
              icon={Boxes}
              badge="CATALOG OPERATIONS"
              title={editingServiceId ? "Edit Service" : "Add New Service"}
              description="Configure service metadata, professional pricing, statutory government fees and SLA."
              badgeTag="Catalog"
              onClose={() => setIsAddEditModalOpen(false)}
            />

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl text-xs font-bold text-blue-900 dark:text-sky-300">
                1. Service Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. FSSAI Registration"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Category *
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
                        placeholder="Type new category name..."
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-400 dark:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                      value={formCategory}
                      onChange={(e) => {
                        if (e.target.value === "__ADD_NEW__") {
                          setIsAddingNewCategory(true);
                          setNewCategoryName("");
                        } else {
                          setFormCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      {categoryList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__ADD_NEW__" className="text-blue-600 font-bold">
                        Add New Category...
                      </option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Briefly describe this service, compliance needs, or coverage"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recurring
                  </label>
                  <select
                    value={formRecurring ? "true" : "false"}
                    onChange={(e) => setFormRecurring(e.target.value === "true")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="false">No (One Time)</option>
                    <option value="true">Yes (Recurring)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option>One Time</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Processing SLA
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. 1 - 3 Days"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Government Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formGov}
                    onChange={(e) => setFormGov(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Professional / Service Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Year-wise Fee Matrix Option (Screenshot 2 Requirement) */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-200/80 dark:border-blue-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Year-wise Fee Breakdown (1 to 5+ Years)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Add custom statutory govt fee & professional charges for 1, 2, 3, 5 years
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formHasYearFees}
                      onChange={(e) => setFormHasYearFees(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formHasYearFees && (
                  <div className="space-y-2 pt-1 border-t border-blue-200/60 dark:border-blue-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Tenure Fee Slabs ({formYearFees.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddModalYearTier}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Add Year Tier
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {formYearFees.map((tier) => (
                        <div
                          key={tier.id}
                          className="grid grid-cols-12 gap-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 items-center text-xs"
                        >
                          <div className="col-span-3">
                            <span className="text-[10px] text-slate-400 block font-bold">Year</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{tier.label}</span>
                          </div>
                          <div className="col-span-3">
                            <span className="text-[10px] text-slate-400 block font-bold">Govt Fee</span>
                            <input
                              type="number"
                              min="0"
                              value={tier.gov}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFormYearFees(formYearFees.map((y) => (y.id === tier.id ? { ...y, gov: val } : y)));
                              }}
                              className="w-full px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                            />
                          </div>
                          <div className="col-span-3">
                            <span className="text-[10px] text-slate-400 block font-bold">Prof Fee</span>
                            <input
                              type="number"
                              min="0"
                              value={tier.price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFormYearFees(formYearFees.map((y) => (y.id === tier.id ? { ...y, price: val } : y)));
                              }}
                              className="w-full px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold text-blue-600 dark:text-sky-400"
                            />
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Total</span>
                            <span className="font-bold font-mono text-[11px] text-slate-900 dark:text-white">
                              ₹{(Number(tier.gov) + Number(tier.price)).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (formYearFees.length > 1) {
                                  setFormYearFees(formYearFees.filter((y) => y.id !== tier.id));
                                }
                              }}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Standard Documents & Checklist (With Add Buttons) */}
              <div className="space-y-2.5">
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl text-xs font-bold text-blue-900 dark:text-sky-300 flex items-center justify-between">
                  <span>2. Standard Documents & Checklist</span>
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-sky-400">
                    {formDocs.length} Documents Added
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={newModalDocName}
                    onChange={(e) => setNewModalDocName(e.target.value)}
                    placeholder="Document Name (e.g. PAN Card, Rent Deed)"
                    className="flex-1 w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <select
                    value={newModalDocType}
                    onChange={(e) => setNewModalDocType(e.target.value as any)}
                    className="w-full sm:w-44 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Mandatory">Mandatory Document</option>
                    <option value="Optional">Optional Document</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddModalDoc}
                    disabled={!newModalDocName.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer whitespace-nowrap"
                  >
                    Add Document
                  </button>
                </div>

                {/* List of Added Documents */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {formDocs.map((doc, idx) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">{idx + 1}.</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            doc.type === "Mandatory"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {doc.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormDocs(formDocs.filter((d) => d.id !== doc.id))}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2.5 px-5 cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Service */}
      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar my-auto">
            <ModalHeaderBanner
              icon={Eye}
              badge="SERVICE SPECIFICATIONS"
              title={viewingService.name}
              description={`${viewingService.category} · Processing SLA: ${viewingService.time} · ${viewingService.recurring ? `Recurring (${viewingService.frequency})` : "One-Time"}`}
              badgeTag={viewingService.status}
              className="py-3 px-3.5"
              onClose={() => setViewingService(null)}
            />

            <div className="space-y-4 text-xs">
              {viewingService.description && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Overview / Subtitle</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{viewingService.description}</p>
                </div>
              )}

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl font-bold text-blue-900 dark:text-sky-300">
                Service Breakdown
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewingService.category}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Recurring</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingService.recurring ? `Yes (${viewingService.frequency})` : "One Time"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Client Price</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{money(viewingService.price)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Government Fee</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{money(viewingService.gov)}</p>
                </div>
                {viewingService.partnerProfit !== undefined && viewingService.partnerProfit > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Partner Profit</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-sky-400 mt-0.5">{money(viewingService.partnerProfit)}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Processing SLA</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewingService.time}</p>
                </div>
              </div>

              {/* Year-wise Fees if enabled */}
              {viewingService.yearWiseFeesEnabled && viewingService.yearWiseFees && viewingService.yearWiseFees.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl font-bold text-indigo-900 dark:text-indigo-300">
                    Year-wise Fee Structure
                  </div>
                  <div className="space-y-1.5">
                    {viewingService.yearWiseFees.map((yf: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{yf.year} Year(s)</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-500">Gov: ₹{yf.governmentFee}</span>
                          <span className="text-slate-500">Prof: ₹{yf.professionalFee}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Total: ₹{yf.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl font-bold text-blue-900 dark:text-sky-300">
                Required Documents
              </div>
              {viewingService.requiredDocuments && viewingService.requiredDocuments.length > 0 ? (
                <ul className="space-y-1.5 pl-1">
                  {viewingService.requiredDocuments.map((doc: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{typeof doc === "string" ? doc : doc.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic">No specific documents specified for this service.</p>
              )}

              {/* Key Features / Highlights */}
              {viewingService.keyFeatures && viewingService.keyFeatures.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl font-bold text-blue-900 dark:text-sky-300">
                    Key Features &amp; Highlights
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {viewingService.keyFeatures.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Workflow Steps */}
              {viewingService.workflowSteps && viewingService.workflowSteps.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl font-bold text-blue-900 dark:text-sky-300">
                    Service Steps / Workflow
                  </div>
                  <ol className="space-y-1.5 pl-1 list-decimal list-inside text-slate-700 dark:text-slate-300 font-medium">
                    {viewingService.workflowSteps.map((step: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="ml-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* FAQs */}
              {viewingService.faqs && viewingService.faqs.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl font-bold text-blue-900 dark:text-sky-300">
                    Frequently Asked Questions (FAQs)
                  </div>
                  <div className="space-y-2">
                    {viewingService.faqs.map((faq: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">Q: {faq}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Government Links */}
              {viewingService.officialGovernmentPortalLinks && viewingService.officialGovernmentPortalLinks.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl font-bold text-blue-900 dark:text-sky-300">
                    Official Government Portals
                  </div>
                  <div className="space-y-1.5">
                    {viewingService.officialGovernmentPortalLinks.map((link: string, idx: number) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 dark:text-sky-400 hover:underline font-medium break-all"
                      >
                        <span>🔗</span>
                        <span>{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
              <button
                onClick={() => setViewingService(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Service Confirmation */}
      {deleteConfirmService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-150 space-y-4">
            <ModalHeaderBanner
              icon={Trash2}
              badge="CATALOG MANAGEMENT"
              title="Delete Service"
              description="Confirm permanent removal of this service item from catalog and partner rate cards."
              badgeTag="Critical Action"
              onClose={() => setDeleteConfirmService(null)}
            />

            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300">
              Are you sure you want to delete <span className="font-bold">"{deleteConfirmService.name}"</span>? This will permanently remove this service from your catalog and dashboard.
            </div>

            {deleteErrorMsg && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-bold leading-relaxed">{deleteErrorMsg}</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Services with active published workflow forms or customer filings are preserved to protect audit compliance records.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmService(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (deleteConfirmService) {
                    handleDeleteService(deleteConfirmService.id);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-lg shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Delete Service"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
