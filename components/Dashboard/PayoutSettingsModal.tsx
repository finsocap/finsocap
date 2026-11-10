"use client";

import React, { useState } from "react";
import {
  Building2,
  QrCode,
  Save,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  Upload,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import {
  AdminPayoutSettings,
  saveAdminPayoutSettings,
} from "@/lib/adminPayoutConfig";
import { useToast } from "@/components/Global/ToastNotification";

interface PayoutSettingsModalProps {
  initialSettings: AdminPayoutSettings;
  onClose: () => void;
  onSaved: (settings: AdminPayoutSettings) => void;
}

export default function PayoutSettingsModal({
  initialSettings,
  onClose,
  onSaved,
}: PayoutSettingsModalProps) {
  const toast = useToast();

  const [upiId, setUpiId] = useState(initialSettings.upiId);
  const [payeeName, setPayeeName] = useState(initialSettings.payeeName);
  const [bankName, setBankName] = useState(initialSettings.bankName);
  const [accountNumber, setAccountNumber] = useState(initialSettings.accountNumber);
  const [ifscCode, setIfscCode] = useState(initialSettings.ifscCode);
  const [accountType, setAccountType] = useState<"CURRENT" | "SAVINGS">(initialSettings.accountType);
  const [branch, setBranch] = useState(initialSettings.branch);
  const [customQrUrl, setCustomQrUrl] = useState<string | undefined>(initialSettings.customQrUrl);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomQrUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!upiId.trim() || !payeeName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      toast.error("Please fill in all mandatory banking & UPI fields.");
      return;
    }

    const updated: AdminPayoutSettings = {
      upiId: upiId.trim(),
      payeeName: payeeName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      accountType,
      branch: branch.trim(),
      customQrUrl,
      updatedAt: new Date().toISOString(),
    };

    saveAdminPayoutSettings(updated);
    toast.success("Banking & Payment QR settings saved successfully! Partner payment requests will automatically use these details.", "Saved");
    onSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={Building2}
            badge="CORPORATE RECEIVING ACCOUNT"
            title="Configure Payment Details & QR"
            description="Set up UPI ID, bank account & QR code sent to partners when task is marked complete."
            badgeTag="Admin Settings"
            onClose={onClose}
          />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Note Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 dark:text-sky-200 leading-relaxed">
              Ye details partner ko payment request ke time automatically dikhegi — QR code scan karke ya direct bank account me transfer karne ke liye.
            </p>
          </div>

          {/* Section 1: UPI Configuration */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                UPI & QR Code Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. finsocap@icici"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payee Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. FinSoCap Financial Services Pvt Ltd"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Custom Static Standee QR Upload (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Custom Standee / Bank QR Code (Optional)
              </label>
              <div className="flex items-center gap-3">
                {customQrUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white p-1 shrink-0">
                    <img src={customQrUrl} alt="Custom QR" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setCustomQrUrl(undefined)}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 text-[9px]"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ) : null}
                <label className="px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer hover:border-blue-500 inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customQrUrl ? "Change Standee QR" : "Upload Custom Standee QR Image"}</span>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Agar upload nahi karenge to system automatically configured UPI ID se live dynamic QR generate karega.
              </span>
            </div>
          </div>

          {/* Section 2: Bank Account Configuration */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Bank Account Details (IMPS / NEFT)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. ICICI Bank / HDFC Bank"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e: any) => setAccountType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="CURRENT">Current Account (Corporate)</option>
                  <option value="SAVINGS">Savings Account</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 000405001234"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ICIC0000004"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Branch Name / City
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Connaught Place, New Delhi"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-vibrant text-xs py-2 px-5 cursor-pointer inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Payment Settings</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

