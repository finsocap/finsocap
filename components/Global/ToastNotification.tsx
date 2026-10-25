"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Check, AlertTriangle, X, Info } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, default 3500
}

interface ToastContextValue {
  showToast: (opts: ToastOptions | string) => void;
  success: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global event bus so any function (or non-React module) can trigger toast
export function triggerGlobalToast(opts: ToastOptions | string) {
  if (typeof window !== "undefined") {
    const payload = typeof opts === "string" ? { message: opts, type: "success" } : opts;
    window.dispatchEvent(new CustomEvent("finsocap-show-toast", { detail: payload }));
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((opts: ToastOptions | string) => {
    const id = typeof opts === "object" && opts.id ? opts.id : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const parsed: ToastOptions = typeof opts === "string" 
      ? { id, type: "success", title: "Success!", message: opts, duration: 3500 }
      : {
          id,
          type: opts.type || "success",
          title: opts.title || (opts.type === "error" ? "Error!" : opts.type === "warning" ? "Warning!" : opts.type === "info" ? "Note!" : "Success!"),
          message: opts.message,
          duration: opts.duration ?? 3500,
        };

    // Keep up to 3 active toasts
    setToasts((prev) => [...prev.slice(-2), parsed]);
  }, []);

  const success = useCallback((message: string, title = "Success!", duration = 3500) => {
    showToast({ type: "success", title, message, duration });
  }, [showToast]);

  const warning = useCallback((message: string, title = "Warning!", duration = 3500) => {
    showToast({ type: "warning", title, message, duration });
  }, [showToast]);

  const error = useCallback((message: string, title = "Error!", duration = 4000) => {
    showToast({ type: "error", title, message, duration });
  }, [showToast]);

  const info = useCallback((message: string, title = "Info!", duration = 3500) => {
    showToast({ type: "info", title, message, duration });
  }, [showToast]);

  // Listen to window custom events
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) showToast(detail);
    };
    window.addEventListener("finsocap-show-toast", handleCustomToast);
    return () => window.removeEventListener("finsocap-show-toast", handleCustomToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, warning, error, info, dismissToast }}>
      {children}

      {/* CENTER-ALIGNED TOAST CONTAINER */}
      <div 
        aria-live="polite"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex flex-col items-center gap-3 w-full max-w-[480px] px-4"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => toast.id && dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Individual Toast Item matching user reference screenshot
function ToastItem({ toast, onDismiss }: { toast: ToastOptions; onDismiss: () => void }) {
  const duration = toast.duration ?? 3500;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  useEffect(() => {
    if (duration <= 0) return;

    let animFrame: number;
    const start = Date.now();
    startTimeRef.current = start;

    const tick = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
        const percent = (currentRemaining / duration) * 100;
        setProgress(percent);

        if (currentRemaining <= 0) {
          onDismiss();
          return;
        }
      }
      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  // Color Schemes matching Screenshot exactly:
  // Success: Mint/soft green background, green border, circular check, mint green progress
  // Warning: Warm pastel butter/cream background, amber border, triangle icon, amber progress
  // Error: Soft pastel rose/peach background, soft red border, octagon X icon, rose progress
  const config = {
    success: {
      cardBg: "bg-[#eafaf1]",
      border: "border-[#bbf0d3]",
      iconBg: "bg-[#82deb5]",
      iconColor: "text-white",
      titleColor: "text-[#184833]",
      messageColor: "text-[#286045]",
      closeColor: "text-[#40bf87] hover:text-[#184833]",
      progressBar: "bg-[#34c77b]",
      icon: <Check className="w-5 h-5 stroke-[3]" />,
    },
    warning: {
      cardBg: "bg-[#fff9e8]",
      border: "border-[#fde6a7]",
      iconBg: "bg-[#fcd480]",
      iconColor: "text-[#8a5b0b]",
      titleColor: "text-[#5e3c04]",
      messageColor: "text-[#7a4e05]",
      closeColor: "text-[#e5a828] hover:text-[#5e3c04]",
      progressBar: "bg-[#f59e0b]",
      icon: <span className="font-black text-lg">!</span>,
    },
    error: {
      cardBg: "bg-[#fdf0f0]",
      border: "border-[#fad2d2]",
      iconBg: "bg-[#f79e9e]",
      iconColor: "text-white",
      titleColor: "text-[#6c1c1c]",
      messageColor: "text-[#932727]",
      closeColor: "text-[#eb6868] hover:text-[#6c1c1c]",
      progressBar: "bg-[#ef4444]",
      icon: <X className="w-5 h-5 stroke-[3]" />,
    },
    info: {
      cardBg: "bg-[#edf5ff]",
      border: "border-[#c7e0ff]",
      iconBg: "bg-[#7bb3fc]",
      iconColor: "text-white",
      titleColor: "text-[#143765]",
      messageColor: "text-[#1d4f91]",
      closeColor: "text-[#3b82f6] hover:text-[#143765]",
      progressBar: "bg-[#2563eb]",
      icon: <Info className="w-5 h-5 stroke-[2.5]" />,
    },
  }[toast.type || "success"];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-lg shadow-black/5 border ${config.cardBg} ${config.border} animate-in fade-in slide-in-from-top-3 duration-300 transition-all hover:scale-[1.01]`}
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)"
      }}
    >
      <div className="flex items-center gap-3.5">
        {/* Soft rounded Icon */}
        <div 
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${config.iconBg} ${config.iconColor}`}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <h4 className={`text-base font-extrabold tracking-tight leading-tight ${config.titleColor}`}>
              {toast.title}
            </h4>
          )}
          <p className={`text-[13px] font-medium leading-snug mt-0.5 ${config.messageColor}`}>
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          title="Dismiss"
          className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${config.closeColor}`}
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* LINE WALI TIMING PROGRESS BAR (At the bottom of the card) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-black/5 overflow-hidden">
          <div
            className={`h-full transition-all ease-linear ${config.progressBar}`}
            style={{ 
              width: `${progress}%`,
              transitionDuration: isPaused ? "0ms" : "80ms"
            }}
          />
        </div>
      )}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside ToastProvider
    return {
      showToast: triggerGlobalToast,
      success: (msg: string, title?: string, dur?: number) => triggerGlobalToast({ type: "success", message: msg, title, duration: dur }),
      warning: (msg: string, title?: string, dur?: number) => triggerGlobalToast({ type: "warning", message: msg, title, duration: dur }),
      error: (msg: string, title?: string, dur?: number) => triggerGlobalToast({ type: "error", message: msg, title, duration: dur }),
      info: (msg: string, title?: string, dur?: number) => triggerGlobalToast({ type: "info", message: msg, title, duration: dur }),
      dismissToast: () => {},
    };
  }
  return context;
}
