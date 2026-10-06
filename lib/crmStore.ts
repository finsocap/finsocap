import { useSyncExternalStore, useCallback, useMemo, useEffect } from "react";
import { api } from "./apiClient";

export interface ServiceModel {
  id: number;
  name: string;
  category: string;
  recurring: boolean;
  frequency: string;
  price: number;
  gov: number;
  time: string;
  status: "Active" | "Inactive" | "Draft";
  description?: string;
}

export interface TaskModel {
  id: string;
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
  skills?: string[]; // Multiple service skill categories matching catalog
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
  id: string; // "p-101", etc.
  partnerId: string; // "P-101", etc.
  name: string;
  shortName: string;
  email?: string;
  phone: string;
  userId?: string; // defaults to phone number
  password?: string;
  dob?: string;
  shopName?: string;
  currentAddress?: string; // Shop live/exact location
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

const defaultServices: ServiceModel[] = [
  { id: 1, name: "FSSAI Registration (Basic)", category: "Food & Beverage", recurring: true, frequency: "Yearly", price: 4700, gov: 100, time: "1 - 3 Days", status: "Active" },
  { id: 2, name: "FSSAI State License", category: "Food & Beverage", recurring: true, frequency: "Yearly", price: 7500, gov: 2000, time: "7 - 15 Days", status: "Active" },
  { id: 3, name: "FSSAI Central License", category: "Food & Beverage", recurring: true, frequency: "Yearly", price: 12000, gov: 7500, time: "15 - 30 Days", status: "Active" },
  { id: 4, name: "GST Registration", category: "Taxation", recurring: false, frequency: "One Time", price: 3500, gov: 0, time: "3 - 7 Days", status: "Active" },
  { id: 5, name: "GST Return Filing", category: "Taxation", recurring: true, frequency: "Monthly", price: 750, gov: 0, time: "1 - 2 Days", status: "Active" },
  { id: 6, name: "ITR Filing (Individual)", category: "Taxation", recurring: false, frequency: "One Time", price: 1000, gov: 0, time: "1 - 2 Days", status: "Active" },
  { id: 7, name: "Trademark Registration", category: "Intellectual Property", recurring: false, frequency: "One Time", price: 8000, gov: 4500, time: "3 - 6 Months", status: "Active" },
  { id: 8, name: "Shop Act / Trade License", category: "Business Compliance", recurring: false, frequency: "One Time", price: 1000, gov: 0, time: "7 - 15 Days", status: "Active" },
  { id: 9, name: "Import Export (IEC Registration)", category: "Import Export", recurring: false, frequency: "One Time", price: 3500, gov: 0, time: "7 - 10 Days", status: "Active" },
  { id: 10, name: "Digital Signature Certificate (DSC)", category: "Digital Services", recurring: false, frequency: "One Time", price: 1500, gov: 0, time: "1 - 2 Days", status: "Active" },
  { id: 11, name: "Zomato Onboarding", category: "Business Growth", recurring: false, frequency: "One Time", price: 1000, gov: 0, time: "3 - 5 Days", status: "Active" },
  { id: 12, name: "Swiggy Onboarding", category: "Business Growth", recurring: false, frequency: "One Time", price: 1000, gov: 0, time: "3 - 5 Days", status: "Active" },
];

const defaultTasks: TaskModel[] = [
  { id: "T-1001", partner: "Rahul Jha", partnerPhone: "9873207632", client: "Amit Kumar", phone: "9876543210", business: "Shri Foods", category: "Compliance", service: "FSSAI Registration (Basic)", status: "Pending", date: "10 Sep 2026", due: "20 Sep 2026", assignee: "Ankit Kumar", priority: "High", sales: "Rahul Jha", comments: ["Application draft prepared. Waiting for client confirmation.", "Client has shared address proof."], files: ["Address Proof.pdf", "ID Proof.pdf", "Business Photo.jpg"] },
  { id: "T-1002", partner: "Kanhaiya", partnerPhone: "7011340730", client: "Neha Verma", phone: "9899989898", business: "Fresh Bites", category: "Taxation", service: "GST Registration", status: "In Progress", date: "12 Sep 2026", due: "18 Sep 2026", assignee: "Pooja Mehta", priority: "Medium", sales: "Kanhaiya", comments: ["Documents verified."], files: ["PAN.pdf"] },
  { id: "T-1003", partner: "Gaurav", partnerPhone: "9312345678", client: "Rohit Sharma", phone: "9876123456", business: "Sharma Traders", category: "Licensing", service: "Shop Act / Trade License", status: "Sent for Review", date: "14 Sep 2026", due: "21 Sep 2026", assignee: "Neha Verma", priority: "Normal", sales: "Rahul Jha", comments: [], files: ["Application.pdf"] },
  { id: "T-1004", partner: "Roshan", partnerPhone: "9998887776", client: "Pooja Mehta", phone: "9877001122", business: "Mehta Enterprises", category: "Compliance", service: "FSSAI State License", status: "Pending from Client", date: "16 Sep 2026", due: "25 Sep 2026", assignee: "Ankit Kumar", priority: "High", sales: "Kanhaiya", comments: ["Need updated rental agreement."], files: [] },
  { id: "T-1005", partner: "Roshni", partnerPhone: "8887776655", client: "Vikram Singh", phone: "9855221133", business: "VS Exports", category: "Import Export", service: "Import Export (IEC Registration)", status: "Pending from Department", date: "18 Sep 2026", due: "28 Sep 2026", assignee: "Gaurav Sharma", priority: "Normal", sales: "Gaurav Sharma", comments: [], files: ["IEC form.pdf"] },
  { id: "T-1006", partner: "Rahul Jha", partnerPhone: "9873207632", client: "Priya Sinha", phone: "9876549876", business: "Priya Cafe", category: "IPR", service: "Trademark Registration", status: "Completed", date: "20 Sep 2026", due: "26 Sep 2026", assignee: "Rohit Jain", priority: "Normal", sales: "Rahul Jha", comments: ["Certificate delivered."], files: ["Trademark Certificate.pdf"], license: "TM-2026-0158" },
  { id: "T-1007", partner: "Kanhaiya", partnerPhone: "7011340730", client: "Sandeep Jain", phone: "9898001122", business: "Jain Enterprises", category: "Compliance", service: "Digital Signature Certificate (DSC)", status: "Pending", date: "21 Sep 2026", due: "29 Sep 2026", assignee: "Pooja Mehta", priority: "High", sales: "Kanhaiya", comments: [], files: [] },
  { id: "T-1008", partner: "Gaurav", partnerPhone: "9312345678", client: "Anjali Verma", phone: "9871234567", business: "Anjali Foods", category: "Business Growth", service: "Zomato Onboarding", status: "Pending from Client", date: "22 Sep 2026", due: "27 Sep 2026", assignee: "", priority: "Normal", sales: "Gaurav Sharma", comments: [], files: [] },
];

const defaultUsers: UserModel[] = [
  { id: 1, name: "Ankit Kumar", email: "ankit.kumar@finsocap.com", role: "Executive", dept: "Operations", skill: "Food & Beverage, Compliance", skills: ["Food & Beverage", "Compliance", "Business Compliance"], phone: "8505828033", password: "Password@123", status: "Active", tasks: 33 },
  { id: 2, name: "Pooja Mehta", email: "pooja.mehta@finsocap.com", role: "CA", dept: "Taxation", skill: "Taxation", skills: ["Taxation"], phone: "8796951056", password: "Password@123", status: "Active", tasks: 34 },
  { id: 3, name: "Rohit Jain", email: "rohit.jain@finsocap.com", role: "CS", dept: "Compliance", skill: "Intellectual Property, Compliance", skills: ["Intellectual Property", "Compliance"], phone: "9355749363", password: "Password@123", status: "Active", tasks: 3 },
  { id: 4, name: "Neha Verma", email: "neha.verma@finsocap.com", role: "Legal Executive", dept: "Legal", skill: "Business Compliance, Licensing", skills: ["Business Compliance", "Licensing", "Compliance"], phone: "9811637390", password: "Password@123", status: "Active", tasks: 1 },
  { id: 5, name: "Gaurav Sharma", email: "gaurav.sharma@finsocap.com", role: "Executive", dept: "Operations", skill: "Import Export, Taxation, Digital Services", skills: ["Import Export", "Taxation", "Digital Services"], phone: "9873207632", password: "Password@123", status: "Active", tasks: 14 },
  { id: 6, name: "Rahul Jha", email: "rahul.jha@finsocap.com", role: "Manager", dept: "Franchise Partner", skill: "Compliance, Food & Beverage", skills: ["Compliance", "Food & Beverage"], phone: "9873207632", password: "Password@123", status: "Active", tasks: 22 },
];

// 10 Real Verified Entries matching Screenshot 3 Exactly
const defaultLicences: LicenceModel[] = [
  { task: "T-1001", partner: "Rahul Jha", partnerPhone: "9873207632", client: "SunBounty India", phone: "9818176909", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "22726922001382", issue: "26-09-2026", expiry: "25-09-2027", user: "UPFSSAI123", password: "Abc@1234", status: "Active", url: true, files: 2, assignedTo: "Rahul Jha" },
  { task: "T-1002", partner: "Rahul Jha", partnerPhone: "9873207632", client: "Mahalaxmi Chhola bhatura", phone: "7007433823", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "22725271000986", issue: "26-09-2026", expiry: "05-10-2028", user: "UPFSSAI456", password: "Xyz@5678", status: "Expiring in 30 Days", url: true, files: 1, assignedTo: "Rahul Jha" },
  { task: "T-1003", partner: "Kanhaiya", partnerPhone: "8796951056", client: "Kushali Ventures", phone: "9412128685", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "22726877000140", issue: "25-09-2026", expiry: "24-09-2027", user: "UPFSSAI789", password: "Test@123", status: "Active", url: true, files: 3, assignedTo: "Kanhaiya" },
  { task: "T-1004", partner: "Kanhaiya", partnerPhone: "8796951056", client: "Divine brew and bites", phone: "9426110441", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "20726015001176", issue: "23-09-2026", expiry: "22-09-2027", user: "UPFSSAI321", password: "Pass@456", status: "Active", url: true, files: 1, assignedTo: "Kanhaiya" },
  { task: "T-1005", partner: "Gaurav", partnerPhone: "9355749363", client: "Miglani Retail", phone: "9718710045", type: "FSSAI Central Licence", category: "Compliance", service: "FSSAI Registration", number: "13325999000692", issue: "15-10-2025", expiry: "13-10-2026", user: "CENTFSSAI01", password: "Demo@789", status: "Expiring in 30 Days", url: true, files: 2, assignedTo: "Gaurav" },
  { task: "T-1006", partner: "Gaurav", partnerPhone: "9355749363", client: "GAURAV SHISHODIA", phone: "8171144666", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "22724999000371", issue: "25-09-2026", expiry: "29-09-2031", user: "UPFSSAI654", password: "Aa@1122", status: "Active", url: true, files: 1, assignedTo: "Gaurav" },
  { task: "T-1007", partner: "Roshan", partnerPhone: "9873207632", client: "SANVIN INC", phone: "9811176768", type: "FSSAI Central Licence", category: "Compliance", service: "FSSAI Registration", number: "12721999000371", issue: "25-09-2026", expiry: "19-10-2031", user: "CENTFSSAI02", password: "Bb@3344", status: "Active", url: true, files: 2, assignedTo: "Roshan" },
  { task: "T-1008", partner: "Roshan", partnerPhone: "9873207632", client: "Kulcha and Parantha Co", phone: "7206666744", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "20826001001474", issue: "24-09-2026", expiry: "23-09-2027", user: "UPFSSAI987", password: "Cc@5566", status: "Active", url: true, files: 1, assignedTo: "Roshan" },
  { task: "T-1009", partner: "Roshni", partnerPhone: "9811637390", client: "Narula food and Beverages", phone: "9058063705", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "20926016000079", issue: "10-09-2026", expiry: "09-09-2027", user: "UPFSSAI654", password: "Dd@7788", status: "Active", url: true, files: 3, assignedTo: "Roshni" },
  { task: "T-1010", partner: "Roshni", partnerPhone: "9811637390", client: "SABER DINING", phone: "7264040445", type: "FSSAI Basic Licence", category: "Compliance", service: "FSSAI Registration", number: "21526083016333", issue: "22-09-2026", expiry: "21-09-2027", user: "UPFSSAI111", password: "Ee@9900", status: "Active", url: false, files: 1, assignedTo: "Roshni" },
];

export const defaultPartners: PartnerModel[] = [
  {
    id: "p-101",
    partnerId: "P-101",
    name: "Rahul Jha",
    shortName: "P-101 • Rahul Jha",
    email: "rahul.jha@finsocap.com",
    phone: "9873207632",
    city: "Patna",
    state: "Bihar",
    status: "Active",
    tier: "Gold Franchise",
    registeredAt: "10 Jan 2026",
    leadsCount: 512,
    revenueStr: "₹3.84L",
    activeTasks: 38,
  },
  {
    id: "p-102",
    partnerId: "P-102",
    name: "Kanhaiya",
    shortName: "P-102 • Kanhaiya",
    email: "kanhaiya@finsocap.com",
    phone: "7011340730",
    city: "Noida",
    state: "Uttar Pradesh",
    status: "Active",
    tier: "Silver Franchise",
    registeredAt: "14 Jan 2026",
    leadsCount: 224,
    revenueStr: "₹1.48L",
    activeTasks: 18,
  },
  {
    id: "p-103",
    partnerId: "P-103",
    name: "Gaurav Sharma",
    shortName: "P-103 • Gaurav",
    email: "gaurav.sharma@finsocap.com",
    phone: "9312345678",
    city: "Mumbai",
    state: "Maharashtra",
    status: "Active",
    tier: "Gold Franchise",
    registeredAt: "22 Jan 2026",
    leadsCount: 286,
    revenueStr: "₹2.12L",
    activeTasks: 22,
  },
  {
    id: "p-104",
    partnerId: "P-104",
    name: "Roshan Enterprises",
    shortName: "P-104 • Roshan",
    email: "roshan@finsocap.com",
    phone: "9998887776",
    city: "Bengaluru",
    state: "Karnataka",
    status: "Active",
    tier: "Bronze Franchise",
    registeredAt: "05 Feb 2026",
    leadsCount: 136,
    revenueStr: "₹88K",
    activeTasks: 12,
  },
  {
    id: "p-105",
    partnerId: "P-105",
    name: "Roshni Roy",
    shortName: "P-105 • Roshni",
    email: "roshni.roy@finsocap.com",
    phone: "8887776655",
    city: "Kolkata",
    state: "West Bengal",
    status: "Active",
    tier: "Bronze Franchise",
    registeredAt: "18 Feb 2026",
    leadsCount: 90,
    revenueStr: "₹40.5K",
    activeTasks: 6,
  },
];

interface CrmData {
  services: ServiceModel[];
  tasks: TaskModel[];
  users: UserModel[];
  licences: LicenceModel[];
  manualClients: ClientModel[];
  partners: PartnerModel[];
}

function loadInitialData(): CrmData {
  if (typeof window === "undefined") {
    return {
      services: defaultServices,
      tasks: defaultTasks,
      users: defaultUsers,
      licences: defaultLicences,
      manualClients: [],
      partners: defaultPartners,
    };
  }

  try {
    const raw = localStorage.getItem("finsocap-crm-data");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure licences include verified default entries and credentials
      const storedLicences: LicenceModel[] = parsed.licences || [];
      const hasFullLicences = storedLicences.length >= 10 && storedLicences.some((l) => !!l.password);
      
      return {
        services: parsed.services && parsed.services.length > 0 ? parsed.services : defaultServices,
        tasks: parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : defaultTasks,
        users: parsed.users && parsed.users.length > 0 ? parsed.users : defaultUsers,
        licences: hasFullLicences ? storedLicences : defaultLicences,
        manualClients: parsed.manualClients || [],
        partners: parsed.partners && parsed.partners.length > 0 ? parsed.partners : defaultPartners,
      };
    }
  } catch (e) {
    console.error("Failed to parse localStorage crm data", e);
  }

