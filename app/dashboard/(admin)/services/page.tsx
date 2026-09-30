"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Boxes, Plus, Search, Filter, RotateCcw, Edit2, Eye, 
  Trash2, Clock, CheckCircle2, AlertCircle, X, Sparkles,
  IndianRupee, Layers, Check
} from "lucide-react";
import { useCrmStore, ServiceModel } from "@/lib/crmStore";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import ServicesInfographic from "@/components/Charts/ServicesInfographic";
import PageBanner from "@/components/Dashboard/PageBanner";

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
  const { services, addService, updateService, toggleServiceStatus } = useCrmStore();

  const [categoryList, setCategoryList] = useState<string[]>(() => {
    const fromServices = services.map((s) => s.category);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromServices]));
  });
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

  const [activeTab, setActiveTab] = useState<"All Services" | "Active" | "Inactive" | "Draft" | "Popular" | "Recently Added">("All Services");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [viewingService, setViewingService] = useState<ServiceModel | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Food & Beverage");
  const [formRecurring, setFormRecurring] = useState(false);
  const [formFrequency, setFormFrequency] = useState("One Time");
  const [formPrice, setFormPrice] = useState<number>(1000);
  const [formGov, setFormGov] = useState<number>(0);
  const [formTime, setFormTime] = useState("3 - 7 Days");
  const [formDesc, setFormDesc] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingServiceId) {
      updateService(editingServiceId, {
        name: formName.trim(),
        category: formCategory,
        recurring: formRecurring,
        frequency: formFrequency,
        price: Number(formPrice),
        gov: Number(formGov),
        time: formTime.trim() || "To be confirmed",
        description: formDesc.trim(),
      });
      showToast(`"${formName}" updated successfully.`);
    } else {
      addService({
        name: formName.trim(),
        category: formCategory,
        recurring: formRecurring,
        frequency: formFrequency,
        price: Number(formPrice),
        gov: Number(formGov),
        time: formTime.trim() || "To be confirmed",
        status: "Active",
        description: formDesc.trim(),
      });
      showToast(`Service "${formName}" created.`);
    }

    setIsAddEditModalOpen(false);
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: services.length,
      active: services.filter((s) => s.status === "Active").length,
      inactive: services.filter((s) => s.status === "Inactive").length,
      draft: services.filter((s) => s.status === "Draft").length,
      popular: services.filter((s) => s.id <= 3).length,
      recent: services.filter((s) => s.id > 9).length,
    };
  }, [services]);

  // Filtered rows
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
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
  }, [services, activeTab, selectedCategory, selectedStatus, search]);

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
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Executive Branded Command Banner (Signature Finsocap Glassmorphic Gradient) */}
      <PageBanner
        icon={Boxes}
        badge="Finsocap Service Hub"
        badgeMeta="Taxation, FSSAI & Corporate Compliance"
        title="Products / Services"
        description="Manage your corporate services, categories, pricing, statutory documents and lifecycle status."
        bottomMeta={`${services.length} Total Services • Statutory Fee Schedule Verified`}
        actions={
          <button
            onClick={openAddModal}
            className="btn-primary-vibrant text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Service</span>
          </button>
        }
      />

      {/* Services Portfolio Infographic Banner */}
      <ServicesInfographic services={services} />

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
      <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search service name, category or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="w-full md:w-52">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categoryList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
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
            className="btn-gold-vibrant text-xs py-2 px-3.5 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 4. Services Table matching Reference */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
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
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No services match these filters.
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
                        <button
                          onClick={() => openEditModal(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setViewingService(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            toggleServiceStatus(s.id);
                            showToast(`${s.name} is now ${s.status === "Active" ? "inactive" : "active"}.`);
                          }}
                          title="Toggle Active / Inactive"
                          className="w-7 h-7 rounded-lg text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer flex items-center justify-center"
                        >
                          ⋯
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{filteredServices.length} services shown · Changes automatically persist in local CRM store</span>
        </div>
      </div>

      {/* Modal: Add / Edit Service */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingServiceId ? "Edit Service" : "Add New Service"}
              </h2>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 mt-5">
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
                        + Add New Category...
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

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl text-xs font-bold text-blue-900 dark:text-sky-300">
                2. Standard Documents & Checklist
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Document Name (e.g. PAN Card, Rent Deed)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
                <select className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold">
                  <option>Mandatory Document</option>
                  <option>Optional Document</option>
                </select>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {viewingService.name}
              </h2>
              <button
                onClick={() => setViewingService(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-5 text-xs">
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
                  <p className="text-[10px] uppercase font-bold text-slate-400">Professional Fee</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{money(viewingService.price)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Government Fee</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{money(viewingService.gov)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Processing SLA</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewingService.time}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl font-bold text-blue-900 dark:text-sky-300">
                Required Documents
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                • PAN Card of applicant / business entity<br />
                • Business address proof (Rent Agreement / Electricity Bill)<br />
                • Passport photograph / Authorized signatory letter
              </p>
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
    </div>
  );
}
