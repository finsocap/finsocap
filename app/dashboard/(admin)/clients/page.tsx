"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, UserPlus, Search, Phone, Building2, CheckCircle2, 
  Clock, ShieldCheck, X, FileText, ArrowRight, Sparkles, Filter, RotateCcw
} from "lucide-react";
import { useCrmStore, ClientModel, TaskModel } from "@/lib/crmStore";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import ClientsInfographic from "@/components/Charts/ClientsInfographic";
import PageBanner from "@/components/Dashboard/PageBanner";

const statuses = [
  "Pending",
  "In Progress",
  "Sent for Review",
  "Pending from Client",
  "Pending from Department",
  "Completed",
  "Cancelled",
];

export default function ClientsPage() {
  const { allClients, tasks, addClient } = useCrmStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClientHistory, setSelectedClientHistory] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Client Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBusiness, setFormBusiness] = useState("");
  const [formPartner, setFormPartner] = useState("Direct");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // KPIs
  const totalClients = allClients.length;
  const activeCases = tasks.filter((t) => !["Completed", "Cancelled"].includes(t.status)).length;
  const completedServices = tasks.filter((t) => t.status === "Completed").length;
  const partnerReferred = allClients.filter((c) => c.partner && c.partner.toLowerCase() !== "direct").length;

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return allClients.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.business.toLowerCase().includes(q) ||
          c.partner.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allClients, search, statusFilter]);

  // Tasks for selected client history
  const clientHistoryTasks = useMemo(() => {
    if (!selectedClientHistory) return [];
    return tasks.filter((t) => t.client.toLowerCase() === selectedClientHistory.toLowerCase());
  }, [selectedClientHistory, tasks]);

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    addClient({
      name: formName.trim(),
      phone: formPhone.trim(),
      business: formBusiness.trim() || "—",
      partner: formPartner.trim() || "Direct",
    });

    setFormName("");
    setFormPhone("");
    setFormBusiness("");
    setFormPartner("Direct");
    setIsAddModalOpen(false);
    showToast(`Client "${formName}" added successfully.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
      case "Completed":
      case "Converted":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
      case "In Progress":
      case "Assigned":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-200 dark:border-blue-800";
      case "Sent for Review":
      case "Under Review":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800";
      case "Pending from Client":
      case "Pending from Department":
      case "Draft":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
      case "Pending":
      case "Overdue":
      case "Cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
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
        icon={Users}
        badge="Finsocap CRM Directory"
        badgeMeta="Enterprise Client Ecosystem & KYC"
        title="Clients Directory"
        description="Comprehensive customer profiles, compliance portfolios, business entities and engagement history."
        bottomMeta={`${allClients.length} Verified Client Accounts • 100% KYC Compliant`}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary-vibrant text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/25"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Client</span>
          </button>
        }
      />

      {/* Client Enterprise Constitution & Retention Infographic */}
      <ClientsInfographic clients={allClients} />

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg shrink-0">
            ♟
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Clients</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={totalClients} />
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg shrink-0">
            ☑
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Cases</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={activeCases} />
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
            ✓
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Services</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={completedServices} />
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">
            ♧
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Partner Referred</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={partnerReferred} />
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client, business, phone or partner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {(search || statusFilter !== "ALL") && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="btn-gold-vibrant text-xs py-2 px-3.5 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 4. Clients Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                <th className="py-3.5 px-5">Client</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Business</th>
                <th className="py-3.5 px-5">Partner</th>
                <th className="py-3.5 px-5 text-center">Service Cases</th>
                <th className="py-3.5 px-5">Latest Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No clients match this search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {client.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400">
                      {client.phone}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                      {client.business}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                      {client.partner}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-black text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-300">
                        {client.tasks}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getStatusBadge(client.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedClientHistory(client.name)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer"
                      >
                        View history
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Client */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Add Client
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formBusiness}
                    onChange={(e) => setFormBusiness(e.target.value)}
                    placeholder="e.g. Shri Foods"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={formPartner}
                    onChange={(e) => setFormPartner(e.target.value)}
                    placeholder="e.g. Rahul Jha or Direct"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2.5 px-5 cursor-pointer"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Client History */}
      {selectedClientHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Client History · {selectedClientHistory}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  All service applications and status milestones for this customer.
                </p>
              </div>
              <button
                onClick={() => setSelectedClientHistory(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                    <th className="py-2.5 px-4">Task ID</th>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4">Business</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {clientHistoryTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No service cases recorded for this client yet.
                      </td>
                    </tr>
                  ) : (
                    clientHistoryTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-blue-600 dark:text-sky-400">
                          {t.id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {t.service}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {t.business}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getStatusBadge(t.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {t.due}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
              <button
                onClick={() => setSelectedClientHistory(null)}
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
