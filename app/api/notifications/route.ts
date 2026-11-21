import { NextRequest, NextResponse } from "next/server";

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://finsocap.cloud/api").replace(/\/+$/, "");
const MASTER_EMAIL = process.env.BACKEND_ADMIN_EMAIL || "admin@gmail.com";
const MASTER_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD || "Welc0me@shubham12";

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

    // Parallel fetch live resources to aggregate 100% real dynamic system events
    const [tasksRes, partnersRes, clientsRes, paymentProofsRes, paymentRequestsRes] = await Promise.allSettled([
      fetch(`${API_ROOT}/admin/tasks?size=100`, { headers, next: { revalidate: 10 } }),
      fetch(`${API_ROOT}/admin/partners?size=100`, { headers, next: { revalidate: 30 } }),
      fetch(`${API_ROOT}/admin/clients?size=100`, { headers, next: { revalidate: 30 } }),
      fetch(`${API_ROOT}/admin/payment-proofs?size=100`, { headers, next: { revalidate: 10 } }),
      fetch(`${API_ROOT}/admin/payment-requests?size=100`, { headers, next: { revalidate: 10 } }),
    ]);

    const notifications: any[] = [];

    // Parse payment requests to check which tasks are already billed
    let billedTaskIds = new Set<number>();
    let paymentRequests: any[] = [];
    if (paymentRequestsRes.status === "fulfilled" && paymentRequestsRes.value.ok) {
      try {
        const json = await paymentRequestsRes.value.json();
        paymentRequests = Array.isArray(json?.data?.items)
          ? json.data.items
          : Array.isArray(json?.data)
          ? json.data
          : [];
        paymentRequests.forEach((pr: any) => {
          if (pr.taskId) billedTaskIds.add(Number(pr.taskId));
        });
      } catch (e) {
        console.error("Error parsing payment requests:", e);
      }
    }

    // 1. Process Live Payment Proofs (High Priority: incoming money submitted by partners)
    if (paymentProofsRes.status === "fulfilled" && paymentProofsRes.value.ok) {
      try {
        const json = await paymentProofsRes.value.json();
        const proofs = Array.isArray(json?.data?.items)
          ? json.data.items
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.items)
          ? json.items
          : [];

        proofs.forEach((proof: any) => {
          if (proof.paymentStatus !== "COMPLETED") {
            const partner = proof.partnerName || proof.submittedBy || "Partner";
            const amountStr = proof.amount ? ` ₹${Number(proof.amount).toLocaleString("en-IN")}` : "";
            const utrStr = proof.utrNumber ? ` (UTR: ${proof.utrNumber})` : "";
            notifications.push({
              id: `notif-payment-proof-${proof.id}`,
              type: "invoice",
              title: "Payment Proof Submitted",
              message: `${partner} transferred${amountStr}${utrStr}. Click to verify and unlock documents.`,
              time: proof.createdAt ? "Pending Verification" : "Action required",
              isRead: false,
              actionUrl: `/dashboard/payments?taskId=${encodeURIComponent(proof.taskId || "")}`,
              partnerName: partner,
              clientName: proof.customerName || "",
            });
          }
        });
      } catch (e) {
        console.error("Error parsing payment proofs for notifications:", e);
      }
    }

    // 2. Process Real Tasks from Backend
    if (tasksRes.status === "fulfilled" && tasksRes.value.ok) {
      try {
        const json = await tasksRes.value.json();
        const tasks = Array.isArray(json?.data) ? json.data : [];

        tasks.forEach((task: any) => {
          const clientName = task.clientName || task.customerName || "Client";
          const serviceName = task.serviceName || "Service";
          const taskId = task.taskId || `T-${task.id}`;
          const partnerName = task.partnerName || "";

          // Event A: Unassigned Task Alert (Requires specialist delegation)
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
              partnerName: partnerName,
              clientName: clientName,
            });
          }

          // Event B: Sent for Review Alert (Admin clearance required)
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
              partnerName: partnerName,
              clientName: clientName,
            });
          }

          // Event C: Completed Task Unbilled (Ready to send payment request to partner)
          if (task.status === "COMPLETED" && !billedTaskIds.has(Number(task.id))) {
            notifications.push({
              id: `notif-unbilled-${task.id}`,
              type: "payment",
              title: "Task Completed • Payment Request Required",
              message: `${serviceName} completed for ${clientName}. Send payment request to ${partnerName || "partner"}.`,
              time: task.taskDate || "Settlement Ready",
              isRead: false,
              actionUrl: `/dashboard/payments`,
              assignedToName: task.assignedToName || "",
              assignedToId: task.assignedToId || null,
              partnerName: partnerName,
              clientName: clientName,
            });
          }

          // Event D: Active Query / Pending From Client / Dept
          if (
            task.status !== "COMPLETED" &&
            task.status !== "CANCELLED" &&
            (task.status === "PENDING_FROM_CLIENT" || task.status === "PENDING_FROM_DEPARTMENT" || task.queryMessage)
          ) {
            notifications.push({
              id: `notif-query-${task.id}`,
              type: "support",
              title: task.status === "PENDING_FROM_CLIENT" ? "Awaiting Client Documents" : "Department Processing Active",
              message: task.queryMessage || `${serviceName} for ${clientName} is awaiting clarification.`,
              time: task.taskDate || "Active",
              isRead: false,
              actionUrl: `/dashboard/tasks/${encodeURIComponent(taskId)}`,
              assignedToName: task.assignedToName || "",
              assignedToId: task.assignedToId || null,
              partnerName: partnerName,
              clientName: clientName,
            });
          }
        });
      } catch (e) {
        console.error("Error parsing tasks for notifications:", e);
      }
    }

    // 3. Process Recently Settled Payments (Read events showing live collections)
    paymentRequests.slice(0, 4).forEach((pr: any) => {
      if (pr.status === "COMPLETED") {
        notifications.push({
          id: `notif-payment-completed-${pr.id}`,
          type: "payment",
          title: "Payment Verified & Settled",
          message: `₹${Number(pr.amount || 0).toLocaleString("en-IN")} confirmed for ${pr.serviceName || "Service"} (${pr.partnerName || "Partner"}).`,
          time: pr.paidAt
            ? new Date(pr.paidAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            : "Recently",
          isRead: true,
          actionUrl: `/dashboard/payments`,
          partnerName: pr.partnerName || "",
          clientName: pr.customerName || "",
        });
      }
    });

    // 4. Process Live Registered Partners (Recent partners)
    if (partnersRes.status === "fulfilled" && partnersRes.value.ok) {
      try {
        const json = await partnersRes.value.json();
        const partners = Array.isArray(json?.data) ? json.data : [];

        // Show latest 3 partners dynamically
        partners.slice(-3).reverse().forEach((partner: any) => {
          notifications.push({
            id: `notif-partner-${partner.id || partner.partnerId}`,
            type: "social",
            title: "Partner Registered & Active",
            message: `${partner.name || partner.fullName} (${partner.partnerCode || `P-${partner.id}`}) is active in operations.`,
            time: partner.createdAt
              ? new Date(partner.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
              : "Active",
            isRead: true,
            actionUrl: `/dashboard/partners`,
            partnerName: partner.name || partner.fullName || "",
          });
        });
      } catch (e) {
        console.error("Error parsing partners for notifications:", e);
      }
    }

    // 5. Process Live Registered Clients (Recent clients)
    if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
      try {
        const json = await clientsRes.value.json();
        const clients = Array.isArray(json?.data) ? json.data : [];

        clients.slice(-3).reverse().forEach((client: any) => {
          notifications.push({
            id: `notif-client-${client.id}`,
            type: "chat",
            title: "Client Added",
            message: `${client.name || client.clientName} registered under ${client.partnerName || "partner network"}.`,
            time: "Recent",
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
