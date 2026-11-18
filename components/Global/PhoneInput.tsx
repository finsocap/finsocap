"use client";

import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { formatIndianPhoneNumber, validateIndianMobile } from "@/lib/formatters";
import { Phone, AlertCircle } from "lucide-react";

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  showError?: boolean;
  errorMessage?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, label, required, showError = true, errorMessage, className = "", ...props }, ref) => {
    const [touched, setTouched] = useState(false);

    // Keep it clean: extract only digits, strip leading +91/91/0, limit strictly to 10 digits
    const rawDigits = (value || "").replace(/\D/g, "");
    let displayDigits = rawDigits;
    if (displayDigits.length > 10 && displayDigits.startsWith("91")) {
      displayDigits = displayDigits.slice(2);
    } else if (displayDigits.length > 10 && displayDigits.startsWith("0")) {
      displayDigits = displayDigits.slice(1);
    }
    displayDigits = displayDigits.slice(0, 10);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Direct digit typing: only 0-9 allowed, max 10 digits
      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
      onChange(digits);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      props.onBlur?.(e);
    };

    const validation = validateIndianMobile(displayDigits);
    const hasError = touched && !validation.isValid && (required || Boolean(displayDigits));

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-xs font-bold pointer-events-none select-none">
            <span>+91</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
          </div>
          <input
            {...props}
            ref={ref}
            type="tel"
            inputMode="numeric"
            value={displayDigits}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={props.placeholder || "98765 43210"}
            maxLength={10}
            className={`w-full pl-14 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-mono font-semibold transition-all focus:outline-none focus:ring-2 ${
              hasError
                ? "border-rose-400 focus:ring-rose-400/20 text-rose-900 dark:text-rose-200"
                : "border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            } ${className}`}
          />
          <div className="absolute right-3 text-slate-400 pointer-events-none">
            <Phone className="w-3.5 h-3.5" />
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

PhoneInput.displayName = "PhoneInput";

