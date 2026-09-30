import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 max-w-md mb-8">
        The dashboard view you requested could not be located.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 inline-flex items-center gap-2 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
