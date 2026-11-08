"use client";

import React, { useState, useEffect } from "react";
import { 
  Boxes, 
  Search, 
  ArrowRight, 
  Sparkles, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  Loader2,
  FileText
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { 
  partnerPortalService, 
  PartnerCatalogService, 
  ApplicationFormVersionData 
} from "@/lib/api/partnerPortalService";
import DynamicApplicationForm from "./DynamicApplicationForm";
import { useToast } from "@/components/Global/ToastNotification";

interface NewApplicationModalProps {
  onClose: () => void;
  onSuccessCreated: () => void;
}

export default function NewApplicationModal({
  onClose,
  onSuccessCreated,
}: NewApplicationModalProps) {
  const toast = useToast();
  const [services, setServices] = useState<PartnerCatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Chosen service form
  const [selectedService, setSelectedService] = useState<PartnerCatalogService | null>(null);
  const [formVersion, setFormVersion] = useState<ApplicationFormVersionData | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);

  // Op 07: List Active Services
  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const res = await partnerPortalService.services.listActive();
        if (res?.success && Array.isArray(res?.data)) {
          setServices(res.data);
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load services catalogue", "Catalog Error");
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [toast]);

  // Op 08: Load Dynamic Form Schema for selected service
  const handleSelectService = async (service: PartnerCatalogService) => {
    try {
      setSelectedService(service);
      setLoadingForm(true);
      const res = await partnerPortalService.services.getApplicationForm(service.id);
      if (res?.success && res.data) {
        setFormVersion(res.data);
      } else {
        toast.error("Form schema not available for this service.", "Configuration Missing");
        setSelectedService(null);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load service application form", "Error");
      setSelectedService(null);
    } finally {
      setLoadingForm(false);
    }
  };

  // Distinct categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => s.category && set.add(s.category));
    return ["ALL", ...Array.from(set)];
  }, [services]);

  const filteredServices = React.useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === "ALL" || s.category === selectedCategory;
      const matchSearch = !search.trim() || 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        (s.subtitle && s.subtitle.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, search]);

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={Boxes}
            badge="NEW SERVICE FILING"
            title={selectedService ? `${selectedService.name} · Dynamic Filing Form` : "Select Catalog Service"}
            description={selectedService ? `Starting Client Fee: ₹${(selectedService.startingClientPrice || 0).toLocaleString("en-IN")}` : "Choose a regulatory, tax, or legal filing service to launch a new client application."}
            badgeTag="Op 07 & Op 08"
            onClose={onClose}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loadingForm ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <p className="text-xs">Fetching dynamic application schema & document requirements...</p>
            </div>
          ) : formVersion ? (
            <DynamicApplicationForm
              formVersion={formVersion}
              onSuccess={(requestCode) => {
                onSuccessCreated();
                onClose();
              }}
              onCancel={() => {
                setFormVersion(null);
                setSelectedService(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Category pills & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        selectedCategory === c
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Service Cards Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs">Loading active catalog services...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs">
                  No services matching your search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                  {filteredServices.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => handleSelectService(srv)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-sky-400">
                            {srv.category || "General"}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                            ID: #{srv.id}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                          {srv.name}
                        </h4>
                        {srv.subtitle && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {srv.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Starting Fee</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            ₹{(srv.startingClientPrice || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="p-2 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white dark:bg-blue-950/60 dark:text-sky-300 dark:group-hover:text-white transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            {services.length} catalog services available
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
