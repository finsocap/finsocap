import { NextRequest, NextResponse } from "next/server";

const API_ROOT = "https://finsocap.cloud/api";
let cachedAdminToken: { token: string; exp: number } | null = null;

async function getValidAdminToken(): Promise<string> {
  const now = Date.now();
  if (cachedAdminToken && cachedAdminToken.exp > now + 60000) {
    return cachedAdminToken.token;
  }

  try {
    const res = await fetch(`${API_ROOT}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@gmail.com",
        password: "*Finsocap2026@sam#aarav",
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const token = data?.data?.token || data?.token;
      if (token) {
        // Parse expiry or default to 23 hours
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
    console.error("[Proxy] Auto admin login failed:", e);
  }

  return cachedAdminToken?.token || "";
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const subpath = path && Array.isArray(path) ? path.join("/") : "";

  let targetUrlString = "";
  if (
    subpath.startsWith("partners/") ||
    subpath.startsWith("staff/") ||
    subpath.startsWith("admin/") ||
    subpath.startsWith("request-documents/")
  ) {
    targetUrlString = `${API_ROOT}/${subpath}`;
  } else {
    targetUrlString = `${API_ROOT}/admin/${subpath}`;
  }

  const targetUrl = new URL(targetUrlString);

  // Forward all query parameters
  request.nextUrl.searchParams.forEach((val, key) => {
    targetUrl.searchParams.set(key, val);
  });

  const headers: Record<string, string> = {};
  const auth = request.headers.get("authorization");
  const adminToken = await getValidAdminToken();

  if (targetUrlString.includes("/api/admin/")) {
    headers["authorization"] = `Bearer ${adminToken}`;
  } else if (auth && auth.trim().length > 10) {
    headers["authorization"] = auth;
  } else {
    headers["authorization"] = `Bearer ${adminToken}`;
  }
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers["content-type"] = contentType;
  }

  let body: any = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    if (contentType?.includes("application/json")) {
      body = await request.text();
    } else if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = await request.text();
    }
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body,
    });

    const resContentType = res.headers.get("content-type") || "";

    if (resContentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: res.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": resContentType || "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error(`[API Proxy Error] -> ${targetUrl}:`, err);
    return NextResponse.json(
      { success: false, message: err.message || "Upstream server connection failed" },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

