import { TaskItem, TaskStatus, TaskComment, TaskAttachment, CommentAttachment, TaskCertificate, canTransitionStatus } from "@/types";
import { initialTasks } from "@/lib/tasksData";
import { calculateOverdueDays } from "@/lib/dateRangeHelper";
import { mapBackendTaskStatus } from "@/lib/formatters";

// In-memory tasks cache (strictly live / no localStorage quota overflow)
let memoryTasks: TaskItem[] = [];

function getStoredTasks(): TaskItem[] {
  return memoryTasks;
}

function setStoredTasks(tasks: TaskItem[]): void {
  memoryTasks = tasks;
}

export const taskService = {
  // Get all tasks
  getAll: async (): Promise<TaskItem[]> => {
    return getStoredTasks();
  },

  // Get task by ID
  getById: async (id: string): Promise<TaskItem | null> => {
    // 1. Fetch from Live Backend API via proxy first so we always have the real database state
    try {
      let apiTask: any = null;

      // Check if id is purely digits (e.g. "1")
      if (/^\d+$/.test(id)) {
        try {
          const res = await fetch(`/api/proxy/tasks/${id}`);
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json?.data) {
              apiTask = json.data;
            }
          }
        } catch (e) {}
      }

      // If id is "T-1" or "T-1001", try pure numeric ID too
      if (!apiTask && /^T-\d+$/i.test(id)) {
        const rawNum = id.replace(/\D/g, "");
        try {
          const res = await fetch(`/api/proxy/tasks/${rawNum}`);
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json?.data) {
              apiTask = json.data;
            }
          }
        } catch (e) {}
      }

      // Search by code / keyword (e.g. T-472fd8d9... or T-100)
      if (!apiTask) {
        try {
          const res = await fetch(`/api/proxy/tasks?search=${encodeURIComponent(id)}`);
          if (res.ok) {
            const json = await res.json();
            if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
              apiTask = json.data.find((item: any) => 
                item.taskId === id || 
                item.requestCode === id || 
                String(item.id) === id ||
                item.taskId?.toLowerCase() === id.toLowerCase() ||
                (id.startsWith("T-") && item.taskId?.toLowerCase().startsWith(id.toLowerCase()))
              );
            }
          }
        } catch (e) {}
      }

      // Try fetching all tasks from /api/proxy/tasks
      if (!apiTask) {
        try {
          const res = await fetch(`/api/proxy/tasks`);
          if (res.ok) {
            const json = await res.json();
            if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
              apiTask = json.data.find((item: any) => 
                item.taskId === id || 
                item.requestCode === id || 
                String(item.id) === id ||
                item.taskId?.toLowerCase() === id.toLowerCase() ||
                (id.startsWith("T-") && item.taskId?.toLowerCase().startsWith(id.toLowerCase()))
              );
            }
          }
        } catch (e) {}
      }

      // Also try staff endpoint if still not found
      if (!apiTask) {
        try {
          const staffRes = await fetch(`/api/proxy/staff/tasks`);
          if (staffRes.ok) {
            const json = await staffRes.json();
            const items = json?.data?.items || (Array.isArray(json?.data) ? json.data : []);
            if (Array.isArray(items) && items.length > 0) {
              const found = items.find((it: any) => 
                it.requestCode === id || 
                String(it.id) === id ||
                it.requestCode?.toLowerCase() === id.toLowerCase() ||
                (id.startsWith("T-") && it.requestCode?.toLowerCase().startsWith(id.toLowerCase()))
              );
              if (found) {
                apiTask = found;
              }
            }
          }
        } catch (e) {}
      }

      if (apiTask) {
        // Fetch detailed service-request to obtain live history & audit trail for this specific request
        let serviceRequestHistory: any[] = [];
        const numericSrId = typeof apiTask.id === "number" ? apiTask.id : Number(apiTask.id);
        if (numericSrId > 0) {
          try {
            const srRes = await fetch(`/api/proxy/service-requests/${numericSrId}`, { cache: "no-store" });
            if (srRes.ok) {
              const srJson = await srRes.json();
              if (srJson?.success && srJson?.data) {
                if (Array.isArray(srJson.data.history)) {
                  serviceRequestHistory = srJson.data.history;
                }
                // Keep version freshest
                if (typeof srJson.data.version === "number") {
                  apiTask.version = srJson.data.version;
                }
              }
            }
          } catch (srErr) {
            console.warn("[taskService.getById] Live service-request detail warning:", srErr);
          }
        }

        // Map live backend history items to UI StatusHistory objects
        const liveStatusHistory = serviceRequestHistory.length > 0
          ? serviceRequestHistory.map((h: any) => {
              let title = h.note;
              if (!title) {
                if (h.type === "STATUS_CHANGED") {
                  title = `Status updated to ${mapBackendTaskStatus(h.status)}`;
                } else if (h.type === "ASSIGNED") {
                  title = "Task assigned to specialist";
                } else if (h.type === "UNASSIGNED") {
                  title = "Task unassigned";
                } else if (h.type === "ASSIGNMENT_UPDATED") {
                  title = "Assignment updated";
                } else if (h.type === "WORK_DOCUMENT_UPLOADED") {
                  title = "Work document uploaded";
                } else {
                  title = h.type;
                }
              }
              return {
                id: `sh-${h.id}`,
                status: mapBackendTaskStatus(h.status) as TaskStatus,
                title,
                timestamp: h.createdAt
                  ? new Date(h.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent",
                updatedBy: h.actor || (h.actorRole === "STAFF" ? "Specialist" : "Admin"),
              };
            }).reverse()
          : [
              {
                id: `sh-${apiTask.id || "1"}`,
                status: mapBackendTaskStatus(apiTask.status) as TaskStatus,
                title: `Task initiated (${apiTask.assignmentStatus || "ASSIGNED"})`,
                timestamp: apiTask.taskDate || "Today",
                updatedBy: "System",
              },
            ];

        // Map partner attached documents ONLY if present in live API payload
        const partnerAttachments: TaskAttachment[] = Array.isArray(apiTask.documents)
          ? apiTask.documents.map((doc: any, idx: number) => ({
              id: `doc-${doc.uploadId || idx + 1}`,
              fileName: doc.fileName || doc.fieldKey || "Customer_Document.pdf",
              fileSize: doc.sizeBytes ? (doc.sizeBytes > 1024 * 1024 ? `${(doc.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${(doc.sizeBytes / 1024).toFixed(0)} KB`) : "1.2 MB",
              uploadDate: apiTask.taskDate || (apiTask.createdAt ? new Date(apiTask.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Today"),
              uploadedBy: apiTask.partnerName ? apiTask.partnerName.slice(0, 2).toUpperCase() : "PT",
              fileUrl: doc.downloadUrl || `/api/proxy/request-documents/${doc.uploadId || idx + 1}`,
            }))
          : [];

        const mapped: TaskItem = {
          id: apiTask.taskId || apiTask.requestCode || `T-${apiTask.id}`,
          numericId: typeof apiTask.id === "number" ? apiTask.id : Number(apiTask.id) || undefined,
          version: typeof apiTask.version === "number" ? apiTask.version : 0,
          partnerId: apiTask.partnerId ? (String(apiTask.partnerId).startsWith("P-") ? String(apiTask.partnerId) : `P-${apiTask.partnerId}`) : "P-101",
          partnerName: apiTask.partnerName || "HQ",
          partnerContact: apiTask.partnerContact || "",
          clientName: apiTask.clientName || apiTask.customerName || "Client",
          clientContact: apiTask.contactNumber || "",
          nameOfBusiness: apiTask.nameOfBusiness || apiTask.clientName || apiTask.customerName || "—",
          taskCategory: apiTask.taskCategory || "Compliance",
          serviceName: apiTask.serviceName || "Service",
          status: mapBackendTaskStatus(apiTask.status) as TaskStatus,
          taskDate: apiTask.taskDate || (apiTask.createdAt ? new Date(apiTask.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Today"),
          dueDate: apiTask.dueDate || "",
          overdueDays: typeof apiTask.overdueDays === "number" && apiTask.overdueDays > 0
            ? apiTask.overdueDays
            : calculateOverdueDays(apiTask.dueDate, apiTask.status),
          assignedTo: apiTask.assignedToName || apiTask.assignedTo?.name
            ? {
                id: String(apiTask.assignedToId || apiTask.assignedTo?.id || "1"),
                name: apiTask.assignedToName || apiTask.assignedTo?.name,
                role: "Operations Specialist",
              }
            : undefined,
          comments: [
            ...(apiTask.instructions ? [{ id: "c-instr", userName: "Admin", userRole: "ADMIN", timestamp: "Initial Assignment", text: apiTask.instructions }] : []),
            ...(apiTask.adminRemarks && apiTask.adminRemarks !== apiTask.instructions ? [{ id: "c-remarks", userName: "System / Admin", userRole: "ADMIN", timestamp: "Recent", text: apiTask.adminRemarks }] : []),
            ...(apiTask.queryMessage ? [{ id: "c-query", userName: "Admin Query", userRole: "ADMIN", timestamp: "Recent Query", text: apiTask.queryMessage }] : []),
          ],
          attachments: partnerAttachments,
          statusHistory: liveStatusHistory,
        };

        return mapped;
      }
    } catch (err) {
      console.error("[taskService.getById] Live fetch error:", err);
    }

    // 2. Fallback to local storage only if network failed
    const tasks = getStoredTasks();
    const localMatch = tasks.find((t) => t.id === id || (t.id && id && t.id.toLowerCase() === id.toLowerCase()));
    if (localMatch) return localMatch;

    return null;
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

  // Update status with history tracking & stepwise workflow check
  updateStatus: async (id: string, newStatus: TaskStatus, updatedBy = "Admin"): Promise<TaskItem | null> => {
    const tasks = getStoredTasks();
    let task = tasks.find((t) => t.id === id || (t.id && id && t.id.toLowerCase() === id.toLowerCase()));

    const newHistoryEntry = {
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
    };

    if (task) {
      task.status = newStatus;
      if (!task.statusHistory) task.statusHistory = [];
      task.statusHistory.unshift(newHistoryEntry);
      setStoredTasks([...tasks]);
      return task;
    }

    // If task was loaded directly from live API and not yet in localStorage, fetch/construct and store it
    const liveTask = await taskService.getById(id);
    if (liveTask) {
      liveTask.status = newStatus;
      if (!liveTask.statusHistory) liveTask.statusHistory = [];
      liveTask.statusHistory.unshift(newHistoryEntry);
      setStoredTasks([liveTask, ...tasks]);
      return liveTask;
    }

    return null;
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
      completedBy?: string;
    }
  ): Promise<TaskItem | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = "Completed";
    task.license = details.licenceNumber;

    const completedTimestamp = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    task.completionDetails = {
      licenceType: details.licenceType,
      category: details.category,
      service: details.service,
      licenceNumber: details.licenceNumber,
      issueDate: details.issueDate,
      expiryDate: details.expiryDate,
      userId: details.userId,
      password: details.password,
      fileName: details.fileName || `${details.service.replace(/\s+/g, "_")}_Official_Certificate.pdf`,
      completedBy: details.completedBy || "Staff Executive",
      completedAt: completedTimestamp,
    };

    if (!task.certificates) task.certificates = [];
    task.certificates.unshift({
      id: `cert-${Date.now()}`,
      certificateNumber: details.licenceNumber,
      certificateName: `${details.service} - ${details.licenceType}`,
      issuedDate: details.issueDate,
      validTill: details.expiryDate,
      submittedBy: details.completedBy || "Staff Executive",
      submittedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      fileName: details.fileName || `${details.service.replace(/\s+/g, "_")}_Official_Certificate.pdf`,
      fileUrl: "/placeholder-cert.pdf",
      status: "Active",
    });

    if (!task.statusHistory) task.statusHistory = [];
    task.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      status: "Completed",
      title: `Task completed by staff. ${details.licenceType} #${details.licenceNumber} generated and submitted.`,
      timestamp: completedTimestamp,
      updatedBy: details.completedBy || "Staff Executive",
    });

    setStoredTasks([...tasks]);
    return task;
  },

  // Update task details (full edit/modify)
  updateTask: async (id: string, updates: Partial<TaskItem>, updatedBy = "Admin"): Promise<TaskItem | null> => {
    // 1. If assignedTo explicitly changed, sync to Live Backend API
    try {
      // Find numeric id if available
      let numericId: string | number | null = null;
      if (/^\d+$/.test(id)) numericId = id;
      else if (id.startsWith("T-") && /^\d+$/.test(id.replace("T-", ""))) numericId = id.replace("T-", "");
      else {
        // Search task id to get numeric id
        try {
          const res = await fetch(`/api/proxy/tasks?search=${encodeURIComponent(id)}`);
          if (res.ok) {
            const json = await res.json();
            const matched = Array.isArray(json?.data) ? json.data.find((x: any) => x.taskId === id || x.requestCode === id) : null;
            if (matched) numericId = matched.id;
          }
        } catch (e) {}
      }

      if (numericId) {
        // Direct fast PUT update with dueDate and status to /api/admin/tasks/{id}
        const statusMap: Record<string, string> = {
          "Pending": "PENDING",
          "In Progress": "IN_PROGRESS",
          "Pending from Client": "PENDING_FROM_CLIENT",
          "Pending from Department": "PENDING_FROM_DEPARTMENT",
          "Sent for Review": "SENT_FOR_REVIEW",
          "Overdue": "PENDING_FROM_CLIENT",
          "Completed": "COMPLETED",
          "Cancelled": "CANCELLED",
        };
        const backendStatus = updates.status ? (statusMap[updates.status] || updates.status) : undefined;

        fetch(`/api/proxy/tasks/${numericId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(updates.dueDate !== undefined ? { dueDate: updates.dueDate || null } : {}),
            ...(backendStatus ? { status: backendStatus } : {}),
          }),
        }).catch((e) => console.warn("Backend PUT /tasks sync warning:", e));

        // If explicitly unassigning (passed null)
        if ("assignedTo" in updates && updates.assignedTo === null) {
          try {
            await fetch(`/api/proxy/admin/service-requests/${numericId}/assignment`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ specialistId: null, expectedVersion: 0 }),
            });
          } catch (e) {}
        }
      }
    } catch (apiErr) {
      console.warn("Backend assignment sync warning:", apiErr);
    }

    const tasks = getStoredTasks();
    let task = tasks.find((t) => t.id === id);
    if (!task) {
      // If task wasn't in localStorage yet, initialize it
      task = {
        id,
        clientName: updates.clientName || "Client",
        clientContact: updates.clientContact || "",
        nameOfBusiness: updates.nameOfBusiness || "Business",
        taskCategory: updates.taskCategory || "Compliance",
        serviceName: updates.serviceName || "Service",
        status: updates.status || "Pending",
        taskDate: "Today",
        dueDate: updates.dueDate || "",
        partnerId: updates.partnerId || "P-101",
        partnerName: updates.partnerName || "HQ",
        partnerContact: updates.partnerContact || "",
        comments: [],
        attachments: [],
        statusHistory: [],
      } as TaskItem;
      tasks.push(task);
    }

    // Only unassign if "assignedTo" was explicitly passed in updates as null
    if ("assignedTo" in updates && updates.assignedTo === null) {
      delete (task as any).assignedTo;
    }

    // Filter out undefined values from updates so existing properties (like assignedTo) are never wiped
    const safeUpdates = Object.entries(updates).reduce((acc: any, [key, val]) => {
      if (val !== undefined) acc[key] = val;
      return acc;
    }, {});

    Object.assign(task, safeUpdates);

    // Recompute overdue days if dueDate or status is updated
    task.overdueDays = calculateOverdueDays(task.dueDate, task.status);

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
