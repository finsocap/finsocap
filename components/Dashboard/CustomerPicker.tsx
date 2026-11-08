"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Check, 
  UserCheck, 
  Phone, 
  Mail, 
  Building2, 
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { partnerPortalService, PartnerCustomerItem } from "@/lib/api/partnerPortalService";
import { partnerMockData, isPartnerMockEnabled } from "@/lib/api/partnerMocks";
import { formatIndianPhoneNumber, formatName } from "@/lib/formatters";

interface CustomerPickerProps {
  selectedCustomer: PartnerCustomerItem | null;
  onSelectCustomer: (customer: PartnerCustomerItem) => void;
}

export default function CustomerPicker({ selectedCustomer, onSelectCustomer }: CustomerPickerProps) {
  const [customers, setCustomers] = useState<PartnerCustomerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newConstitution, setNewConstitution] = useState<"SOLE_PROPRIETORSHIP" | "LLP_PARTNERSHIP" | "PRIVATE_LTD_OPC">("SOLE_PROPRIETORSHIP");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isPartnerMockEnabled()) {
        setCustomers(partnerMockData.customers);
        setLoading(false);
        return;
      }

      const res = await partnerPortalService.customers.list();
      if (res?.data && Array.isArray(res.data)) {
        setCustomers(res.data);
      } else {
        setCustomers([]);
      }
    } catch (err: any) {
      console.warn("Using fallback/mock customers list:", err);
      setCustomers(partnerMockData.customers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setCreateError("Customer name and phone number are required.");
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    try {
      let createdCustomer: PartnerCustomerItem;
      if (isPartnerMockEnabled()) {
        createdCustomer = {
          id: Date.now(),
          name: formatName(newName),
          phone: newPhone,
          email: newEmail,
          businessName: newBusinessName || newName,
          constitutionType: newConstitution,
          partnerName: "My Franchise",
          partnerCode: "FC104",
          serviceCases: 0,
          latestStatus: "PENDING",
        };
      } else {
        const res = await partnerPortalService.customers.create({
          name: formatName(newName),
          phone: newPhone,
          email: newEmail || undefined,
          businessName: newBusinessName || undefined,
          constitutionType: newConstitution,
        });
        createdCustomer = res.data;
      }

      setCustomers((prev) => [createdCustomer, ...prev]);
      onSelectCustomer(createdCustomer);
      setIsCreatingNew(false);
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      setNewBusinessName("");
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.businessName && c.businessName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3">
      {/* Selection Summary Pill */}
      {selectedCustomer ? (
        <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">{selectedCustomer.name}</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  ID #{selectedCustomer.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedCustomer.businessName || "Direct Entity"} &bull; {selectedCustomer.phone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectCustomer(null as any)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Client / Customer <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isCreatingNew ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isCreatingNew ? "Cancel" : "Add New Customer (Op 05)"}</span>
            </button>
          </div>

          {/* New Customer Inline Form */}
          {isCreatingNew ? (
            <form onSubmit={handleCreateCustomer} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
              <h5 className="font-bold text-slate-800 dark:text-white text-xs">Register Customer for this Request</h5>
              {createError && <p className="text-xs text-rose-600">{createError}</p>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Customer Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(formatIndianPhoneNumber(e.target.value))}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Business Name (Optional)</label>
                  <input
                    type="text"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    placeholder="e.g. Patel Foods & Co"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Constitution Type</label>
                  <select
                    value={newConstitution}
                    onChange={(e) => setNewConstitution(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                    <option value="LLP_PARTNERSHIP">LLP / Partnership</option>
                    <option value="PRIVATE_LTD_OPC">Private Limited / OPC</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? "Creating..." : "Save & Select Customer"}
                </button>
              </div>
            </form>
          ) : (
            /* Search & List Dropdown */
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search existing customers by name, phone or entity..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              {loading ? (
                <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading customers (Op 06)...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No matching customers found. Click &quot;Add New Customer&quot; above.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0c1427]">
                  {filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectCustomer(c)}
                      className="w-full p-2.5 text-left hover:bg-blue-50/70 dark:hover:bg-blue-950/30 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">{c.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {c.businessName || "Direct"} &bull; {c.phone}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

