import { ServiceItem } from "@/types";
import { initialServices } from "@/lib/servicesData";

const STORAGE_KEY = "finsocap_services_catalog_v1";

function getStoredServices(): ServiceItem[] {
  if (typeof window === "undefined") return initialServices;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialServices));
      return initialServices;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialServices;
  }
}

function setStoredServices(services: ServiceItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error("[serviceCatalog] Failed to persist services:", e);
  }
}

export const serviceCatalog = {
  // Get all services
  getAll: async (): Promise<ServiceItem[]> => {
    return getStoredServices();
  },

  // Get service by ID
  getById: async (id: string): Promise<ServiceItem | null> => {
    const services = getStoredServices();
    return services.find((s) => s.id === id) || null;
  },

  // Save (Create or Update) service
  save: async (service: Partial<ServiceItem>): Promise<ServiceItem> => {
    const services = getStoredServices();
    if (service.id) {
      const idx = services.findIndex((s) => s.id === service.id);
      if (idx !== -1) {
        services[idx] = { ...services[idx], ...service } as ServiceItem;
        setStoredServices(services);
        return services[idx];
      }
    }
    const newService: ServiceItem = {
      id: `SRV-${String(services.length + 1).padStart(3, "0")}`,
      name: service.name || "Untitled Service",
      category: service.category || "General",
      description: service.description || "",
      recurring: service.recurring || "No",
      frequency: service.frequency || "One Time",
      price: service.price || 0,
      governmentFee: service.governmentFee || 0,
      processingTime: service.processingTime || "3 - 7 Days",
      status: service.status || "Active",
      isPopular: service.isPopular ?? false,
      content: service.content || "",
      highlights: service.highlights || [],
      steps: service.steps || [],
      eligibility: service.eligibility || "",
      documents: service.documents || [],
      usefulLinks: service.usefulLinks || [],
      videoLink: service.videoLink || "",
      studyMaterials: service.studyMaterials || [],
      faqs: service.faqs || [],
      createdAt: new Date().toISOString(),
    };
    services.unshift(newService);
    setStoredServices(services);
    return newService;
  },

  // Clone/Duplicate service
  clone: async (id: string): Promise<ServiceItem | null> => {
    const services = getStoredServices();
    const source = services.find((s) => s.id === id);
    if (!source) return null;
    const cloned: ServiceItem = {
      ...source,
      id: `SRV-${Date.now().toString().slice(-4)}`,
      name: `${source.name} (Copy)`,
      status: "Draft",
      createdAt: new Date().toISOString(),
    };
    services.unshift(cloned);
    setStoredServices(services);
    return cloned;
  },

  // Delete service
  delete: async (id: string): Promise<boolean> => {
    const services = getStoredServices();
    const filtered = services.filter((s) => s.id !== id);
    setStoredServices(filtered);
    return true;
  },
};
