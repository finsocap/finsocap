import { NextRequest, NextResponse } from "next/server";

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://finsocap.cloud/api").replace(/\/+$/, "");
const MASTER_EMAIL = process.env.BACKEND_ADMIN_EMAIL || "admin@gmail.com";
const MASTER_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD || "*Finsocap2026@sam#aarav";

let cachedAdminToken: { token: string; exp: number } | null = null;

async function getValidAdminToken(): Promise<string> {
  const now = Date.now();
  if (cachedAdminToken && cachedAdminToken.exp > now + 60000) {
    return cachedAdminToken.token;
  }

  try {
    const res = await fetch(`${API_ROOT.replace(/\/+$/, "")}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: MASTER_EMAIL,
        password: MASTER_PASSWORD,
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const token = data?.data?.token || data?.token;
      if (token) {
        let exp = now + 23 * 3600 * 1000;
        try {
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
          if (payload.exp) exp = payload.exp * 1000;
        } catch {}
        cachedAdminToken = { token, exp };
        return token;
      }
    }
  } catch (e) {
    console.error("[Notifications] Auto admin login failed:", e);
  }

  return cachedAdminToken?.token || "";
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminToken = await getValidAdminToken();
    const token = authHeader && authHeader.trim().length > 10 ? authHeader : `Bearer ${adminToken}`;

    const headers = {
      Authorization: token,
      "Content-Type": "application/json",
    };

    // Parallel fetch live resources to aggregate real system events
    const [tasksRes, partnersRes, clientsRes] = await Promise.allSettled([
      fetch(`${API_ROOT}/admin/tasks`, { headers, next: { revalidate: 10 } }),
      fetch(`${API_ROOT}/admin/partners`, { headers, next: { revalidate: 30 } }),
      fetch(`${API_ROOT}/admin/clients`, { headers, next: { revalidate: 30 } }),
    ]);

    const notifications: any[] = [];

    // 1. Process Tasks & Requests
    if (tasksRes.status === "fulfilled" && tasksRes.value.ok) {
      try {
        const json = await tasksRes.value.json();
        const tasks = Array.isArray(json?.data) ? json.data : [];

        tasks.forEach((task: any) => {
          const clientName = task.clientName || task.customerName || "Client";
          const serviceName = task.serviceName || "Service";
          const taskId = task.taskId || `T-${task.id}`;

          // Event 1: Unassigned Task Alert
          if (task.assignmentStatus === "UNASSIGNED" || !task.assignedToId) {
            notifications.push({
              id: `notif-unassigned-${task.id}`,
              type: "task",
              title: "New Task Awaiting Assignment",
              message: `${serviceName} for ${clientName} needs specialist assignment.`,
              time: task.taskDate || "Recently",
              isRead: false,
              actionUrl: `/dashboard/allocation?taskId=${encodeURIComponent(taskId)}`,
              assignedToName: task.assignedToName || "",
              assignedToId: task.assignedToId || null,
              partnerName: task.partnerName || "",
              clientName: clientName,
            });
          }

          // Event 2: Sent for Review Alert
          if (task.status === "SENT_FOR_REVIEW" || task.status === "Review") {
            notifications.push({
              id: `notif-review-${task.id}`,
              type: "compliance",
              title: "Task Ready For Review",
              message: `${task.assignedToName || "Specialist"} submitted ${serviceName} for final approval.`,
              time: "Action required",
              isRead: false,
              actionUrl: `/dashboard/tasks/${encodeURIComponent(taskId)}`,
              assignedToName: task.assignedToName || "",
              assignedToId: task.assignedToId || null,
              partnerName: task.partnerName || "",
              clientName: clientName,
            });
          }

          // Event 3: Admin Query Raised
          if (task.adminRemarks || task.queryMessage) {
            notifications.push({
              id: `notif-query-${task.id}`,
              type: "support",
              title: "Query Active on Case",
              message: task.adminRemarks || task.queryMessage,
              time: task.taskDate || "Recent",
              isRead: false,
              actionUrl: `/dashboard/tasks/${encodeURIComponent(taskId)}`,
              assignedToName: task.assignedToName || "",
              assignedToId: task.assignedToId || null,
              partnerName: task.partnerName || "",
              clientName: clientName,
            });
          }

          // Event 4: In Progress Active Case
          if (task.status === "IN_PROGRESS" || task.status === "In Progress") {
            notifications.push({
              id: `notif-progress-${task.id}`,
              type: "task",
              title: "Case In Progress",
              message: `${task.assignedToName || "Specialist"} is actively processing ${serviceName} for ${clientName}.`,
              time: task.taskDate || "Today",
              isRead: true,
              actionUrl: `/dashboard/tasks/${encodeURIComponent(taskId)}`,
              assignedToName: task.assignedToName || "",
              assignedToId: task.assignedToId || null,
              partnerName: task.partnerName || "",
              clientName: clientName,
            });
          }
        });
      } catch (e) {
        console.error("Error parsing tasks for notifications:", e);
      }
    }

    // 2. Process Partners
    if (partnersRes.status === "fulfilled" && partnersRes.value.ok) {
      try {
        const json = await partnersRes.value.json();
        const partners = Array.isArray(json?.data) ? json.data : [];

        partners.forEach((partner: any) => {
          notifications.push({
            id: `notif-partner-${partner.id || partner.partnerId}`,
            type: "social",
            title: "Verified Franchise Partner",
            message: `${partner.name || partner.fullName} (${partner.partnerId || `P-${partner.id}`}) is active with state operations.`,
            time: partner.createdDate || "Active",
            isRead: true,
            actionUrl: `/dashboard/partners`,
            partnerName: partner.name || partner.fullName || "",
          });
        });
      } catch (e) {
        console.error("Error parsing partners for notifications:", e);
      }
    }

    // 3. Process Clients
    if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
      try {
        const json = await clientsRes.value.json();
        const clients = Array.isArray(json?.data) ? json.data : [];

        clients.forEach((client: any) => {
          notifications.push({
            id: `notif-client-${client.id}`,
            type: "chat",
            title: "Client Registered",
            message: `${client.name || client.clientName} registered under partner network.`,
            time: client.createdDate || "Recently",
            isRead: true,
            actionUrl: `/dashboard/clients`,
            clientName: client.name || client.clientName || "",
            partnerName: client.partnerName || "",
          });
        });
      } catch (e) {
        console.error("Error parsing clients for notifications:", e);
      }
    }

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    console.error("Failed to generate live notifications:", error);
    return NextResponse.json({
      success: false,
      notifications: [],
    });
  }
}
