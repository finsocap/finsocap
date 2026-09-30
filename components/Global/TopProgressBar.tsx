"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Complete progress on any route or query change
  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Safety auto-hide timeout: Never let progress bar stay stuck on screen
  useEffect(() => {
    if (isVisible) {
      const safetyTimer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, 200);
      }, 700);
      return () => clearTimeout(safetyTimer);
    }
  }, [isVisible]);

  // Listen to clicks on navigation links
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      const isExternalTarget = target.getAttribute("target") === "_blank";
      const isInternal = href.startsWith("/");

      // Only trigger if navigating to a DIFFERENT pathname (not in-page tabs or same route)
      const targetBase = href.split("?")[0];
      if (isInternal && !isExternalTarget && targetBase !== pathname) {
        setIsVisible(true);
        setProgress(30);

        setTimeout(() => {
          setProgress((prev) => (prev < 70 && prev > 0 ? 70 : prev));
        }, 100);
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => document.removeEventListener("click", handleLinkClick, { capture: true });
  }, [pathname]);

  if (!isVisible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3px] bg-transparent">
      <div
        className="h-full transition-all duration-200 ease-out relative"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #38bdf8 0%, #2563eb 50%, #8b5cf6 100%)",
          boxShadow: "0 0 12px rgba(37, 99, 235, 0.9), 0 0 4px rgba(139, 92, 246, 0.9)",
        }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white opacity-70 blur-xs" />
      </div>
    </div>
  );
}

export default function GlobalTopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
