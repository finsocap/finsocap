"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Smartphone, ExternalLink, RotateCcw, ArrowLeft, 
  Sparkles, Layers, ShieldCheck, CheckCircle2, Maximize2
} from "lucide-react";
import PageBanner from "@/components/Dashboard/PageBanner";

export default function MobileAppUiPage() {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Banner */}
      <PageBanner
        icon={Smartphone}
        badge="Partner Mobile App"
        badgeMeta="Interactive Prototype Live"
        title="Partner Mobile App UI"
        description="Live interactive mobile application for franchise partners — including Registration & Onboarding, Service Orders, Client Lead Submissions, Wallet & QR Payments."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Reload Simulator"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Prototype</span>
            </button>
            <a
              href="/mobile-app-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-blue-500/25"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open Fullscreen</span>
            </a>
          </div>
        }
      />

      {/* Simulator Container */}
      <div className="card-luxury p-4 sm:p-6 overflow-hidden flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">Partner App UI Simulator</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 font-mono font-bold">
              Standalone Interactive Build
            </span>
          </div>
          <a
            href="/mobile-app-ui/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
          >
            Direct Link: /mobile-app-ui/index.html <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Embedded Iframe */}
        <div className="w-full rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-950 flex justify-center">
          <iframe
            key={iframeKey}
            src="/mobile-app-ui/index.html"
            title="Partner Mobile App UI"
            className="w-full h-[860px] border-0 rounded-2xl"
            allow="clipboard-read; clipboard-write;"
          />
        </div>
      </div>
    </div>
  );
}
