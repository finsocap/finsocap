"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Handshake,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  PowerOff,
  RotateCcw,
  Edit2,
  Eye,
  Filter,
  Check,
  X,
  TrendingUp,
  Award,
  Sparkles,
  Briefcase,
  Users,
  Calendar,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useCrmStore, PartnerModel } from "@/lib/crmStore";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import PageBanner from "@/components/Dashboard/PageBanner";

export default function PartnersManagePage() {
  const { partners, tasks, addPartner, updatePartner, togglePartnerStatus, deletePartner } = useCrmStore();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Add Partner Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formPartnerId, setFormPartnerId] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formShopName, setFormShopName] = useState("");
  const [formCurrentAddress, setFormCurrentAddress] = useState("");
  const [formCompleteShopAddress, setFormCompleteShopAddress] = useState("");
  const [formPanNumber, setFormPanNumber] = useState("");
  const [formAdhaarNumber, setFormAdhaarNumber] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formTier, setFormTier] = useState("Gold Franchise");
  const [formStatus, setFormStatus] = useState<"Active" | "Deactivated" | "Pending">("Active");

  // Edit Partner Modal State
  const [editingPartner, setEditingPartner] = useState<PartnerModel | null>(null);
  const [editPartnerId, setEditPartnerId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editShopName, setEditShopName] = useState("");
  const [editCurrentAddress, setEditCurrentAddress] = useState("");
  const [editCompleteShopAddress, setEditCompleteShopAddress] = useState("");
  const [editPanNumber, setEditPanNumber] = useState("");
  const [editAdhaarNumber, setEditAdhaarNumber] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editTier, setEditTier] = useState("Gold Franchise");
  const [editStatus, setEditStatus] = useState<"Active" | "Deactivated" | "Pending">("Active");

  // View Partner Modal State
  const [viewingPartner, setViewingPartner] = useState<PartnerModel | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // KPIs
  const totalPartners = partners.length;
  const activePartnersCount = partners.filter((p) => p.status === "Active").length;
  const deactivatedPartnersCount = partners.filter((p) => p.status === "Deactivated").length;
  const pendingPartnersCount = partners.filter((p) => p.status === "Pending").length;
  const totalActivePartnerTasks = partners.reduce((acc, p) => acc + (p.activeTasks || 0), 0);

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      if (selectedStatus !== "ALL" && p.status !== selectedStatus) return false;
      if (selectedTier !== "ALL" && p.tier !== selectedTier) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.partnerId.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [partners, search, selectedStatus, selectedTier]);

  const handleOpenAddModal = () => {
    const nextNum = 101 + partners.length;
    setFormPartnerId(`P-${nextNum}`);
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormDob("");
    setFormShopName("");
    setFormCurrentAddress("");
    setFormCompleteShopAddress("");
    setFormPanNumber("");
    setFormAdhaarNumber("");
    setFormCity("");
    setFormState("");
    setFormTier("Gold Franchise");
    setFormStatus("Active");
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formPartnerId.trim()) {
      showToast("Partner ID, Name, and Phone number are required.");
      return;
    }

    addPartner({
      partnerId: formPartnerId.trim().toUpperCase(),
      name: formName.trim(),
      shortName: `${formPartnerId.trim().toUpperCase()} • ${formName.trim()}`,
      phone: formPhone.trim(),
      userId: formPhone.trim(),
      email: formEmail.trim() || `${formName.trim().toLowerCase().replace(/\s+/g, ".")}@finsocap.com`,
      dob: formDob.trim(),
      shopName: formShopName.trim(),
      currentAddress: formCurrentAddress.trim(),
      completeShopAddress: formCompleteShopAddress.trim(),
      panNumber: formPanNumber.trim().toUpperCase(),
      adhaarNumber: formAdhaarNumber.trim(),
      city: formCity.trim() || "Local Hub",
      state: formState.trim() || "India",
      status: formStatus,
      tier: formTier,
      registeredAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });

    setIsAddModalOpen(false);
    showToast(`Partner ${formPartnerId.toUpperCase()} (${formName}) enrolled successfully.`);
  };

  const openEditModal = (p: PartnerModel) => {
    setEditingPartner(p);
    setEditPartnerId(p.partnerId);
    setEditName(p.name);
    setEditPhone(p.phone);
    setEditEmail(p.email || "");
    setEditDob(p.dob || "");
    setEditShopName(p.shopName || "");
    setEditCurrentAddress(p.currentAddress || "");
    setEditCompleteShopAddress(p.completeShopAddress || "");
    setEditPanNumber(p.panNumber || "");
    setEditAdhaarNumber(p.adhaarNumber || "");
    setEditCity(p.city);
    setEditState(p.state);
    setEditTier(p.tier || "Gold Franchise");
    setEditStatus(p.status);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    if (!editName.trim() || !editPhone.trim()) {
      showToast("Name and phone number are required.");
      return;
    }

    updatePartner(editingPartner.partnerId, {
      partnerId: editPartnerId.trim().toUpperCase(),
      name: editName.trim(),
      shortName: `${editPartnerId.trim().toUpperCase()} • ${editName.trim()}`,
      phone: editPhone.trim(),
      userId: editPhone.trim(),
      email: editEmail.trim(),
      dob: editDob.trim(),
      shopName: editShopName.trim(),
      currentAddress: editCurrentAddress.trim(),
      completeShopAddress: editCompleteShopAddress.trim(),
      panNumber: editPanNumber.trim().toUpperCase(),
      adhaarNumber: editAdhaarNumber.trim(),
      city: editCity.trim(),
      state: editState.trim(),
      tier: editTier,
      status: editStatus,
    });

    setEditingPartner(null);
    showToast(`Partner ${editPartnerId} updated successfully.`);
  };

  const handleToggle = (partnerId: string, name: string, currentStatus: string) => {
    togglePartnerStatus(partnerId);
    showToast(`Partner ${name} is now ${currentStatus === "Active" ? "deactivated" : "reactivated"}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Banner */}
      <PageBanner
        icon={Handshake}
        badge="Franchise & Partner Operations"
        badgeMeta="Finsocap Partner Portal"
        title="Partner Network Management"
        description="Enroll, inspect, modify, and activate/deactivate franchise partners. Synchronized with the Partner Mobile App registration onboarding flow."
        actions={
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn-primary-vibrant text-xs py-2.5 px-4.5 cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll New Partner</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Partners */}
        <div className="card-luxury p-4.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Partners
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={totalPartners} />
            </p>
            <span className="text-[10px] text-blue-600 dark:text-sky-400 font-bold mt-0.5 inline-block">
              Nationwide Franchise Network
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
            <Handshake className="w-5 h-5" />
          </div>
        </div>

        {/* Active Partners */}
        <div className="card-luxury p-4.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Partners
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              <AnimatedCounter value={activePartnersCount} />
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 inline-block">
              Operational & Verified
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Deactivated Partners */}
        <div className="card-luxury p-4.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Deactivated
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              <AnimatedCounter value={deactivatedPartnersCount} />
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 inline-block">
              Paused / Inactive Kiosks
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <PowerOff className="w-5 h-5" />
          </div>
        </div>

        {/* Active Client Tasks */}
        <div className="card-luxury p-4.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Partner Tasks
            </p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              <AnimatedCounter value={totalActivePartnerTasks} />
            </p>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 inline-block">
              Live Cases in Queue
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-luxury p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Partner ID (e.g. P-101), Name, Mobile, City, or State..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 px-1.5">Status:</span>
              {(["ALL", "Active", "Deactivated", "Pending"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStatus === st
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Franchise Tiers</option>
              <option value="Gold Franchise">Gold Franchise</option>
              <option value="Silver Franchise">Silver Franchise</option>
              <option value="Bronze Franchise">Bronze Franchise</option>
              <option value="Master Network">Master Network</option>
            </select>

            {(search || selectedStatus !== "ALL" || selectedTier !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedStatus("ALL");
                  setSelectedTier("ALL");
                }}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Partner Table */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Enrolled Franchise Partners
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 font-mono">
              {filteredPartners.length} Records
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Registration data synced from Partner App
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Partner ID</th>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Hub Location</th>
                <th className="py-3 px-4">Franchise Tier</th>
                <th className="py-3 px-4 text-center">Active Tasks</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Handshake className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-bold">No partners found matching criteria</p>
                    <p className="text-xs mt-1">Try clearing search or filters to see all enrolled partners.</p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => {
                  const isActive = p.status === "Active";
                  const isPending = p.status === "Pending";

                  return (
                    <tr
                      key={p.partnerId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Partner ID */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {p.partnerId}
                        </span>
                      </td>

                      {/* Partner Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {p.email || `${p.name.toLowerCase().replace(/\s+/g, ".")}@finsocap.com`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{p.phone}</span>
                          <a
                            href={`tel:${p.phone}`}
                            className="p-1 rounded-lg text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                            title="Call Partner"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {p.city}, {p.state}
                          </span>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{p.tier || "Franchise Partner"}</span>
                        </span>
                      </td>

                      {/* Active Tasks */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {p.activeTasks ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25"
                              : isPending
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : isPending ? "bg-amber-500" : "bg-rose-500"
                            }`}
                          />
                          <span>{p.status}</span>
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setViewingPartner(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="View Partner Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer transition-colors"
                            title="Modify Partner Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Deactivate */}
                          <button
                            type="button"
                            onClick={() => handleToggle(p.partnerId, p.name, p.status)}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                              isActive
                                ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                            }`}
                            title={isActive ? "Deactivate Partner" : "Activate Partner"}
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Enroll / Add Partner */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Enroll New Franchise Partner
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Register credentials, hub location, and partner ID
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Partner ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Partner ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPartnerId}
                    onChange={(e) => setFormPartnerId(e.target.value)}
                    placeholder="e.g. P-106"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active (Operational)</option>
                    <option value="Pending">Pending (Under Review)</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              {/* Partner Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Partner / Franchise Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Jha (or Enterprise Name)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="partner@finsocap.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Shop Name & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shop / Enterprise Name
                  </label>
                  <input
                    type="text"
                    value={formShopName}
                    onChange={(e) => setFormShopName(e.target.value)}
                    placeholder="e.g. Verma Digital Seva Kendra"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth (D.O.B)
                  </label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Exact Location & Complete Shop Address */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Address (Exact Shop Location / Landmark)
                  </label>
                  <input
                    type="text"
                    value={formCurrentAddress}
                    onChange={(e) => setFormCurrentAddress(e.target.value)}
                    placeholder="e.g. Near Railway Crossing, Gandhi Chowk"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Complete Shop Address
                  </label>
                  <textarea
                    rows={2}
                    value={formCompleteShopAddress}
                    onChange={(e) => setFormCompleteShopAddress(e.target.value)}
                    placeholder="Shop No., Commercial Complex, Main Road, Pin Code"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>

              {/* KYC Details: PAN & Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PAN Card Number (KYC)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formPanNumber}
                    onChange={(e) => setFormPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Number (KYC)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formAdhaarNumber}
                    onChange={(e) => setFormAdhaarNumber(e.target.value)}
                    placeholder="1234 5678 9012"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* City, State & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hub City
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Patna, Noida"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="e.g. Bihar, UP"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Franchise Tier
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Gold Franchise">Gold Franchise</option>
                    <option value="Silver Franchise">Silver Franchise</option>
                    <option value="Bronze Franchise">Bronze Franchise</option>
                    <option value="Master Network">Master Network</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  Enroll Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Modify / Edit Partner */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Modify Partner: {editingPartner.name}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Update profile, contact number, status or tier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Partner ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Partner ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPartnerId}
                    onChange={(e) => setEditPartnerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Partner Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Contact Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Shop Name & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shop / Enterprise Name
                  </label>
                  <input
                    type="text"
                    value={editShopName}
                    onChange={(e) => setEditShopName(e.target.value)}
                    placeholder="e.g. Verma Digital Seva Kendra"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth (D.O.B)
                  </label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Exact Location & Complete Shop Address */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Address (Exact Shop Location / Landmark)
                  </label>
                  <input
                    type="text"
                    value={editCurrentAddress}
                    onChange={(e) => setEditCurrentAddress(e.target.value)}
                    placeholder="e.g. Near Railway Crossing, Gandhi Chowk"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Complete Shop Address
                  </label>
                  <textarea
                    rows={2}
                    value={editCompleteShopAddress}
                    onChange={(e) => setEditCompleteShopAddress(e.target.value)}
                    placeholder="Shop No., Commercial Complex, Main Road, Pin Code"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>

              {/* KYC Details: PAN & Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PAN Card Number (KYC)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editPanNumber}
                    onChange={(e) => setEditPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Number (KYC)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={editAdhaarNumber}
                    onChange={(e) => setEditAdhaarNumber(e.target.value)}
                    placeholder="1234 5678 9012"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* City, State & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tier
                  </label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Gold Franchise">Gold Franchise</option>
                    <option value="Silver Franchise">Silver Franchise</option>
                    <option value="Bronze Franchise">Bronze Franchise</option>
                    <option value="Master Network">Master Network</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: View Partner Details */}
      {viewingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {viewingPartner.partnerId}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {viewingPartner.name}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {viewingPartner.tier || "Franchise Partner"} &bull; {viewingPartner.city}, {viewingPartner.state}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingPartner(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Partner ID</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{viewingPartner.partnerId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingPartner.status}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Contact Number</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{viewingPartner.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                  <p className="font-mono text-slate-900 dark:text-white mt-0.5 truncate">{viewingPartner.email || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Active Cases</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingPartner.activeTasks} Tasks</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Leads</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingPartner.leadsCount} Leads</p>
                </div>
                {viewingPartner.userId && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Login User ID</span>
                    <p className="font-mono font-bold text-blue-600 dark:text-sky-400 mt-0.5">{viewingPartner.userId}</p>
                  </div>
                )}
                {viewingPartner.dob && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Date of Birth</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewingPartner.dob}</p>
                  </div>
                )}
              </div>

              {/* Shop & Location Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Shop / Enterprise Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{viewingPartner.shopName || "Registered Branch"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Exact Location</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{viewingPartner.currentAddress || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Complete Shop Address</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{viewingPartner.completeShopAddress || `${viewingPartner.city}, ${viewingPartner.state}`}</p>
                </div>
              </div>

              {/* KYC Details Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Verified KYC Numbers</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block">PAN Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{viewingPartner.panNumber || "ABCDE1234F"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block">Aadhaar Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{viewingPartner.adhaarNumber || "•••• •••• 9012"}</span>
                  </div>
                </div>
              </div>

              {/* Attached Documents */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Attached Documents (3 Files)</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">📄 1. PAN Card Scanned Copy</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {viewingPartner.documents?.panDoc || "PAN_Card.pdf"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">🪪 2. Aadhaar Card (Front/Back)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {viewingPartner.documents?.adhaarDoc || "Aadhaar_Verified.pdf"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">🏪 3. Shop Photo / Electricity Bill</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {viewingPartner.documents?.shopDoc || "Electricity_Bill.pdf"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {viewingPartner.status === "Pending" ? (
                  <button
                    type="button"
                    onClick={() => {
                      updatePartner(viewingPartner.partnerId, { status: "Active" });
                      setViewingPartner({ ...viewingPartner, status: "Active" });
                      showToast(`Partner ${viewingPartner.partnerId} approved and activated!`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Approve Partner</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Approved
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingPartner;
                    setViewingPartner(null);
                    openEditModal(toEdit);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modify Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
