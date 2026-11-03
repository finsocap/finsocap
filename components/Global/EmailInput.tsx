"use client";

import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { formatEmail, validateEmail } from "@/lib/formatters";
import { Mail, AlertCircle } from "lucide-react";

interface EmailInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  showError?: boolean;
  errorMessage?: string;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ value, onChange, label, required, showError = true, errorMessage, className = "", ...props }, ref) => {
    const [touched, setTouched] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Lowercase directly while typing, keeping cursor natural
      const val = e.target.value.toLowerCase().replace(/\s+/g, "");
      onChange(val);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      const cleaned = formatEmail(value);
      if (cleaned !== value) {
        onChange(cleaned);
      }
      props.onBlur?.(e);
    };

    const validation = validateEmail(value);
    const hasError = touched && !validation.isValid && (required || Boolean(value));

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type="email"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={props.placeholder || "name@finsocap.com"}
            className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 ${
              hasError
                ? "border-rose-400 focus:ring-rose-400/20 text-rose-900 dark:text-rose-200"
                : "border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            } ${className}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Mail className="w-3.5 h-3.5" />
          </div>
        </div>

        {showError && hasError && (
          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 animate-in fade-in">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errorMessage || validation.error}</span>
          </div>
        )}
      </div>
    );
  }
);

EmailInput.displayName = "EmailInput";

