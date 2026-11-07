"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Dashboard/Sidebar";
import Topbar from "@/components/Dashboard/Topbar";
import { AuthProvider } from "@/components/Providers/AuthProvider";
import DashboardMain from "@/components/Dashboard/DashboardMain";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("finsocap_user_session");
      if (!saved) {
        router.replace("/dashboard/login");
        return;
      }

      const parsed = JSON.parse(saved);
      if (!parsed?.token && !parsed?.user) {
        localStorage.removeItem("finsocap_user_session");
        router.replace("/dashboard/login");
        return;
      }

      setSession(parsed);
      setCheckingAuth(false);
    } catch (e) {
      router.replace("/dashboard/login");
    }
  }, [router, pathname]);

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F8FC] text-slate-500">
        <div className="flex flex-col items-center gap-3 animate-in fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Verifying Authorized Access...
          </p>
        </div>
      </div>
    );
  }

  const userRole = session?.user?.role || "ADMIN";

  return (
    <AuthProvider session={session}>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden transition-colors relative">
        <Suspense fallback={<aside className="hidden lg:block w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/80 relative z-50" />}>
          <Sidebar userRole={userRole} />
        </Suspense>
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Topbar user={session?.user} />
          <DashboardMain>
            {children}
          </DashboardMain>
        </div>
      </div>
    </AuthProvider>
  );
}
