import { TaskItem, TaskStatus, TaskComment, TaskAttachment, CommentAttachment, TaskCertificate } from "@/types";
import { initialTasks } from "@/lib/tasksData";

const STORAGE_KEY = "finsocap_tasks_operations_v2";

function getStoredTasks(): TaskItem[] {
  if (typeof window === "undefined") return initialTasks;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
      return initialTasks;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialTasks;
  }
}

function setStoredTasks(tasks: TaskItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("[taskService] Failed to persist tasks:", e);
  }
}

export const taskService = {
  // Get all tasks
  getAll: async (): Promise<TaskItem[]> => {
    return getStoredTasks();
  },

  // Get task by ID
  getById: async (id: string): Promise<TaskItem | null> => {
    const tasks = getStoredTasks();
    return tasks.find((t) => t.id === id) || null;
  },

  // Create new task
  createTask: async (taskData: Partial<TaskItem> & { clientName: string; clientContact: string }): Promise<TaskItem> => {
    const tasks = getStoredTasks();
    const newTask: TaskItem = {
      id: taskData.id || `T-${1000 + tasks.length + 1}`,
      partnerId: taskData.partnerId || "P-101",
      partnerName: taskData.partnerName || "Rahul Jha",
      partnerContact: taskData.partnerContact || "9873207632",
      clientName: taskData.clientName,
      clientContact: taskData.clientContact,
      nameOfBusiness: taskData.nameOfBusiness || "—",
      taskCategory: taskData.taskCategory || "Compliance",
      serviceName: taskData.serviceName || "FSSAI Registration",
      status: taskData.status || "Pending",
      taskDate: taskData.taskDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      dueDate: taskData.dueDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      overdueDays: taskData.overdueDays ?? 0,
      comments: taskData.comments || [],
      attachments: taskData.attachments || [],
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: taskData.status || "Pending",
          title: "Task created in workflow queue",
          timestamp: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          updatedBy: "Admin",
        },
      ],
      certificates: [],
    };
    tasks.unshift(newTask);
    setStoredTasks([...tasks]);
    return newTask;
  },

  // Update status with history tracking
  updateStatus: async (id: string, newStatus: TaskStatus, updatedBy = "Admin"): Promise<TaskItem | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;

    task.status = newStatus;
    if (!task.statusHistory) task.statusHistory = [];
    task.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      status: newStatus,
      title: `Status changed to ${newStatus}`,
      timestamp: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedBy,
    });

    setStoredTasks([...tasks]);
    return task;
  },

  // Add Comment with optional attachments
  addComment: async (
    taskId: string, 
    text: string, 
    attachments?: CommentAttachment[], 
    userName = "Ankit Sharma", 
    userRole = "Admin"
  ): Promise<TaskComment | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    if (!task.comments) task.comments = [];
    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      userName,
      userRole,
      text,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      timestamp: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    task.comments.unshift(newComment);
    setStoredTasks([...tasks]);
    return newComment;
  },

  // Add Attachment to Task
  addAttachment: async (taskId: string, attachment: Omit<TaskAttachment, "id">): Promise<TaskAttachment | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    if (!task.attachments) task.attachments = [];
    const newAtt: TaskAttachment = {
      ...attachment,
      id: `att-${Date.now()}`,
    };
    task.attachments.unshift(newAtt);
    setStoredTasks([...tasks]);
    return newAtt;
  },

  // Add Certificate to Task
  addCertificate: async (taskId: string, certificate: Omit<TaskCertificate, "id">): Promise<TaskCertificate | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    if (!task.certificates) task.certificates = [];
    const newCert: TaskCertificate = {
      ...certificate,
      id: `cert-${Date.now()}`,
    };
    task.certificates.unshift(newCert);

    // Also auto-update status to Completed if not already
    task.status = "Completed";
    if (!task.statusHistory) task.statusHistory = [];
    task.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      status: "Completed",
      title: `Certificate ${newCert.certificateNumber} issued & submitted`,
      timestamp: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedBy: certificate.submittedBy || "Admin",
    });

    setStoredTasks([...tasks]);
    return newCert;
  },

  // Complete task with full licence metadata
  completeTaskWithLicence: async (
    taskId: string, 
    details: { 
      licenceType: string; 
      category: string; 
      service: string; 
      licenceNumber: string; 
      issueDate: string; 
      expiryDate: string; 
      userId?: string; 
      password?: string; 
      fileName?: string;
    }
  ): Promise<TaskItem | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = "Completed";
    task.license = details.licenceNumber;

    if (!task.certificates) task.certificates = [];
    task.certificates.unshift({
      id: `cert-${Date.now()}`,
      certificateNumber: details.licenceNumber,
      certificateName: `${details.service} - ${details.licenceType}`,
      issuedDate: details.issueDate,
      validTill: details.expiryDate,
      submittedBy: "Admin",
      submittedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      fileName: details.fileName || `${details.service.replace(/\s+/g, "_")}_Official_Certificate.pdf`,
      fileUrl: "/placeholder-cert.pdf",
      status: "Active",
    });

    if (!task.statusHistory) task.statusHistory = [];
    task.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      status: "Completed",
      title: `Task completed. ${details.licenceType} #${details.licenceNumber} issued.`,
      timestamp: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedBy: "Admin",
    });

    setStoredTasks([...tasks]);
    return task;
  },

  // Update task details (full edit/modify)
  updateTask: async (id: string, updates: Partial<TaskItem>, updatedBy = "Admin"): Promise<TaskItem | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;

    Object.assign(task, updates);

    if (!task.statusHistory) task.statusHistory = [];
    task.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      status: task.status,
      title: `Task information modified by ${updatedBy}`,
      timestamp: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedBy,
    });

    setStoredTasks([...tasks]);
    return task;
  },

  // Get all issued certificates across all tasks
  getAllCertificates: async (): Promise<{ task: TaskItem; certificate: TaskCertificate }[]> => {
    const tasks = getStoredTasks();
    const results: { task: TaskItem; certificate: TaskCertificate }[] = [];
    tasks.forEach((t) => {
      if (t.certificates && t.certificates.length > 0) {
        t.certificates.forEach((c) => {
          results.push({ task: t, certificate: c });
        });
      }
    });
    return results;
  },
};
