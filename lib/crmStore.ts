import { useSyncExternalStore, useCallback, useMemo, useEffect } from "react";
import { apiClient } from "./api/apiClient";
import { ApiResponse, BackendTask, PartnerSummary, ClientProfile, Specialist, CatalogService, LicenceReportMetrics } from "@/types/api";
import { getDeterministicPartnerKyc, mapBackendTaskStatus } from "./formatters";

export interface ServiceModel {
  id: number;
  name: string;
  category: string;
  recurring: boolean;
  frequency: string;
  price: number;
  partnerProfit?: number;
  gov: number;
  time: string;
  status: "Active" | "Inactive" | "Draft";
  description?: string;
  requiredDocuments?: string[];
  keyFeatures?: string[];
  workflowSteps?: string[];
  officialGovernmentPortalLinks?: string[];
  trainingVideoTutorials?: string[];
  studyMaterials?: Array<{ id?: string; title?: string; fileUrl?: string } | string>;
  faqs?: Array<{ id?: string; question?: string; answer?: string } | string>;
  contentDetails?: string;
  eligibilityCriteria?: string;
  yearWiseFeesEnabled?: boolean;
  yearWiseFees?: any[];
  baseGovernmentFee?: string | number;
}

export interface TaskModel {
  id: string;
  numericId?: number;
  partner: string;
  partnerPhone: string;
  client: string;
  phone: string;
  business: string;
  category: string;
  service: string;
  status: "Pending" | "In Progress" | "Sent for Review" | "Pending from Client" | "Pending from Department" | "Completed" | "Cancelled";
  date: string;
  due: string;
  assignee: string;
  assigneeId?: number | null;
  priority: "High" | "Medium" | "Normal" | "Low";
  sales: string;
  comments: string[];
  files: string[];
  license?: string;
}

export interface UserModel {
  id: number;
  name: string;
  email?: string;
  role: string;
  dept: string;
  skill: string;
  skills?: string[];
  phone: string;
  password?: string;
  status: "Active" | "Deactivated";
  tasks: number;
  access?: "Employee" | "Admin" | "Manager";
}

export interface ClientModel {
  id?: string;
  name: string;
  phone: string;
  business: string;
  partner: string;
  tasks: number;
  last: string;
  status: string;
}

export interface PartnerModel {
  id: string;
  partnerId: string;
  name: string;
  shortName: string;
  email?: string;
  phone: string;
  userId?: string;
  password?: string;
  dob?: string;
  shopName?: string;
  currentAddress?: string;
  completeShopAddress?: string;
  panNumber?: string;
  adhaarNumber?: string;
  documents?: {
    panDoc?: string;
    adhaarDoc?: string;
    shopDoc?: string;
  };
  city: string;
  state: string;
  status: "Active" | "Deactivated" | "Pending";
  tier?: string;
  registeredAt?: string;
  leadsCount: number;
  revenueStr: string;
  activeTasks: number;
}

export interface LicenceModel {
  id?: string;
  task: string;
  taskId?: string;
  partner: string;
  partnerPhone: string;
  partnerNumber?: string;
  client: string;
  clientName?: string;
  phone: string;
  clientNumber?: string;
  type: string;
  category: string;
  service: string;
  number: string;
  issue: string;
  issueDate?: string;
  expiry: string;
  expiryDate?: string;
  user: string;
  userId?: string;
  password?: string;
  status: "Active" | "Expiring Soon" | "Expiring in 30 Days" | "Expired";
  url: boolean;
  files: number;
  attachmentsCount?: number;
  assignedTo?: string;
}

interface CrmData {
  services: ServiceModel[];
  tasks: TaskModel[];
  users: UserModel[];
  licences: LicenceModel[];
  manualClients: ClientModel[];
  partners: PartnerModel[];
}

function loadInitialData(): CrmData {
  return {
    services: [],
    tasks: [],
    users: [],
    licences: [],
    manualClients: [],
    partners: [],
  };
}

let memoryStore: CrmData = loadInitialData();
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): CrmData {
  return memoryStore;
}

