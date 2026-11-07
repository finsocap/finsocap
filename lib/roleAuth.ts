/**
 * Role-Based Access Control and Session Helpers
 * Isolated to non-admin roles: STAFF, SPECIALIST, EXECUTIVE
 * Admin functionality is never restricted or altered.
 */

export type UserRole = "ADMIN" | "STAFF" | "SPECIALIST" | "EXECUTIVE" | string;

export interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  department?: string;
}

/**
 * Returns true if the user role is one of the restricted operational roles:
 * STAFF, SPECIALIST, or EXECUTIVE.
 */
export function isOperationalRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase().trim();
  return normalized === "STAFF" || normalized === "SPECIALIST" || normalized === "EXECUTIVE";
}

/**
 * Helper to safely extract user and active role from client storage
 */
export function getActiveUserSession(): { user: SessionUser | null; role: string } {
  if (typeof window === "undefined") {
    return { user: null, role: "ADMIN" };
  }
  try {
    const raw = localStorage.getItem("finsocap_user_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.user || (parsed?.role ? parsed : null);
      const role = (user?.role || parsed?.role || "ADMIN").toUpperCase().trim();
      return { user, role };
    }
  } catch (e) {
    // ignore parse error
  }
  return { user: null, role: "ADMIN" };
}

/**
 * Checks if a task is assigned to the current user (by matching email or name).
 */
export function isTaskAssignedToUser(task: any, user: SessionUser | null): boolean {
  if (!task || !user) return false;
  const userName = (user.name || "").trim().toLowerCase();
  const userEmail = (user.email || "").trim().toLowerCase();
  const userId = (user.id || "").trim().toLowerCase();

  const taskAssignee = (task.assignee || "").trim().toLowerCase();
  const taskAssigneeEmail = (task.assigneeEmail || task.assignedToEmail || "").trim().toLowerCase();
  const taskAssigneeId = (task.assigneeId || task.assignedTo || "").toString().toLowerCase();

  if (taskAssigneeId && userId && taskAssigneeId === userId) return true;
  if (taskAssigneeEmail && userEmail && taskAssigneeEmail === userEmail) return true;
  if (taskAssignee && (taskAssignee === userName || taskAssignee === userEmail)) return true;
  if (userName && taskAssignee && (taskAssignee.includes(userName) || userName.includes(taskAssignee))) return true;

  return false;
}

