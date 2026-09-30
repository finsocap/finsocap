import { TaskItem, TaskStatus, TaskComment, TaskAttachment } from "@/types";
import { initialTasks } from "@/lib/tasksData";

const STORAGE_KEY = "finsocap_tasks_operations_v1";

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

  // Add Comment
  addComment: async (taskId: string, text: string, userName = "Admin", userRole = "Admin"): Promise<TaskComment | null> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    if (!task.comments) task.comments = [];
    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      userName,
      userRole,
      text,
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

  // Add Attachment
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

  // Delete Attachment
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<boolean> => {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.attachments) return false;

    task.attachments = task.attachments.filter((a) => a.id !== attachmentId);
    setStoredTasks([...tasks]);
    return true;
  },
};