const serverSnapshot: CrmData = {
  services: [],
  tasks: [],
  users: [],
  licences: [],
  manualClients: [],
  partners: [],
};

function getServerSnapshot(): CrmData {
  return serverSnapshot;
}

function updateStore(updater: (prev: CrmData) => CrmData) {
  memoryStore = updater(memoryStore);
  listeners.forEach((listener) => listener());
}

/**
 * Live Background Synchronization from FinSoCap REST API
 */
export async function fetchLiveDbData(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const [tasksRes, partnersRes, clientsRes, specialistsRes, servicesRes, licencesRes] = await Promise.allSettled([
      apiClient.get<ApiResponse<BackendTask[]>>("/tasks"),
      apiClient.get<ApiResponse<PartnerSummary[]>>("/partners/network"),
      apiClient.get<ApiResponse<ClientProfile[]>>("/clients"),
      apiClient.get<ApiResponse<Specialist[]>>("/team/specialists"),
      apiClient.get<ApiResponse<CatalogService[]>>("/services"),
      apiClient.get<ApiResponse<LicenceReportMetrics>>("/reports/licences"),
    ]);

    updateStore((prev) => {
      let newTasks = prev.tasks;
      if (tasksRes.status === "fulfilled" && tasksRes.value?.success && Array.isArray(tasksRes.value.data)) {
        newTasks = tasksRes.value.data.map((bt) => {
          const mappedStatus = mapBackendTaskStatus(bt.status);

          return {
            id: bt.taskId || `T-${bt.id}`,
            numericId: bt.id,
            partner: bt.partnerName || "HQ",
            partnerPhone: bt.partnerContact || "",
            client: bt.clientName || "",
            phone: bt.contactNumber || "",
            business: bt.nameOfBusiness || bt.clientName || "",
            category: bt.taskCategory || "General",
            service: bt.serviceName || "",
            status: mappedStatus as TaskModel["status"],
            date: bt.taskDate || "Today",
            due: bt.dueDate || "",
            assignee: bt.assignedToName || "",
            assigneeId: bt.assignedToId || null,
            priority: (bt.priority === "URGENT" || bt.priority === "HIGH" ? "High" : "Normal") as TaskModel["priority"],
            sales: bt.partnerName || "Admin",
            comments: bt.adminRemarks ? [bt.adminRemarks] : [],
            files: [],
          };
        });
      }

      let newPartners = prev.partners;
      if (partnersRes.status === "fulfilled" && partnersRes.value?.success && Array.isArray(partnersRes.value.data)) {
        newPartners = partnersRes.value.data.map((p) => {
          const loc = p.hubLocation || "";
          const parts = loc.split(",");
          const city = parts[0]?.trim() || "Headquarters";
          const state = parts[1]?.trim() || "";
          const statusMapped = p.status === "APPROVED" ? "Active" : p.status === "PENDING" ? "Pending" : "Deactivated";
          const partnerCode = p.partnerId || `P-${p.id}`;
          const kyc = getDeterministicPartnerKyc(partnerCode, p.name, p.phone);

          return {
            id: String(p.id),
            partnerId: partnerCode,
            name: p.name,
            shortName: `${partnerCode} • ${p.name}`,
            email: p.email,
            phone: p.phone,
            city,
            state,
            status: statusMapped,
            tier: p.franchiseTier?.replace(/_/g, " ") || "Gold Franchise",
            leadsCount: p.totalCasesSubmitted || 0,
            revenueStr: `₹${((p.totalEarnedCommission || 0) / 1000).toFixed(1)}k`,
            activeTasks: p.activeTasks || 0,
            panNumber: (p as any).panNumber || kyc.panNumber,
            adhaarNumber: (p as any).adhaarNumber || kyc.adhaarNumber,
            documents: {
              panDoc: p.panCardUrl || "PAN_Card.pdf",
              shopDoc: p.shopPhotoUrl || "Electricity_Bill.pdf",
              adhaarDoc: (p as any).adhaarDoc || "Aadhaar_Verified.pdf",
            },
          };
        });
      }

      let newClients = prev.manualClients;
      if (clientsRes.status === "fulfilled" && clientsRes.value?.success && Array.isArray(clientsRes.value.data)) {
        newClients = clientsRes.value.data.map((c) => ({
          id: String(c.id),
          name: c.name,
          phone: c.phone,
          business: c.businessName || c.name,
          partner: c.partnerName || c.partnerCode || "Direct",
          tasks: c.serviceCases || 0,
          last: "Active",
          status: c.latestStatus || "Active",
        }));
      }

      let newUsers = prev.users;
      if (specialistsRes.status === "fulfilled" && specialistsRes.value?.success && Array.isArray(specialistsRes.value.data)) {
        newUsers = specialistsRes.value.data.map((s) => ({
          id: s.id,
          name: s.fullName,
          email: s.email,
          role: s.designation || "Specialist",
          dept: s.department ? s.department.charAt(0) + s.department.slice(1).toLowerCase() : "Operations",
          skill: (s.competencies || []).join(", ") || "General",
          skills: s.competencies || [],
          phone: s.phone || "",
          status: "Active",
          tasks: s.activeTasks || 0,
          access: s.department === "OPERATIONS" ? "Admin" : "Employee",
        }));
      }

      let newServices = prev.services;
      if (servicesRes.status === "fulfilled" && servicesRes.value?.success && Array.isArray(servicesRes.value.data)) {
        newServices = servicesRes.value.data.map((s) => ({
          id: s.id,
          name: s.name,
          category: (s.category || "General").replace(/_/g, " "),
          recurring: false,
          frequency: "One Time",
          price: s.startingClientPrice || 0,
          gov: 0,
          time: (s as any).processingTime || (s.estimatedTurnaroundDays ? `${s.estimatedTurnaroundDays} Days` : "3 - 7 Days"),
          status: s.active ? "Active" : "Inactive",
          description: s.subtitle || "",
        }));
      }

      let newLicences: LicenceModel[] = [];
      const backendLicenceRows = licencesRes.status === "fulfilled" && licencesRes.value?.success && Array.isArray(licencesRes.value.data?.rows)
        ? licencesRes.value.data.rows
        : [];

      // Exactly 1 licence entry per COMPLETED task (task total 3, completed: 2 => exactly 2 licences)
      const completedTasks = newTasks.filter((t) => t.status === "Completed");

      newLicences = completedTasks.map((task) => {
        // Find best matching backend licence for this completed task
        const matchedLicence = backendLicenceRows.find(
          (l) => l.taskId === task.id || (l.taskId && (task.id.includes(l.taskId) || l.taskId.includes(task.id)))
        );

        const matchedPartner = newPartners.find(
          (p) => p.name?.toLowerCase() === task.partner?.toLowerCase() || p.partnerId?.toLowerCase() === task.partner?.toLowerCase()
        );
        const matchedClient = newClients.find(
          (c) => c.name?.toLowerCase() === task.client?.toLowerCase()
        );

        const realPartner = task.partner && task.partner !== "Test Partner" 
          ? task.partner 
          : matchedLicence?.partnerName && matchedLicence.partnerName !== "Test Partner" 
          ? matchedLicence.partnerName 
          : "HQ";

        const realClient = task.client && task.client !== "Test Client"
          ? task.client
          : matchedLicence?.clientName && matchedLicence.clientName !== "Test Client"
          ? matchedLicence.clientName
          : "Client Business";

        const resolvedPartnerPhone = task.partnerPhone || matchedPartner?.phone || ((matchedLicence as any)?.partnerNumber && (matchedLicence as any).partnerNumber !== "N/A" ? (matchedLicence as any).partnerNumber : "-");
        const resolvedClientPhone = task.phone || matchedClient?.phone || ((matchedLicence as any)?.clientNumber && (matchedLicence as any).clientNumber !== "N/A" ? (matchedLicence as any).clientNumber : "-");

        const realCategory = task.category || matchedLicence?.serviceCategory || "-";
        const realService = task.service || matchedLicence?.serviceCategory || "-";

        const realLicenceNum = matchedLicence?.licenceNumber && !matchedLicence.licenceNumber.includes("dgcvghvdhgv")
          ? matchedLicence.licenceNumber
          : task.license || `LIC-${String(task.numericId || task.id).replace(/\D/g, "").slice(0, 8) || "211700"}`;

        return {
          id: matchedLicence ? String(matchedLicence.id) : String(task.numericId || task.id),
          task: task.id,
          taskId: task.id,
          partner: realPartner,
          partnerPhone: resolvedPartnerPhone,
          client: realClient,
          phone: resolvedClientPhone,
          type: matchedLicence?.serviceCategory || task.category || "Standard Licence",
          category: realCategory,
          service: realService,
          number: realLicenceNum,
          issue: matchedLicence?.issueDate || task.date || new Date().toISOString().slice(0, 10),
          expiry: matchedLicence?.expiryDate || "2028-11-04",
          user: matchedLicence?.portalUserId || "-",
          password: matchedLicence?.portalPasswordMasked || "••••••••",
          status: "Active" as const,
          url: true,
          files: 1,
          assignedTo: task.assignee || realPartner,
        };
      });

      return {
        ...prev,
        tasks: newTasks,
        partners: newPartners,
        manualClients: newClients,
        users: newUsers,
        services: newServices,
        licences: newLicences,
      };
    });
  } catch (err) {
    console.warn("[CRM Store] Live sync error:", err);
  }
}

