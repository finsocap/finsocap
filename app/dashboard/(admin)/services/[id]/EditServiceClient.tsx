"use client";

import { useEffect, useState } from "react";
import { ServiceItem } from "@/types";
import { serviceCatalog } from "@/lib/services/serviceCatalog";
import ServiceEditorForm from "@/components/Dashboard/ServiceEditorForm";
import { Loader2 } from "lucide-react";

export default function EditServiceClient({ id }: { id: string }) {
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      const data = await serviceCatalog.getById(id);
      setService(data);
      setLoading(false);
    }
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm font-medium">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Service Not Found</h2>
        <p className="text-sm mt-1">The requested service could not be loaded.</p>
      </div>
    );
  }

  return <ServiceEditorForm initialData={service} isEditMode={true} />;
}
