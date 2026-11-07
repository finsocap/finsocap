import { NextRequest, NextResponse } from "next/server";

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://finsocap.cloud/api").replace(/\/+$/, "");
const MASTER_EMAIL = process.env.BACKEND_ADMIN_EMAIL || "admin@gmail.com";
const MASTER_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD || "*Finsocap2026@sam#aarav";

const SHUBHAM_EMAIL = (process.env.SHUBHAM_ADMIN_EMAIL || "shubham@finsocap.com").toLowerCase();
const SHUBHAM_PASSWORD = process.env.SHUBHAM_ADMIN_PASSWORD || "Welc0me@shubham";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || "").trim().toLowerCase();
    const password = body?.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Check for provisioned admin: shubham@finsocap.com
    if (email === SHUBHAM_EMAIL && password === SHUBHAM_PASSWORD) {
      try {
        const masterRes = await fetch(`${API_ROOT.replace(/\/+$/, "")}/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: MASTER_EMAIL, password: MASTER_PASSWORD }),
          cache: "no-store",
        });

        if (masterRes.ok) {
          const masterData = await masterRes.json();
          const masterToken = masterData?.data?.token || masterData?.token;
          if (masterToken) {
            return NextResponse.json({
              success: true,
              message: "Admin authentication successful",
              data: {
                id: 99,
                name: "Shubham",
                email: "shubham@finsocap.com",
                role: "ADMIN",
                status: "ACTIVE",
                token: masterToken,
                tokenType: "Bearer",
              },
            });
          }
        }
      } catch (e) {
        console.error("[Auth API] Master token bridge error:", e);
      }
    }

    // 2. Standard Admin Login to backend
    const adminRes = await fetch(`${API_ROOT.replace(/\/+$/, "")}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const adminData = await adminRes.json();
    if (adminRes.ok && adminData?.success) {
      return NextResponse.json(adminData);
    }

    // 3. Fallback to Staff Login if not admin
    if (adminRes.status === 403 || adminData?.message?.includes("not an Administrator")) {
      const staffRes = await fetch(`${API_ROOT.replace(/\/+$/, "")}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
      const staffData = await staffRes.json();
      return NextResponse.json(staffData, { status: staffRes.status });
    }

    return NextResponse.json(adminData, { status: adminRes.status });
  } catch (err: any) {
    console.error("[Auth API] Login handler error:", err);
    return NextResponse.json(
      { success: false, message: "Authentication service unavailable" },
      { status: 500 }
    );
  }
}