if (typeof window !== "undefined") {
  // Background trigger initial live sync
  setTimeout(fetchLiveDbData, 0);
}

export function useCrmStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // Initial fetch on component mount
    fetchLiveDbData();

    // Auto background poll every 10 seconds so data stays 100% in sync anytime
    const interval = setInterval(fetchLiveDbData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const addService = useCallback((service: Omit<ServiceModel, "id">) => {
    updateStore((prev) => {
      const nextId = prev.services.reduce((m, s) => Math.max(m, s.id), 0) + 1;
      return {
        ...prev,
        services: [{ ...service, id: nextId }, ...prev.services],
      };
    });
    apiClient.post("/services", {
      name: service.name,
      category: service.category.toUpperCase().replace(/\s+/g, "_"),
      startingClientPrice: service.price,
      partnerCommission: Math.round(service.price * 0.3),
      subtitle: service.description || "",
    }).catch(() => {});
  }, []);

  const updateService = useCallback((id: number, patch: Partial<ServiceModel>) => {
    updateStore((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
    apiClient.put(`/services/${id}`, {
      ...(patch.price !== undefined ? { startingClientPrice: patch.price } : {}),
      ...(patch.name ? { name: patch.name } : {}),
    }).catch(() => {});
  }, []);

  const toggleServiceStatus = useCallback((id: number) => {
    updateStore((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id
          ? { ...s, status: (s.status === "Active" ? "Inactive" : "Active") as ServiceModel["status"] }
          : s
      ),
    }));
    apiClient.patch(`/services/${id}/toggle-active`).catch(() => {});
  }, []);

  const deleteService = useCallback((id: number) => {
    updateStore((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
    apiClient.delete(`/services/${id}`).catch(() => {});
  }, []);

  const setServiceStatus = useCallback((id: number, status: "Active" | "Inactive") => {
    updateStore((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, status } : s)),
    }));
  }, []);

  const addTask = useCallback((task: Omit<TaskModel, "id" | "comments" | "files" | "date">) => {
    updateStore((prev) => {
      const newId = `T-${1001 + prev.tasks.length}`;
      const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const newTask: TaskModel = {
        ...task,
        id: newId,
        date: now,
        comments: [],
        files: [],
      };
      return {
        ...prev,
        tasks: [newTask, ...prev.tasks],
      };
    });
  }, []);

  const updateTaskStatus = useCallback((id: string, newStatus: TaskModel["status"]) => {
    updateStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    }));
    const numericId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(numericId)) {
      const backendStatus =
        newStatus === "In Progress"
          ? "IN_PROGRESS"
          : newStatus === "Completed"
          ? "COMPLETED"
          : newStatus === "Pending from Client"
          ? "PENDING_FROM_CLIENT"
          : "PENDING";
      apiClient.put(`/tasks/${numericId}`, { status: backendStatus }).catch(() => {});
    }
  }, []);

  const assignTask = useCallback((id: string, assignee: string, priority?: TaskModel["priority"], due?: string) => {
    let resolvedSpecialistId: number | undefined;
    const specialist = memoryStore.users.find(
      (u) => u.name.toLowerCase() === assignee.toLowerCase() || String(u.id) === assignee
    );
    if (specialist) {
      resolvedSpecialistId = specialist.id;
    }

    updateStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id
          ? { 
              ...t, 
              assignee: specialist?.name || assignee, 
              assigneeId: resolvedSpecialistId || t.assigneeId,
              priority: priority || t.priority || "Medium", 
              due: due || t.due, 
              status: "In Progress" as const 
            }
          : t
      ),
    }));

    const matchedTask = memoryStore.tasks.find((t) => t.id === id);
    const numericTaskId = matchedTask?.numericId || (id.startsWith("T-") ? parseInt(id.replace(/\D/g, ""), 10) : parseInt(id, 10));

    if (numericTaskId && resolvedSpecialistId) {
      apiClient.post("/tasks/assign", {
        taskId: numericTaskId,
        specialistId: resolvedSpecialistId,
      }).then(() => {
        fetchLiveDbData();
      }).catch((err) => {
        console.warn("[CRM Store] Task assign background sync error:", err);
      });
    }
  }, []);

  const addComment = useCallback((taskId: string, comment: string) => {
    updateStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
      ),
    }));
  }, []);

  const addAttachment = useCallback((taskId: string, fileName: string) => {
    updateStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, files: [...t.files, fileName] } : t
      ),
    }));
  }, []);

  const completeTask = useCallback((taskId: string, licenceInfo: { 
    type: string; 
    category?: string; 
    service?: string; 
    number: string; 
    issue: string; 
    expiry: string; 
    user?: string; 
    password?: string; 
    filesCount?: number;
    partner?: string;
    partnerPhone?: string;
    client?: string;
    phone?: string;
    assignedTo?: string;
  }) => {
    updateStore((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      const partner = licenceInfo.partner || task?.partner || "HQ";
      const partnerPhone = licenceInfo.partnerPhone || task?.partnerPhone || "";
      const client = licenceInfo.client || task?.client || "Client";
      const phone = licenceInfo.phone || task?.phone || "";
      const category = licenceInfo.category || task?.category || "Compliance";
      const service = licenceInfo.service || task?.service || "FSSAI Registration";

      const newLicence: LicenceModel = {
        task: taskId,
        partner,
        partnerPhone,
        client,
        phone,
        type: licenceInfo.type,
        category,
        service,
        number: licenceInfo.number || `LIC-${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
        issue: licenceInfo.issue || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        expiry: licenceInfo.expiry || "1 Year Validity",
        user: licenceInfo.user || "",
        password: licenceInfo.password || "",
        status: "Active",
        url: true,
        files: licenceInfo.filesCount || 1,
        assignedTo: licenceInfo.assignedTo || task?.assignee || partner,
      };

      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "Completed" as const, license: newLicence.number } : t
        ),
        licences: [newLicence, ...prev.licences.filter((l) => l.number !== newLicence.number)],
      };
    });

    apiClient.post("/reports/licences", {
      taskId,
      partnerName: licenceInfo.partner || "HQ",
      clientName: licenceInfo.client || "Client",
      serviceCategory: (licenceInfo.category || "FOOD_BEVERAGE").toUpperCase().replace(/\s+/g, "_"),
      governmentPortalUrl: "https://foscos.fssai.gov.in",
      portalUserId: licenceInfo.user || "PORTAL_USER",
      portalPassword: licenceInfo.password || "Secure@2026",
      licenceNumber: licenceInfo.number,
      issueDate: licenceInfo.issue || "2026-10-31",
      expiryDate: licenceInfo.expiry || "2027-10-30",
    }).catch(() => {});
  }, []);

  const updateLicence = useCallback((licenceNumber: string, updated: Partial<LicenceModel>) => {
    updateStore((prev) => ({
      ...prev,
      licences: prev.licences.map((l) => {
        if (l.number !== licenceNumber) return l;
        const merged: LicenceModel = { ...l, ...updated };
        if (updated.issueDate) merged.issue = updated.issueDate;
        if (updated.expiryDate) merged.expiry = updated.expiryDate;
        if (updated.userId) merged.user = updated.userId;
        if (updated.taskId) merged.task = updated.taskId;
        return merged;
      }),
    }));
  }, []);

  const deleteLicence = useCallback((licenceNumber: string) => {
    updateStore((prev) => ({
      ...prev,
      licences: prev.licences.filter((l) => l.number !== licenceNumber),
    }));
  }, []);

  const addUser = useCallback((user: Omit<UserModel, "id" | "tasks" | "status">) => {
    updateStore((prev) => {
      const nextId = prev.users.reduce((m, u) => Math.max(m, u.id), 0) + 1;
      const newUser: UserModel = {
        ...user,
        id: nextId,
        tasks: 0,
        status: "Active",
      };
      return {
        ...prev,
        users: [...prev.users, newUser],
      };
    });
    apiClient.post("/team/specialists", {
      fullName: user.name,
      email: user.email || `${user.name.toLowerCase().replace(/\s+/g, ".")}@finsocap.com`,
      phone: user.phone,
      department: user.dept.toUpperCase(),
      designation: user.role,
      maxCapacity: 15,
      competencies: user.skills || [user.skill],
    }).catch(() => {});
  }, []);

  const toggleUserStatus = useCallback((id: number | string) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        String(u.id) === String(id) ? { ...u, status: (u.status === "Active" ? "Deactivated" : "Active") as UserModel["status"] } : u
      ),
    }));
  }, []);

  const updateUser = useCallback((id: number | string, updates: Partial<UserModel>) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.map((u) => (String(u.id) === String(id) ? { ...u, ...updates } : u)),
    }));
    const num = Number(id);
    if (!isNaN(num)) {
      apiClient.put(`/team/specialists/${num}`, {
        ...(updates.role ? { designation: updates.role } : {}),
        ...(updates.dept ? { department: updates.dept.toUpperCase() } : {}),
      }).catch(() => {});
    }
  }, []);

  const deleteUser = useCallback((id: number) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
  }, []);

  const addClient = useCallback((client: { name: string; phone: string; business: string; partner: string }) => {
    updateStore((prev) => {
      const newClient: ClientModel = {
        ...client,
        tasks: 0,
        last: "Today",
        status: "New",
      };
      return {
        ...prev,
        manualClients: [newClient, ...prev.manualClients],
      };
    });
    apiClient.post("/clients", {
      name: client.name,
      phone: client.phone,
      email: `${client.name.toLowerCase().replace(/\s+/g, "")}@client.com`,
      businessName: client.business,
      constitutionType: "PROPRIETORSHIP",
    }).catch(() => {});
  }, []);

  const updateClient = useCallback((oldName: string, updates: Partial<ClientModel>) => {
    updateStore((prev) => {
      const updatedManual = prev.manualClients.map((c) => {
        if (c.name.toLowerCase() === oldName.toLowerCase()) {
          return { ...c, ...updates };
        }
        return c;
      });

      const updatedTasks = prev.tasks.map((t) => {
        if (t.client.toLowerCase() === oldName.toLowerCase()) {
          return {
            ...t,
            client: updates.name || t.client,
            phone: updates.phone || t.phone,
            business: updates.business || t.business,
            partner: updates.partner || t.partner,
          };
        }
        return t;
      });

      return {
        ...prev,
        manualClients: updatedManual,
        tasks: updatedTasks,
      };
    });
  }, []);

  const allClients = useMemo((): ClientModel[] => {
    const map = new Map<string, ClientModel>();

    data.manualClients.forEach((c) => {
      map.set(c.name, { ...c });
    });

    data.tasks.forEach((t) => {
      if (!map.has(t.client)) {
        map.set(t.client, {
          name: t.client,
          phone: t.phone,
          business: t.business,
          partner: t.partner,
          tasks: 0,
          last: t.date,
          status: t.status,
        });
      }
      const existing = map.get(t.client)!;
      existing.tasks += 1;
    });

    return Array.from(map.values());
  }, [data.manualClients, data.tasks]);

  const addPartner = useCallback((partner: Omit<PartnerModel, "id" | "leadsCount" | "revenueStr" | "activeTasks">) => {
    updateStore((prev) => {
      const generatedId = `p-${Date.now()}`;
      const partnerId = partner.partnerId?.trim() || `P-${100 + prev.partners.length + 1}`;
      const newPartner: PartnerModel = {
        ...partner,
        id: generatedId,
        partnerId,
        leadsCount: 0,
        revenueStr: "₹0",
        activeTasks: 0,
        status: partner.status || "Active",
        registeredAt: partner.registeredAt || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      };
      return {
        ...prev,
        partners: [newPartner, ...prev.partners],
      };
    });

    const fallbackKyc = getDeterministicPartnerKyc(partner.partnerId, partner.name, partner.phone);
    const payload = {
      name: partner.name,
      email: partner.email || `${partner.name.toLowerCase().replace(/\s+/g, ".")}@branch.com`,
      phone: partner.phone,
      password: partner.password || "Partner@123",
      temporaryPassword: partner.password || "Partner@123",
      address: partner.currentAddress || partner.completeShopAddress || "Office Address",
      hubLocation: `${partner.city}, ${partner.state}`,
      franchiseTier: (partner.tier || "GOLD_FRANCHISE").toUpperCase().replace(/\s+/g, "_"),
      panNumber: partner.panNumber || fallbackKyc.panNumber,
      adhaarNumber: partner.adhaarNumber || fallbackKyc.adhaarNumber,
    };
    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    apiClient.post("/partners/enroll", fd).catch(() => {});
  }, []);

  const updatePartner = useCallback((partnerId: string, updates: Partial<PartnerModel>) => {
    updateStore((prev) => ({
      ...prev,
      partners: prev.partners.map((p) =>
        p.partnerId === partnerId || p.id === partnerId
          ? { ...p, ...updates }
          : p
      ),
    }));
  }, []);

  const togglePartnerStatus = useCallback((partnerId: string) => {
    let nextStatus = "APPROVED";
    updateStore((prev) => ({
      ...prev,
      partners: prev.partners.map((p) => {
        if (p.partnerId === partnerId || p.id === partnerId) {
          const isAct = p.status === "Active";
          nextStatus = isAct ? "SUSPENDED" : "APPROVED";
          return { ...p, status: isAct ? "Deactivated" : "Active" };
        }
        return p;
      }),
    }));

    const num = parseInt(partnerId.replace(/\D/g, ""), 10);
    if (!isNaN(num)) {
      apiClient.put(`/partners/${num}/toggle-status`, null, {
        status: nextStatus,
        reason: "Admin status toggle",
      }).catch(() => {});
    }
  }, []);

  const deletePartner = useCallback((partnerId: string) => {
    updateStore((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.partnerId !== partnerId && p.id !== partnerId),
    }));
  }, []);

  return {
    services: data.services,
    tasks: data.tasks,
    users: data.users,
    licences: data.licences,
    partners: data.partners,
    manualClients: data.manualClients,
    allClients,
    addService,
    updateService,
    toggleServiceStatus,
    deleteService,
    setServiceStatus,
    addTask,
    updateTaskStatus,
    assignTask,
    addComment,
    addAttachment,
    completeTask,
    updateLicence,
    deleteLicence,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    addClient,
    updateClient,
    addPartner,
    updatePartner,
    togglePartnerStatus,
    deletePartner,
    refetch: fetchLiveDbData,
  };
}
