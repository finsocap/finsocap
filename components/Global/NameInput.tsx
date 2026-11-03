"use client";

import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { formatName, validatePersonName } from "@/lib/formatters";
import { AlertCircle } from "lucide-react";

interface NameInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  showError?: boolean;
  errorMessage?: string;
  isBusinessName?: boolean;
}

export const NameInput = forwardRef<HTMLInputElement, NameInputProps>(
  (
    {
      value,
      onChange,
      label,
      required,
      showError = true,
      errorMessage,
      isBusinessName = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const [touched, setTouched] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Filter out illegal characters for personal names if not business name
      if (!isBusinessName && /[0-9!@#$%^&*()_+=\[\]{};:"\\|<>/?]/.test(raw)) {
        return;
      }
      onChange(raw);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      // Auto-capitalize on blur (or as complete words are entered)
      const formatted = formatName(value);
      if (formatted !== value) {
        onChange(formatted);
      }
      props.onBlur?.(e);
    };

    const validation = isBusinessName
      ? { isValid: Boolean(value.trim()), error: "Business name cannot be empty." }
      : validatePersonName(value);

    const hasError = touched && !validation.isValid && (required || Boolean(value));

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={props.placeholder || (isBusinessName ? "e.g. Rahul Enterprises" : "e.g. Rahul Jha")}
          className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 ${
            hasError
              ? "border-rose-400 focus:ring-rose-400/20 text-rose-900 dark:text-rose-200"
              : "border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 text-slate-900 dark:text-white"
          } ${className}`}
        />

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

NameInput.displayName = "NameInput";

