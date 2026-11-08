"use client";

import React, { useState } from "react";
import { 
  Building2, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Copy,
  Clock,
  User,
  ShoppingBag,
  ExternalLink,
  FileText,
  Lock,
  Download,
  Eye,
  Loader2
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { PartnerProfileData } from "@/lib/api/partnerPortalService";
import { apiClient } from "@/lib/api/apiClient";

interface PartnerProfileModalProps {
  profile: PartnerProfileData;
  onClose: () => void;
}

export default function PartnerProfileModal({ profile, onClose }: PartnerProfileModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleViewPrivateDoc = async (url: string, label: string) => {
    try {
      setOpeningDoc(label);
      if (url.startsWith("http://") || url.startsWith("https://")) {
        // Op 22 secure blob fetch if endpoint matches service-requests original-file
        if (url.includes("/api/partners/service-requests/")) {
          const endpoint = url.replace(/https?:\/\/[^\/]+/, "");
          const { objectUrl } = await apiClient.fetchBlob(endpoint, true);
          window.open(objectUrl, "_blank");
        } else {
          window.open(url, "_blank");
        }
      } else {
        const { objectUrl } = await apiClient.fetchBlob(url, true);
        window.open(objectUrl, "_blank");
      }
    } catch (e: any) {
      window.open(url, "_blank");
    } finally {
      setOpeningDoc(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={ShoppingBag}
            badge="FINSOCAP FRANCHISE HUB"
            title={`${profile.name} · Franchise Partner Profile`}
            description="Verified partner registration details, KYC documents, and business credentials."
            badgeTag="Op 04 · My Profile"
            onClose={onClose}
          />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Top Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-sky-300">
                Partner Account Status
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {profile.shopName || profile.name}
              </h3>
              <p className="text-slate-500 text-[11px]">Partner ID: #{profile.id} &bull; User ID: #{profile.userId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
              profile.status === "APPROVED" || profile.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400"
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{profile.status}</span>
            </span>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Contact & Identity */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Contact & Identity
              </h4>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                    <span>{profile.email}</span>
                    <button onClick={() => handleCopy(profile.email, "email")} className="text-slate-400 hover:text-blue-600">
                      {copiedKey === "email" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Aadhaar:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{profile.adhaarNumber || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">PAN:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white uppercase">{profile.panNumber || "—"}</span>
                </div>
              </div>
            </div>

            {/* Business & Banking */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                Banking & Payout Account
              </h4>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.bankName || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">A/C Number:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{profile.accountNumber || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white uppercase">{profile.ifscCode || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Branch:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.branchName || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Shop Location */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Premises & Physical Address
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {[profile.address, profile.city, profile.state, profile.pinCode].filter(Boolean).join(", ") || "No address provided."}
            </p>
          </div>

          {/* KYC Documents Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              KYC & Identity Documents (Bearer Protected)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Aadhaar Document</p>
                  <p className="text-[10px] text-slate-500 font-mono">{profile.adhaarDocUrl ? "Document on file" : "Not uploaded"}</p>
                </div>
                {profile.adhaarDocUrl && (
                  <button
                    onClick={() => handleViewPrivateDoc(profile.adhaarDocUrl!, "Aadhaar")}
                    disabled={openingDoc === "Aadhaar"}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 flex items-center gap-1"
                    title="View Aadhaar with Bearer Token"
                  >
                    {openingDoc === "Aadhaar" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">View</span>
                  </button>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">PAN Card Document</p>
                  <p className="text-[10px] text-slate-500 font-mono">{profile.panDocUrl ? "Document on file" : "Not uploaded"}</p>
                </div>
                {profile.panDocUrl && (
                  <button
                    onClick={() => handleViewPrivateDoc(profile.panDocUrl!, "PAN")}
                    disabled={openingDoc === "PAN"}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 flex items-center gap-1"
                    title="View PAN with Bearer Token"
                  >
                    {openingDoc === "PAN" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">View</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Created: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB") : "—"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 transition-colors shadow-sm"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
