import { Suspense } from "react";
import Sidebar from "@/components/Dashboard/Sidebar";
import Topbar from "@/components/Dashboard/Topbar";
import { AuthProvider, defaultMockSession } from "@/components/Providers/AuthProvider";
import DashboardMain from "@/components/Dashboard/DashboardMain";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = defaultMockSession;

  return (
    <AuthProvider session={session}>
      <div className="flex h-screen bg-slate-50 overflow-hidden transition-colors">
        <Suspense fallback={<aside className="hidden lg:block w-64 bg-white border-r border-slate-200 relative z-50" />}>
          <Sidebar userRole="ADMIN" />
        </Suspense>
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          <Topbar user={session.user} />
          <DashboardMain>
            {children}
          </DashboardMain>
        </div>
      </div>
    </AuthProvider>
  );
}
