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
      <div className="flex h-screen bg-slate-50 dark:bg-[#090d16] overflow-hidden transition-colors">
        <Suspense fallback={<aside className="w-64 bg-white dark:bg-[#0c1222] border-r border-slate-200 dark:border-slate-800 relative z-50" />}>
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
