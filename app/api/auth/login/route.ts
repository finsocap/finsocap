import { NextRequest, NextResponse } from "next/server";

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://finsocap.cloud/api").replace(/\/+$/, "");

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

    // 1. Direct dynamic authentication against backend admin login with exact user credentials
    const adminRes = await fetch(`${API_ROOT.replace(/\/+$/, "")}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const adminData = await adminRes.json();
    if (adminRes.ok && adminData?.success) {
      // If backend literally returned "Universal Admin", resolve real name from team specialists list or email
      if (adminData?.data?.name === "Universal Admin" || !adminData?.data?.name) {
        try {
          const specRes = await fetch(`${API_ROOT.replace(/\/+$/, "")}/admin/team/specialists`, {
            headers: { Authorization: `Bearer ${adminData.data.token}` },
            cache: "no-store",
          });
          if (specRes.ok) {
            const specData = await specRes.json();
            if (Array.isArray(specData?.data)) {
              const matchedAdmin = specData.data.find(
                (s: any) =>
                  (s.email && s.email.toLowerCase() === email) ||
                  (s.designation && s.designation.toLowerCase().includes("admin"))
              );
              if (matchedAdmin?.fullName) {
                adminData.data.name = matchedAdmin.fullName;
              }
            }
          }
        } catch (e) {}
      }

      return NextResponse.json(adminData);
    }

    // 2. Fallback to Partner Login (Op 03: POST /api/partners/login) with exact user credentials
    try {
      const partnerRes = await fetch(`${API_ROOT.replace(/\/+$/, "")}/partners/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
      const partnerData = await partnerRes.json();
      if (partnerRes.ok && partnerData?.success) {
        return NextResponse.json(partnerData);
      }
      if (partnerData?.message?.toLowerCase().includes("pending") || partnerData?.status === "PENDING") {
        return NextResponse.json(partnerData, { status: 403 });
      }
    } catch (e) {
      console.warn("[Auth API] Partner login attempt:", e);
    }

    // 3. Fallback to Staff Login with exact user credentials
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