  return {
    services: defaultServices,
    tasks: defaultTasks,
    users: defaultUsers,
    licences: defaultLicences,
    manualClients: [],
    partners: defaultPartners,
  };
}

// Global Single In-Memory Store
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
  services: defaultServices,
  tasks: defaultTasks,
  users: defaultUsers,
  licences: defaultLicences,
  manualClients: [],
  partners: defaultPartners,
};

function getServerSnapshot(): CrmData {
  return serverSnapshot;
}

function updateStore(updater: (prev: CrmData) => CrmData) {
  memoryStore = updater(memoryStore);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("finsocap-crm-data", JSON.stringify(memoryStore));
    } catch (e) {
      console.error("Failed to save crm data", e);
    }
  }
  // Notify listeners outside of React's synchronous render cycle
  listeners.forEach((listener) => listener());
}

// Fetch live database updates on load
let hasFetchedFromApi = false;
async function fetchLiveDbData() {
  if (typeof window === "undefined" || hasFetchedFromApi) return;
  hasFetchedFromApi = true;

  try {
    const [servicesRes, tasksRes, partnersRes] = await Promise.all([
      api.get<ServiceModel[]>("/services"),
      api.get<TaskModel[]>("/tasks"),
      api.get<PartnerModel[]>("/partners"),
    ]);

    if (servicesRes.success && Array.isArray(servicesRes.data) && servicesRes.data.length > 0) {
      updateStore((prev) => ({ ...prev, services: servicesRes.data! }));
    }
    if (tasksRes.success && Array.isArray(tasksRes.data) && tasksRes.data.length > 0) {
      updateStore((prev) => ({ ...prev, tasks: tasksRes.data! }));
    }
    if (partnersRes.success && Array.isArray(partnersRes.data) && partnersRes.data.length > 0) {
      updateStore((prev) => ({ ...prev, partners: partnersRes.data! }));
    }
  } catch (err) {
    console.warn("Live API background sync fallback:", err);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "finsocap-crm-data") {
      memoryStore = loadInitialData();
      listeners.forEach((listener) => listener());
    }
  });

  // Initial fetch from live API
  setTimeout(fetchLiveDbData, 300);
}

