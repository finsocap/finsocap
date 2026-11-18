"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/Global/ToastNotification";

interface TaskIdBadgeProps {
  id: string | number;
  href?: string;
  className?: string;
}

export function formatShortTaskId(id: string | number): string {
  if (!id) return "";
  const str = String(id).trim();
  // If it starts with T- or #, strip prefix to check main length
  let prefix = "";
  let rest = str;
  if (str.startsWith("T-")) {
    prefix = "T-";
    rest = str.slice(2);
  } else if (str.startsWith("#")) {
    prefix = "#";
    rest = str.slice(1);
  }

  // If rest is longer than 4 chars, truncate to 4 chars with ellipsis
  if (rest.length > 4) {
    return `${prefix}${rest.slice(0, 4)}...`;
  }
  return str;
}

export default function TaskIdBadge({ id, href, className = "" }: TaskIdBadgeProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const fullId = String(id || "");
  const shortId = formatShortTaskId(fullId);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullId);
    }
    setCopied(true);
    toast.success(`Task ID "${fullId}" copied to clipboard!`, "Copied");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const content = (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 transition-colors group ${className}`}
      title={`Task ID: ${fullId}`}
    >
      {href ? (
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="font-mono font-bold text-xs text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
        >
          {shortId}
        </Link>
      ) : (
        <span className="font-mono font-bold text-xs text-blue-600 dark:text-sky-400">
          {shortId}
        </span>
      )}

      <button
        type="button"
        onClick={handleCopy}
        title={`Copy ${fullId}`}
        className="p-0.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-500 animate-in zoom-in-75" />
        ) : (
          <Copy className="w-3 h-3 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );

  return content;
}

