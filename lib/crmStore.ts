"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";

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
  role: string;
  dept: string;
  skill: string;
  phone: string;
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

export interface LicenceModel {
  task: string;
  partner: string;
  partnerPhone: string;
  client: string;
  phone: string;
  type: string;
  category: string;
  service: string;
  number: string;
  issue: string;
  expiry: string;
  user: string;
  status: "Active" | "Expiring Soon" | "Expired";
  url: boolean;
  files: number;
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
  { id: "T-1008", partner: "Gaurav", partnerPhone: "9312345678", client: "Anjali Verma", phone: "9871234567", business: "Anjali Foods", category: "Marketing", service: "Zomato Onboarding", status: "Pending from Client", date: "22 Sep 2026", due: "27 Sep 2026", assignee: "", priority: "Normal", sales: "Gaurav Sharma", comments: [], files: [] },
];

const defaultUsers: UserModel[] = [
  { id: 1, name: "Ankit Kumar", role: "Executive", dept: "Operations", skill: "FSSAI, GST", phone: "8505828033", status: "Active", tasks: 33 },
  { id: 2, name: "Pooja Mehta", role: "CA", dept: "Taxation", skill: "GST, ITR", phone: "8796951056", status: "Active", tasks: 34 },
  { id: 3, name: "Rohit Jain", role: "CS", dept: "Compliance", skill: "Trademark", phone: "9355749363", status: "Active", tasks: 3 },
  { id: 4, name: "Neha Verma", role: "Legal Executive", dept: "Legal", skill: "Licensing", phone: "9811637390", status: "Active", tasks: 1 },
  { id: 5, name: "Gaurav Sharma", role: "Executive", dept: "Operations", skill: "IEC, GST", phone: "9873207632", status: "Active", tasks: 14 },
];

const defaultLicences: LicenceModel[] = [
  { task: "T-1001", partner: "Rahul Jha", partnerPhone: "9873207632", client: "Amit Kumar", phone: "9876543210", type: "FSSAI Basic License", category: "Compliance", service: "FSSAI Registration", number: "22726922001382", issue: "26 Sep 2026", expiry: "25 Sep 2027", user: "UPFSSAI123", status: "Active", url: true, files: 2 },
  { task: "T-1002", partner: "Kanhaiya", partnerPhone: "7011340730", client: "Neha Verma", phone: "9899989898", type: "FSSAI Basic License", category: "Compliance", service: "FSSAI Registration", number: "22725271000986", issue: "26 Sep 2026", expiry: "05 Oct 2026", user: "UPFSSAI456", status: "Expiring Soon", url: false, files: 1 },
  { task: "T-1006", partner: "Rahul Jha", partnerPhone: "9873207632", client: "Priya Sinha", phone: "9876549876", type: "Trademark Certificate", category: "IPR", service: "Trademark Registration", number: "TM-2026-0158", issue: "20 Sep 2026", expiry: "20 Sep 2036", user: "", status: "Active", url: true, files: 1 },
];

interface CrmData {
  services: ServiceModel[];
  tasks: TaskModel[];
  users: UserModel[];
  licences: LicenceModel[];
  manualClients: ClientModel[];
}

function loadInitialData(): CrmData {
  if (typeof window === "undefined") {
    return {
      services: defaultServices,
      tasks: defaultTasks,
      users: defaultUsers,
      licences: defaultLicences,
      manualClients: [],
    };
  }

  try {
    const raw = localStorage.getItem("finsocap-crm-data");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        services: parsed.services || defaultServices,
        tasks: parsed.tasks || defaultTasks,
        users: parsed.users || defaultUsers,
        licences: parsed.licences || defaultLicences,
        manualClients: parsed.manualClients || [],
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

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "finsocap-crm-data") {
      memoryStore = loadInitialData();
      listeners.forEach((listener) => listener());
    }
  });
}

export function useCrmStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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

  const completeTask = useCallback((taskId: string, licenceInfo: { type: string; number: string; issue: string; expiry: string; filesCount?: number }) => {
    updateStore((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const newLicence: LicenceModel = {
        task: task.id,
        partner: task.partner,
        partnerPhone: task.partnerPhone,
        client: task.client,
        phone: task.phone,
        type: licenceInfo.type,
        category: task.category,
        service: task.service,
        number: licenceInfo.number || "Pending Issuance",
        issue: licenceInfo.issue || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        expiry: licenceInfo.expiry || "1 Year Validity",
        user: "",
        status: "Active",
        url: false,
        files: licenceInfo.filesCount || 1,
      };

      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "Completed" as const, license: licenceInfo.number } : t
        ),
        licences: [newLicence, ...prev.licences],
      };
    });
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
  }, []);

  const toggleUserStatus = useCallback((id: number) => {
    updateStore((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === id ? { ...u, status: (u.status === "Active" ? "Deactivated" : "Active") as UserModel["status"] } : u
      ),
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

  return {
    services: data.services,
    tasks: data.tasks,
    users: data.users,
    licences: data.licences,
    allClients,
    addService,
    updateService,
    toggleServiceStatus,
    addTask,
    updateTaskStatus,
    assignTask,
    addComment,
    addAttachment,
    completeTask,
    addUser,
    toggleUserStatus,
    addClient,
  };
}
