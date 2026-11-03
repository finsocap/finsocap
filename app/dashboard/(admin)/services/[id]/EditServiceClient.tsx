"use client";

import { useEffect, useState } from "react";
import { ServiceItem } from "@/types";
import { serviceCatalogService } from "@/lib/api/serviceCatalogService";
import { serviceCatalog } from "@/lib/services/serviceCatalog";
import ServiceEditorForm from "@/components/Dashboard/ServiceEditorForm";
import { Loader2 } from "lucide-react";

export default function EditServiceClient({ id }: { id: string }) {
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchService() {
      try {
        const rawId = String(id).trim();
        const numericId = parseInt(rawId.replace(/\D/g, ""), 10);
        const searchId = !isNaN(numericId) ? numericId : rawId;

        // 1. Try to fetch directly from live backend API first
        if (searchId) {
          try {
            const apiRes = await serviceCatalogService.getServiceById(searchId);
            const liveData = apiRes?.data || (apiRes as any);

            if (liveData && liveData.id) {
              const itemObj = liveData as any;

              const usefulLinks = Array.isArray(itemObj.officialGovernmentPortalLinks)
                ? itemObj.officialGovernmentPortalLinks.map((url: string, idx: number) => ({
                    id: `link-${idx + 1}`,
                    title: `Official Portal ${idx + 1}`,
                    url,
                  }))
                : [];

              // Parse studyMaterials / sopsJson
              let parsedSops: any[] = [];
              if (itemObj.sopsJson) {
                try {
                  const s = JSON.parse(itemObj.sopsJson);
                  if (Array.isArray(s)) parsedSops = s;
                } catch (e) {}
              }
              const studyMaterials = parsedSops.length > 0 
                ? parsedSops.map((m: any, idx: number) => ({
                    id: m.id || `mat-${idx + 1}`,
                    title: m.title || `Material ${idx + 1}`,
                    fileUrl: m.fileUrl || "#",
                  }))
                : Array.isArray(itemObj.studyMaterials)
                ? itemObj.studyMaterials.map((fileUrl: string, idx: number) => ({
                    id: `mat-${idx + 1}`,
                    title: `Material ${idx + 1}`,
                    fileUrl,
                  }))
                : [];

              // Parse faqs / faqsJson
              let parsedFaqs: any[] = [];
              if (itemObj.faqsJson) {
                try {
                  const f = JSON.parse(itemObj.faqsJson);
                  if (Array.isArray(f)) parsedFaqs = f;
                } catch (e) {}
              }
              const faqs = parsedFaqs.length > 0
                ? parsedFaqs.map((f: any, idx: number) => ({
                    id: f.id || `faq-${idx + 1}`,
                    question: f.question || "",
                    answer: f.answer || "",
                  }))
                : Array.isArray(itemObj.faqs)
                ? itemObj.faqs.map((f: string, idx: number) => {
                    const text = String(f || "");
                    const qMark = text.indexOf("?");
                    if (qMark !== -1) {
                      return {
                        id: `faq-${idx + 1}`,
                        question: text.substring(0, qMark + 1).trim(),
                        answer: text.substring(qMark + 1).trim(),
                      };
                    }
                    return {
                      id: `faq-${idx + 1}`,
                      question: text,
                      answer: "",
                    };
                  })
                : [];

              // Parse yearWiseFees / pricingTiersJson
              let parsedTiers: any[] = [];
              if (itemObj.pricingTiersJson) {
                try {
                  const pt = JSON.parse(itemObj.pricingTiersJson);
                  if (Array.isArray(pt)) parsedTiers = pt;
                } catch (e) {}
              }

              const hasYearFees = Boolean(itemObj.yearWiseFeesEnabled) || parsedTiers.length > 0;
              const yearFeesSource = Array.isArray(itemObj.yearWiseFees) && itemObj.yearWiseFees.length > 0
                ? itemObj.yearWiseFees
                : parsedTiers;

              const yearFees = hasYearFees && yearFeesSource.length > 0
                ? yearFeesSource.map((yf: any, idx: number) => {
                    const yNum = Number(yf.year) || idx + 1;
                    return {
                      id: `yf-${idx + 1}`,
                      year: yNum,
                      label: `${yNum} Year${yNum > 1 ? "s" : ""}`,
                      governmentFee: Number(yf.governmentFee) || 0,
                      professionalFee: Number(yf.professionalFee) || 0,
                    };
                  })
                : [];

              const recurringValue: "Yes" | "No" = itemObj.recurring === "YES" ? "Yes" : "No";
              const freqRaw = String(itemObj.frequency || "").toUpperCase();
              const frequencyValue: "One Time" | "Monthly" | "Yearly" | "Quarterly" =
                freqRaw === "MONTHLY"
                  ? "Monthly"
                  : freqRaw === "YEARLY"
                  ? "Yearly"
                  : freqRaw === "QUARTERLY"
                  ? "Quarterly"
                  : "One Time";

              const videoLink =
                Array.isArray(itemObj.trainingVideoTutorials) && itemObj.trainingVideoTutorials.length > 0
                  ? itemObj.trainingVideoTutorials[0]
                  : "";

              const mapped: ServiceItem = {
                id: String(itemObj.id),
                name: itemObj.name || "Untitled Service",
                category: itemObj.category || "LICENSES",
                description: itemObj.subtitle || itemObj.description || "",
                recurring: recurringValue,
                frequency: frequencyValue,
                price: Number(itemObj.startingClientPrice || itemObj.price || 0),
                partnerProfit: Number(itemObj.partnerProfit || 0),
                governmentFee: Number(itemObj.baseGovernmentFee || itemObj.governmentFee || 0),
                hasYearFees,
                yearFees,
                processingTime: itemObj.processingTime || "3 - 7 Days",
                status: itemObj.active !== false ? "Active" : "Inactive",
                content: itemObj.contentDetails || itemObj.overviewHtml || "",
                eligibility: itemObj.eligibilityCriteria || "",
                highlights: Array.isArray(itemObj.keyFeatures) ? itemObj.keyFeatures : [],
                steps: Array.isArray(itemObj.workflowSteps) ? itemObj.workflowSteps : [],
                documents: Array.isArray(itemObj.requiredDocuments)
                  ? itemObj.requiredDocuments.map((doc: string, idx: number) => ({
                      id: `doc-${idx + 1}`,
                      name: typeof doc === "string" ? doc : (doc as any)?.name || "Document",
                      type: "Required" as const,
                    }))
                  : [],
                usefulLinks,
                videoLink,
                studyMaterials,
                faqs,
              };

              if (isMounted) {
                setService(mapped);
                setLoading(false);
                return;
              }
            }
          } catch (apiErr) {
            console.warn("[EditServiceClient] API getServiceById failed, trying local store fallback:", apiErr);
          }
        }

        // 2. Fallback to serviceCatalog local storage
        const localData = await serviceCatalog.getById(rawId);
        if (isMounted) {
          setService(localData);
          setLoading(false);
        }
      } catch (err) {
        console.error("[EditServiceClient] Error loading service:", err);
        if (isMounted) {
          setService(null);
          setLoading(false);
        }
      }
    }

    fetchService();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Service Not Found</h2>
        <p className="text-sm mt-1">The requested service could not be loaded. Please return to the services catalog or try again.</p>
      </div>
    );
  }

  return <ServiceEditorForm initialData={service} isEditMode={true} />;
}
