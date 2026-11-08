"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Filter, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Eye, 
  Loader2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Building2,
  FolderLock,
  Layers,
  ArrowRight
} from "lucide-react";
import { 
  partnerPortalService, 
  PartnerServiceRequestListItem,
  PartnerServiceItem,
  PartnerCustomerItem
} from "@/lib/api/partnerPortalService";
import { useToast } from "@/components/Global/ToastNotification";
import PartnerRequestDetailModal from "./PartnerRequestDetailModal";
import NewApplicationModal from "./NewApplicationModal";
import DraftsLockerModal from "./DraftsLockerModal";
import CustomerPicker from "./CustomerPicker";

const STATUS_FILTERS = [
  { value: "ALL", label: "All Requests" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING_FROM_CLIENT", label: "Pending from Client" },
  { value: "SENT_FOR_REVIEW", label: "Sent for Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function PartnerRequestsDashboard() {
  const toast = useToast();

  // Requests state (Op 19)
  const [requests, setRequests] = useState<PartnerServiceRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters (Op 19 query params)
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Services list (Op 07) & Customers list (Op 05) for filter dropdowns
  const [servicesList, setServicesList] = useState<PartnerServiceItem[]>([]);
  const [customersList, setCustomersList] = useState<PartnerCustomerItem[]>([]);

  // Selected for detail view (Op 20)
  const [selectedRequestId, setSelectedRequestId] = useState<number | string | null>(null);

  // Modals
  const [isNewApplicationOpen, setIsNewApplicationOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [selectedCustomerForDrafts, setSelectedCustomerForDrafts] = useState<PartnerCustomerItem | null>(null);

  // Load auxiliary lists (Services and Customers)
  useEffect(() => {
    async function loadAux() {
      try {
        const [srvRes, custRes] = await Promise.allSettled([
          partnerPortalService.services.listActive(),
          partnerPortalService.customers.list()
        ]);
        if (srvRes.status === "fulfilled" && srvRes.value?.success && Array.isArray(srvRes.value.data)) {
          setServicesList(srvRes.value.data);
        }
        if (custRes.status === "fulfilled" && custRes.value?.success && Array.isArray(custRes.value.data)) {
          setCustomersList(custRes.value.data);
        }
      } catch (e) {}
    }
    loadAux();
  }, []);

  // Op 19: Paginated service requests list
  const loadRequests = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        size: pageSize,
      };
      if (selectedStatus !== "ALL") params.status = selectedStatus;
      if (selectedServiceId !== "ALL") params.serviceId = Number(selectedServiceId);
      if (selectedCustomerId !== "ALL") params.customerId = Number(selectedCustomerId);

      const res = await partnerPortalService.requests.listAll(params);
      if (res?.success) {
        if (res.data?.items && Array.isArray(res.data.items)) {
          setRequests(res.data.items);
          setTotalItems(res.data.totalElements || res.data.items.length);
        } else if (Array.isArray(res.data)) {
          setRequests(res.data);
          setTotalItems(res.data.length);
        }
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load requests list", "Error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, pageSize, selectedStatus, selectedServiceId, selectedCustomerId]);

  // Client search filtering
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(
      (r) =>
        String(r.id).toLowerCase().includes(q) ||
        (r.requestCode && r.requestCode.toLowerCase().includes(q)) ||
        (r.serviceName && r.serviceName.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q))
    );
  }, [requests, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0c1427] p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Partner Service Requests Tracking
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Client Filings & Active Task Pipelines
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track and manage real-time service requests (Ops 12, 19, 20, 21, 23, 25, 27, 30).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              if (customersList.length > 0) {
                setSelectedCustomerForDrafts(customersList[0]);
              }
              setIsDraftsOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <FolderLock className="w-4 h-4 text-amber-500" />
            <span>Drafts Locker</span>
          </button>

          <button
            onClick={() => setIsNewApplicationOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Service Application</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0c1427] p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search request ID, client, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Service filter */}
          <div>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="ALL">All Catalog Services</option>
              {servicesList.map((srv) => (
                <option key={srv.id} value={srv.id}>{srv.name}</option>
              ))}
            </select>
          </div>

          {/* Customer filter */}
          <div>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="ALL">All Customers</option>
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick status pill counters */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span>Found {filteredRequests.length} active service requests</span>
          <button
            onClick={() => {
              setSelectedStatus("ALL");
              setSelectedServiceId("ALL");
              setSelectedCustomerId("ALL");
              setSearchQuery("");
              loadRequests();
            }}
            className="flex items-center gap-1 text-blue-600 hover:underline font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-xs">Fetching partner service requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 px-4">
            <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Service Requests Found</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1">
              No service requests match the selected filters. Use "New Service Application" to submit a filing for your customer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Request Code / ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.map((r) => {
                  const isPendingClient = r.status === "PENDING_FROM_CLIENT";
                  const isCompleted = r.status === "COMPLETED";

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRequestId(r.id)}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {r.requestCode || `#${r.id}`}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {r.customerName || `Customer #${r.customerId}`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {r.serviceName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border inline-flex items-center gap-1 ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : isPendingClient
                            ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse"
                            : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-400"
                        }`}>
                          {isPendingClient && <AlertCircle className="w-3 h-3" />}
                          {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                          <span>{r.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {r.assignmentStatus || "UNASSIGNED"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB") : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRequestId(r.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-[11px] font-bold flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Page {page} &bull; Showing up to {pageSize} items (Total: {totalItems})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredRequests.length < pageSize}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal (Op 20, 21, 22, 23, 25, 27, 30) */}
      {selectedRequestId !== null && (
        <PartnerRequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onRefreshList={loadRequests}
        />
      )}

      {/* New Application Form Modal (Dynamic Op 08, 09, 10, 11, 13) */}
      {isNewApplicationOpen && (
        <NewApplicationModal
          onClose={() => setIsNewApplicationOpen(false)}
          onSuccessCreated={() => {
            setIsNewApplicationOpen(false);
            loadRequests();
          }}
        />
      )}

      {/* Drafts Locker Modal (Ops 14-18) */}
      {isDraftsOpen && (
        <DraftsLockerModal
          customer={selectedCustomerForDrafts}
          onClose={() => setIsDraftsOpen(false)}
          onSubmitSuccess={() => {
            setIsDraftsOpen(false);
            loadRequests();
          }}
        />
      )}

    </div>
  );
}
