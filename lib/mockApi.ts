import {
  initialBlogs,
  initialCategories,
  initialNotifications,
  mockCurrentUser,
  Blog,
  BlogCategory,
  NotificationItem,
  UserProfile,
} from "./mockData";

// Safe LocalStorage access
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function setItem<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[mockStore] Failed to write key ${key}:`, e);
  }
}

// Storage keys
const KEYS = {
  BLOGS: "finsocap_blogs_data",
  CATEGORIES: "finsocap_categories_data",
  NOTIFICATIONS: "finsocap_notifications_data",
  PROFILE: "finsocap_profile_data",
  CHATS: "finsocap_chat_messages",
};

// -------------------------------------------------------------
// Direct Mock Store Operations
// -------------------------------------------------------------
export const mockStore = {
  getBlogs: (): Blog[] => getItem(KEYS.BLOGS, initialBlogs),
  setBlogs: (data: Blog[]) => setItem(KEYS.BLOGS, data),

  getCategories: (): BlogCategory[] => getItem(KEYS.CATEGORIES, initialCategories),
  setCategories: (data: BlogCategory[]) => setItem(KEYS.CATEGORIES, data),

  getNotifications: (): NotificationItem[] => getItem(KEYS.NOTIFICATIONS, initialNotifications),
  setNotifications: (data: NotificationItem[]) => setItem(KEYS.NOTIFICATIONS, data),

  getProfile: (): UserProfile => getItem(KEYS.PROFILE, mockCurrentUser),
  setProfile: (data: UserProfile) => setItem(KEYS.PROFILE, data),
};

// Helper: json response
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// -------------------------------------------------------------
// Client-side API Request Router
// -------------------------------------------------------------
export async function handleMockApiRequest(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const parsedUrl = new URL(url, "http://localhost");
  const pathname = parsedUrl.pathname;

  let body: any = null;
  if (init?.body && typeof init.body === "string") {
    try {
      body = JSON.parse(init.body);
    } catch (e) {
      body = init.body;
    }
  }

  // Minimal realistic latency
  await new Promise((r) => setTimeout(r, 15));

  // -----------------------------------------------------------
  // 1. Auth & Session Routes
  // -----------------------------------------------------------
  if (pathname === "/api/auth/session") {
    const profile = mockStore.getProfile();
    return jsonResponse({
      user: profile,
      expires: "2099-01-01T00:00:00.000Z",
    });
  }

  if (pathname === "/api/auth/csrf") {
    return jsonResponse({ csrfToken: "mock-csrf-token-2026" });
  }

  if (pathname === "/api/auth/signout") {
    return jsonResponse({ url: "/dashboard/login" });
  }

  if (pathname === "/api/auth/register") {
    return jsonResponse({ success: true, message: "Registration successful" });
  }

  if (pathname === "/api/auth/forgot-password") {
    if (body?.action === "SEND_OTP") {
      return jsonResponse({
        success: true,
        message: "OTP code sent to email! Demo OTP is 123456 (or enter any 6 digits).",
      });
    }
    return jsonResponse({
      success: true,
      message: "Password reset successful! You can now sign in.",
    });
  }

  // -----------------------------------------------------------
  // 2. Blogs & Categories Routes
  // -----------------------------------------------------------
  if (pathname === "/api/blogs") {
    const blogs = mockStore.getBlogs();
    if (method === "GET") {
      return jsonResponse(blogs);
    }
    if (method === "POST" && body) {
      const newBlog: Blog = {
        id: `blog-${Date.now()}`,
        title: body.title || "Untitled Blog Post",
        slug: body.slug || `post-${Date.now()}`,
        content: body.content || "",
        excerpt: body.excerpt || "",
        thumbnail: body.thumbnail || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
        categoryId: body.categoryId || "cat-1",
        category: mockStore.getCategories().find((c) => c.id === body.categoryId) || {
          id: "cat-1",
          name: "Direct Tax",
          slug: "direct-tax",
        },
        seoTitle: body.seoTitle || body.title,
        seoDesc: body.seoDesc || body.excerpt,
        tags: body.tags || "Finance, Tax",
        status: body.status || "DRAFT",
        publishedAt: body.status === "PUBLISHED" ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        views: 0,
        author: { name: "Aarav Jha" },
      };
      blogs.unshift(newBlog);
      mockStore.setBlogs(blogs);
      return jsonResponse({ success: true, blog: newBlog });
    }
  }

  if (pathname.startsWith("/api/blogs/")) {
    const blogId = pathname.replace("/api/blogs/", "");
    const blogs = mockStore.getBlogs();

    if (method === "GET") {
      const found = blogs.find((b) => b.id === blogId || b.slug === blogId);
      return jsonResponse(found || { error: "Blog not found" }, found ? 200 : 404);
    }

    if (method === "DELETE") {
      const filtered = blogs.filter((b) => b.id !== blogId);
      mockStore.setBlogs(filtered);
      return jsonResponse({ success: true });
    }

    if (method === "PUT" && body) {
      const target = blogs.find((b) => b.id === blogId);
      if (target) {
        Object.assign(target, body, { updatedAt: new Date().toISOString() });
        mockStore.setBlogs([...blogs]);
        return jsonResponse({ success: true, blog: target });
      }
      return jsonResponse({ error: "Blog not found" }, 404);
    }
  }

  if (pathname === "/api/categories") {
    const cats = mockStore.getCategories();
    if (method === "GET") {
      return jsonResponse(cats);
    }
    if (method === "POST" && body) {
      const newCat: BlogCategory = {
        id: `cat-${Date.now()}`,
        name: body.name || "New Category",
        slug: body.slug || (body.name || "cat").toLowerCase().replace(/\s+/g, "-"),
      };
      cats.push(newCat);
      mockStore.setCategories(cats);
      return jsonResponse({ success: true, category: newCat });
    }
  }

  // -----------------------------------------------------------
  // 3. Live Chat & Channels
  // -----------------------------------------------------------
  if (pathname === "/api/chat/users") {
    return jsonResponse([
      { id: "user-1", name: "Aarav Jha", role: "ADMIN", isOnline: true, image: "/Aaravdp.png", phone: "+91 98765 43210", email: "aarav@finsocap.com", city: "Ghaziabad", state: "Uttar Pradesh", about: "Managing partner at Finsocap. Focused on growth, client success and long-term partnerships." },
      { id: "user-2", name: "Priya Sharma", role: "OPERATIONS", isOnline: true, phone: "+91 98111 22334", email: "priya@finsocap.com", city: "Noida", state: "Uttar Pradesh", about: "Operations head at Finsocap. Driving business execution & corporate partnerships." },
      { id: "user-3", name: "Rahul Verma", role: "FINANCE", isOnline: true, phone: "+91 98222 33445", email: "rahul@finsocap.com", city: "Delhi", state: "Delhi", about: "Senior Financial Analyst. Specializing in tax compliance and portfolio advisory." },
      { id: "user-4", name: "Sneha Kapoor", role: "COMPLIANCE", isOnline: true, phone: "+91 98333 44556", email: "sneha@finsocap.com", city: "Gurugram", state: "Haryana", about: "Corporate Secretarial & MCA Compliance Specialist." },
      { id: "user-5", name: "Vikram Singh", role: "CONSULTANT", isOnline: false, phone: "+91 98444 55667", email: "vikram@finsocap.com", city: "Jaipur", state: "Rajasthan", about: "Business Advisory & Project Financing Consultant." },
      { id: "user-6", name: "Pooja Mehta", role: "SUPPORT", isOnline: true, phone: "+91 98555 66778", email: "pooja@finsocap.com", city: "Mumbai", state: "Maharashtra", about: "Customer Success Lead at Finsocap." }
    ]);
  }

  if (pathname === "/api/chat/groups") {
    return jsonResponse([
      { id: "grp-1", name: "Team Finance", createdBy: "admin-aarav", members: [] },
      { id: "grp-2", name: "Marketing Team", createdBy: "admin-aarav", members: [] },
      { id: "grp-3", name: "Executive & Leadership", createdBy: "admin-aarav", members: [] }
    ]);
  }

  if (pathname === "/api/support/admin" || pathname.startsWith("/api/support/admin")) {
    if (method === "DELETE") {
      return jsonResponse({ success: true });
    }
    return jsonResponse([
      {
        id: "vis-1",
        visitorName: "Customer Support",
        email: "support@finsocap.com",
        phone: "+91 98765 00000",
        ipAddress: "192.168.1.10",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }

  if (pathname === "/api/support/visitor" || pathname.startsWith("/api/support/visitor")) {
    return jsonResponse({
      id: "vis-1",
      messages: [
        { id: "m-1", senderType: "VISITOR", senderName: "Customer Support", message: "Riya: Please check ticket #4821", createdAt: new Date().toISOString() }
      ]
    });
  }

  if (pathname === "/api/chat" || pathname.includes("/messages")) {
    if (method === "POST") {
      const msgText = body?.message || body?.text || "Message acknowledged.";
      return jsonResponse({
        id: `msg-${Date.now()}`,
        senderId: "user-1",
        message: msgText,
        text: msgText,
        sender: { id: "user-1", name: "Aarav Jha" },
        createdAt: new Date().toISOString(),
        isDelivered: true,
        isRead: true
      });
    }
    return jsonResponse([
      {
        id: "msg-1",
        senderId: "user-2",
        sender: { id: "user-2", name: "Priya Sharma" },
        message: "Hey, can you share the latest client report for Finsocap?",
        text: "Hey, can you share the latest client report for Finsocap?",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        isDelivered: true,
        isRead: true
      },
      {
        id: "msg-2",
        senderId: "user-1",
        sender: { id: "user-1", name: "Aarav Jha" },
        message: "Sure, I'll share the document now.",
        text: "Sure, I'll share the document now.",
        createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        isDelivered: true,
        isRead: true
      },
      {
        id: "msg-3",
        senderId: "user-2",
        sender: { id: "user-2", name: "Priya Sharma" },
        message: "Also, can you confirm the meeting with the insurance partner today?",
        text: "Also, can you confirm the meeting with the insurance partner today?",
        createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        isDelivered: true,
        isRead: true
      },
      {
        id: "msg-4",
        senderId: "user-1",
        sender: { id: "user-1", name: "Aarav Jha" },
        message: "Yes, it's confirmed for 4 PM. I've already shared the calendar invite.",
        text: "Yes, it's confirmed for 4 PM. I've already shared the calendar invite.",
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        isDelivered: true,
        isRead: true
      },
      {
        id: "msg-5",
        senderId: "user-2",
        sender: { id: "user-2", name: "Priya Sharma" },
        message: "Great! Also, please update me on the pending KYC approvals.",
        text: "Great! Also, please update me on the pending KYC approvals.",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        isDelivered: true,
        isRead: true
      },
      {
        id: "msg-6",
        senderId: "user-1",
        sender: { id: "user-1", name: "Aarav Jha" },
        message: "On it. I'll share the status in the next update. Anything else?",
        text: "On it. I'll share the status in the next update. Anything else?",
        createdAt: new Date(Date.now() - 900000).toISOString(),
        isDelivered: true,
        isRead: true
      },
      {
        id: "msg-7",
        senderId: "user-2",
        sender: { id: "user-2", name: "Priya Sharma" },
        message: "That's all for now. Thanks!",
        text: "That's all for now. Thanks!",
        createdAt: new Date(Date.now() - 400000).toISOString(),
        isDelivered: true,
        isRead: true
      },
      {
        id: "msg-8",
        senderId: "user-1",
        sender: { id: "user-1", name: "Aarav Jha" },
        message: "You're welcome! 😊",
        text: "You're welcome! 😊",
        createdAt: new Date(Date.now() - 60000).toISOString(),
        isDelivered: true,
        isRead: true
      }
    ]);
  }

  if (pathname === "/api/chat/presence") {
    return jsonResponse({ success: true });
  }

  // -----------------------------------------------------------
  // 4. Notifications & Profile
  // -----------------------------------------------------------
  if (pathname === "/api/notifications") {
    const notifs = mockStore.getNotifications();
    if (method === "GET") {
      return jsonResponse({
        notifications: notifs,
        todayBlogPublished: true,
      });
    }
    if (method === "POST" && body) {
      if (body.action === "MARK_ALL_READ") {
        notifs.forEach((n) => (n.isRead = true));
        mockStore.setNotifications([...notifs]);
      }
      return jsonResponse({ success: true });
    }
  }

  if (pathname === "/api/profile") {
    const profile = mockStore.getProfile();
    if (method === "GET") {
      return jsonResponse(profile);
    }
    if (method === "POST" && body) {
      const updated = { ...profile, ...body };
      mockStore.setProfile(updated);
      return jsonResponse({ success: true, profile: updated });
    }
  }

  if (pathname === "/api/upload") {
    return jsonResponse({
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    });
  }

  // Fallback for any unknown /api route
  return jsonResponse({ success: true, message: "Frontend Mock Response" });
}

// -------------------------------------------------------------
// Global Window Fetch Interceptor
// -------------------------------------------------------------
let isMockInitialized = false;

export function initMockApi(): void {
  if (typeof window === "undefined" || isMockInitialized) return;
  isMockInitialized = true;

  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof (input as any).url === "string") {
      url = (input as any).url;
    }

    if (url.startsWith("/api/") || url.includes("/api/")) {
      return handleMockApiRequest(url, init);
    }

    return originalFetch.call(window, input, init);
  };
}
