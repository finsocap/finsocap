"use client";

import { useEffect } from "react";

/**
 * Global Security Interceptor for production logs.
 * Suppresses sensitive system traces, token exposures, and verbose debugging in production environments,
 * while preserving vital fatal error tracking and development debugging.
 */
export default function ProductionConsoleGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      // Filter out token / secret leaks or internal API warning noise from production DevTools
      console.log = (...args: any[]) => {
        // Suppress general logs in production
      };

      console.warn = (...args: any[]) => {
        // Suppress non-critical dev warnings in production
      };

      console.error = (...args: any[]) => {
        // Redact any accidental tokens or passwords from string arguments
        const sanitized = args.map((arg) => {
          if (typeof arg === "string") {
            return arg.replace(/(Bearer\s+[A-Za-z0-9-_.]+)/gi, "Bearer [REDACTED]")
                      .replace(/([pP]assword\s*[:=]\s*)[^\s&,]+/gi, "$1[REDACTED]")
                      .replace(/([tT]oken\s*[:=]\s*)[^\s&,]+/gi, "$1[REDACTED]");
          }
          return arg;
        });
        originalError.apply(console, sanitized);
      };

      return () => {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);

  return null;
}

