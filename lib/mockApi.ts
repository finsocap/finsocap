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
      { id: "user-1", name: "Aarav Jha", role: "ADMIN", online: true },
      { id: "user-2", name: "Priya Sharma", role: "MANAGER", online: true },
      { id: "user-3", name: "Rahul Verma", role: "WRITER", online: true },
    ]);
  }

  if (pathname === "/api/chat/groups") {
    return jsonResponse([
      { id: "grp-1", name: "Executive & Leadership", membersCount: 3 },
      { id: "grp-2", name: "Editorial & Content", membersCount: 4 },
      { id: "grp-3", name: "General Discussions", membersCount: 5 },
    ]);
  }

  if (pathname === "/api/chat" || pathname.includes("/messages")) {
    if (method === "POST") {
      return jsonResponse({
        id: `msg-${Date.now()}`,
        sender: "Aarav Jha",
        text: body?.text || "Message acknowledged.",
        timestamp: new Date().toISOString(),
      });
    }
    return jsonResponse([
      {
        id: "msg-1",
        sender: "Rahul Verma",
        text: "Union budget post draft has been updated with latest direct tax slabs.",
        timestamp: "10:30 AM",
      },
      {
        id: "msg-2",
        sender: "Aarav Jha",
        text: "Great work! Publishing it on the portal now.",
        timestamp: "10:35 AM",
      },
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