export function useCrmStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    fetchLiveDbData();
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
  }, []);

  const updateService = useCallback((id: number, patch: Partial<ServiceModel>) => {
    updateStore((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
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
  }, []);

  const deleteService = useCallback((id: number) => {
    updateStore((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
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

    // Synchronize to standalone backend REST API
    api.post("/tasks", task).catch(() => {});
  }, []);

  const updateTaskStatus = useCallback((id: string, newStatus: TaskModel["status"]) => {
    updateStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    }));

    // Synchronize to standalone backend REST API
    api.put(`/tasks/${id}`, { status: newStatus }).catch(() => {});
  }, []);

  const assignTask = useCallback((id: string, assignee: string, priority: TaskModel["priority"], due: string) => {
    updateStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id
          ? { ...t, assignee, priority, due, status: "In Progress" as const }
          : t
      ),
    }));
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
      const partner = licenceInfo.partner || task?.partner || "Rahul Jha";
      const partnerPhone = licenceInfo.partnerPhone || task?.partnerPhone || "9873207632";
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

    // Synchronize to standalone backend REST API
    api.post(`/tasks/${taskId}/complete`, {
      licenseNumber: licenceInfo.number,
      clientName: licenceInfo.client,
      clientNumber: licenceInfo.phone,
      partnerName: licenceInfo.partner,
      partnerNumber: licenceInfo.partnerPhone,
      serviceName: licenceInfo.service,
      type: licenceInfo.type,
      issueDate: licenceInfo.issue,
      expiryDate: licenceInfo.expiry,
      portalUser: licenceInfo.user,
      portalPassword: licenceInfo.password,
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
        if (updated.issue) merged.issueDate = updated.issue;
        if (updated.expiry) merged.expiryDate = updated.expiry;
        if (updated.user) merged.userId = updated.user;
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

    // Synchronize to standalone backend REST API
    api.post("/crm/users", user).catch(() => {});
  }, []);

  const toggleUserStatus = useCallback((id: number) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === id ? { ...u, status: (u.status === "Active" ? "Deactivated" : "Active") as UserModel["status"] } : u
      ),
    }));
  }, []);

  const updateUser = useCallback((id: number, updates: Partial<UserModel>) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));

    // Synchronize to standalone backend REST API
    api.put(`/crm/users/${id}`, updates).catch(() => {});
  }, []);

  const deleteUser = useCallback((id: number) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));

    // Synchronize to standalone backend REST API
    api.delete(`/crm/users/${id}`).catch(() => {});
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

    // Synchronize to standalone backend REST API
    api.post("/crm/clients", client).catch(() => {});
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

  // Computed Clients derived from tasks + manual clients
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

    // Synchronize to standalone backend REST API
    api.post("/partners/register", partner).catch(() => {});
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

    // Synchronize to standalone backend REST API
    api.put(`/partners/${partnerId}`, updates).catch(() => {});
  }, []);

  const togglePartnerStatus = useCallback((partnerId: string) => {
    updateStore((prev) => ({
      ...prev,
      partners: prev.partners.map((p) =>
        p.partnerId === partnerId || p.id === partnerId
          ? { ...p, status: p.status === "Active" ? "Deactivated" : "Active" }
          : p
      ),
    }));

    // Synchronize to standalone backend REST API
    api.patch(`/partners/${partnerId}/toggle-status`).catch(() => {});
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
  };
}
