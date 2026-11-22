"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  User,
  Phone,
  FileText,
  Paperclip,
  FileCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { useCrmStore } from "@/lib/crmStore";
import { reportsService } from "@/lib/api/reportsService";
import { taskCollaborationService } from "@/lib/api/taskCollaborationService";
import { taskService } from "@/lib/services/taskService";
import { getBackendStatusTransitionPath, TaskItem } from "@/types";
import { useToast } from "@/components/Global/ToastNotification";

export interface TaskCompleteModalProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedTask: TaskItem) => void;
}

export default function TaskCompleteModal({
  task,
  isOpen,
  onClose,
  onSuccess,
}: TaskCompleteModalProps) {
  const toast = useToast();
  const { services, partners, completeTask: completeTaskInStore } = useCrmStore();

  const [licenceType, setLicenceType] = useState<"Permanent Licence" | "Renewal Licence">("Permanent Licence");
  const [completeCategory, setCompleteCategory] = useState("");
  const [completeServiceName, setCompleteServiceName] = useState("");
  const [completePartnerId, setCompletePartnerId] = useState("");
  const [completePartnerName, setCompletePartnerName] = useState("");
  const [completePartnerNumber, setCompletePartnerNumber] = useState("");
  const [completeClientName, setCompleteClientName] = useState("");
  const [completeClientNumber, setCompleteClientNumber] = useState("");
  const [completeLicenceNumber, setCompleteLicenceNumber] = useState("");
  const [completeIssueDate, setCompleteIssueDate] = useState("");
  const [completeExpiryDate, setCompleteExpiryDate] = useState("");
  const [completeUserId, setCompleteUserId] = useState("");
  const [completePassword, setCompletePassword] = useState("");
  const [showCompletePassword, setShowCompletePassword] = useState(false);
  const [completeAttachments, setCompleteAttachments] = useState<string[]>([]);
  const [completeAttachmentFile, setCompleteAttachmentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const completeFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize modal form fields whenever task changes or modal opens
  useEffect(() => {
    if (!task || !isOpen) return;

    const today = new Date().toISOString().split("T")[0];
    const expiry = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0];

    const anyTask = task as any;
    const initialCategory = task.taskCategory || anyTask?.category || (services[0]?.category || "Taxation");
    const initialServiceName =
      task.serviceName ||
      anyTask?.service ||
      (services.find((s) => s.category?.toLowerCase() === initialCategory.toLowerCase())?.name || services[0]?.name || "");

    setLicenceType("Permanent Licence");
    setCompleteCategory(initialCategory);
    setCompleteServiceName(initialServiceName);
    setCompletePartnerId(task.partnerId || anyTask?.partnerId || (partners[0]?.partnerId || "P-101"));
    setCompletePartnerName(task.partnerName || anyTask?.partner || (partners[0]?.name || ""));
    setCompletePartnerNumber(task.partnerContact || anyTask?.partnerPhone || (partners[0]?.phone || ""));
    setCompleteClientName(task.clientName || anyTask?.client || "");
    setCompleteClientNumber(task.clientContact || anyTask?.phone || anyTask?.contactNumber || "");

    setCompleteLicenceNumber("");
    setCompleteIssueDate(today);
    setCompleteExpiryDate(expiry);
    setCompleteUserId("");
    setCompletePassword("");
    setShowCompletePassword(false);
    setCompleteAttachments([]);
    setCompleteAttachmentFile(null);
  }, [task, isOpen, services, partners]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isSubmittingRef.current) return;

    // 1. Mandatory Validation: All fields and attachments are compulsory
    if (!completeLicenceNumber.trim()) {
      toast.error("Licence Number is mandatory to complete the task.");
      return;
    }
    if (!completeIssueDate) {
      toast.error("Issue Date is mandatory.");
      return;
    }
    if (!completeExpiryDate) {
      toast.error("Expiry Date is mandatory.");
      return;
    }
    if (!completeUserId.trim()) {
      toast.error("Portal User ID is mandatory.");
      return;
    }
    if (!completePassword.trim()) {
      toast.error("Portal Password is mandatory.");
      return;
    }
    if (completeAttachments.length === 0 && !completeAttachmentFile) {
      toast.error("Official Certificate Attachment is mandatory. Please upload the file.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const fileName = completeAttachments[0] || `${completeServiceName.replace(/\s+/g, "_")}_Official_Licence.pdf`;

      // 1. Update in taskService
      const updatedTask = await taskService.completeTaskWithLicence(task.id, {
        licenceType,
        category: completeCategory,
        service: completeServiceName,
        licenceNumber: completeLicenceNumber.trim(),
        issueDate: completeIssueDate,
        expiryDate: completeExpiryDate,
        userId: completeUserId.trim(),
        password: completePassword.trim(),
        fileName,
        completedBy: "Administrator",
      });

      // 2. Persist directly to crmStore for Licence Report
      const submittedPassword = completePassword.trim() || "Abc@1234";
      const submittedLicenceNumber = completeLicenceNumber.trim();

      if (typeof window !== "undefined") {
        try {
          const rawMap = sessionStorage.getItem("finsocap_licence_passwords") || "{}";
          const map = JSON.parse(rawMap);
          map[submittedLicenceNumber] = submittedPassword;
          if (task.id) map[task.id] = submittedPassword;
          sessionStorage.setItem("finsocap_licence_passwords", JSON.stringify(map));
        } catch (e) {
          console.warn("Save password to session storage failed:", e);
        }
      }

      completeTaskInStore(task.id, {
        type: licenceType,
        category: completeCategory,
        service: completeServiceName,
        number: submittedLicenceNumber,
        issue: completeIssueDate,
        expiry: completeExpiryDate,
        user: completeUserId.trim(),
        password: submittedPassword,
        filesCount: completeAttachments.length > 0 ? completeAttachments.length : 1,
        partner: completePartnerName,
        partnerPhone: completePartnerNumber,
        client: completeClientName,
        phone: completeClientNumber,
      });

      // 3. Sync to Live Reports API: POST /api/admin/reports/licences
      try {
        const rawCat = (completeCategory || task.taskCategory || "").toUpperCase();
        const validBackendCategory =
          rawCat.includes("FOOD") || rawCat.includes("FSSAI")
            ? "FOOD_BEVERAGE"
            : rawCat.includes("LEGAL") || rawCat.includes("IP") || rawCat.includes("TRADEMARK")
            ? "LEGAL_IP"
            : rawCat.includes("TAX") || rawCat.includes("GST") || rawCat.includes("INCOME")
            ? "TAXATION"
            : rawCat.includes("COMPANY") || rawCat.includes("REG") || rawCat.includes("INCORPORATION")
            ? "COMPANY_REG"
            : "LICENSES";

        await reportsService.registerLicence({
          taskId: task.id,
          partnerName: completePartnerName || task.partnerName,
          clientName: completeClientName || task.clientName,
          serviceCategory: validBackendCategory,
          governmentPortalUrl: "https://finsocap.cloud",
          portalUserId: completeUserId.trim() || "UPFSSAI123",
          portalPassword: completePassword.trim() || "Abc@1234",
          licenceNumber: completeLicenceNumber.trim(),
          issueDate: completeIssueDate,
          expiryDate: completeExpiryDate,
        });
      } catch (licSyncErr) {
        console.warn("Live reports licence registration sync warning:", licSyncErr);
      }

      // 4. Live Backend Status Sync to COMPLETED with Certificate Attachment Upload
      try {
        const numericTaskId = task.numericId || (Number(task.id.replace(/\D/g, "")) || 0);
        if (numericTaskId > 0) {
          // Resolve current logged in user role from localStorage session
          let isStaffRole = false;
          let currentUserName = "Specialist";
          try {
            const sess = localStorage.getItem("finsocap_user_session");
            if (sess) {
              const p = JSON.parse(sess);
              const r = (p?.user?.role || p?.role || "").toUpperCase();
              if (["STAFF", "SPECIALIST", "EXECUTIVE"].includes(r)) isStaffRole = true;
              if (p?.user?.name || p?.name) currentUserName = p?.user?.name || p?.name;
            }
          } catch (e) {}

          const effectiveUploadRole: "ADMIN" | "STAFF" = isStaffRole ? "STAFF" : "ADMIN";

          // Fast PUT to core task (admin only)
          if (!isStaffRole) {
            fetch(`/api/proxy/tasks/${numericTaskId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "COMPLETED",
                version: typeof task.version === "number" ? task.version + 1 : 1,
              }),
            }).catch((err) => console.warn("Direct PUT task completion warning:", err));
          }

          // 4A. If file attached, upload work document before marking finished
          if (completeAttachmentFile) {
            try {
              await taskCollaborationService.uploadWorkDocument(
                numericTaskId,
                completeAttachmentFile,
                {
                  title: `${completeServiceName} Official Certificate - ${completeLicenceNumber.trim()}`,
                  documentType: "CERTIFICATE",
                },
                effectiveUploadRole
              );
            } catch (uploadErr) {
              console.warn("Completion attachment upload warning:", uploadErr);
            }
          }

          // 4B. Status transition to COMPLETED
          if (isStaffRole) {
            await taskCollaborationService.updateTaskStatus(
              numericTaskId,
              {
                status: "COMPLETED",
                note: `Task completed with issued licence / certificate #${completeLicenceNumber.trim()} by ${currentUserName}`,
              },
              "STAFF"
            ).catch((err) => console.warn("Staff completion transition warning:", err));
          } else {
            // Status transition workflow endpoint with stepwise transition
            let currentLiveVersion = typeof task.version === "number" ? task.version : 0;
            try {
              const verRes = await fetch(`/api/proxy/service-requests/${numericTaskId}`, { cache: "no-store" });
              if (verRes.ok) {
                const verJson = await verRes.json();
                if (typeof verJson?.data?.version === "number") currentLiveVersion = verJson.data.version;
              }
            } catch (e) {}

            const currentDbStatus = String(task.status);
            const transitionHops = getBackendStatusTransitionPath(currentDbStatus, "COMPLETED");

            for (let i = 0; i < transitionHops.length; i++) {
              const hopStatus = transitionHops[i];
              const isFinalHop = i === transitionHops.length - 1;
              const hopNote = isFinalHop
                ? `Task completed with issued licence / certificate #${completeLicenceNumber.trim()}`
                : `Automatic stepwise bridge to ${hopStatus}`;

              try {
                const hopRes = await taskCollaborationService.updateTaskStatus(
                  numericTaskId,
                  {
                    status: hopStatus,
                    note: hopNote,
                    reason: isFinalHop ? `Licence No: ${completeLicenceNumber.trim()} issued. Valid till ${completeExpiryDate}` : hopNote,
                    decisionNotes: isFinalHop ? `Licence No: ${completeLicenceNumber.trim()} issued. Valid till ${completeExpiryDate}` : hopNote,
                    expectedVersion: currentLiveVersion,
                  },
                  "ADMIN"
                );
                if (hopRes?.data?.version) {
                  currentLiveVersion = hopRes.data.version;
                } else {
                  currentLiveVersion += 1;
                }
              } catch (hopErr: any) {
                console.warn(`Completion bridge hop ${hopStatus} error:`, hopErr);
                if (isFinalHop) {
                  toast.error(hopErr?.message || "Status change rejected by server transition rules", "Status Error");
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("Complete status backend sync warning:", e);
      }

      toast.success(`Task ${task.id} marked as Completed & licence saved to Licence Report!`, "Success!");

      const finalizedTask: TaskItem = updatedTask || {
        ...task,
        status: "Completed",
        license: completeLicenceNumber.trim(),
      };

      if (onSuccess) {
        onSuccess(finalizedTask);
      }
      onClose();
    } catch (err: any) {
      console.error("Task completion failed:", err);
      toast.error(err?.message || "Failed to mark task as completed", "Error");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95">
        <ModalHeaderBanner
          icon={CheckCircle2}
          badge="FINAL CLEARANCE"
          title="Mark Task as Completed"
          description="Verify statutory approval details and publish certificate link to the partner."
          badgeTag="Certification"
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          {/* Section 1: Basic Details */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-sky-300 font-bold text-xs">
              <User className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Basic Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Task ID
                </label>
                <input
                  type="text"
                  disabled
                  value={task.id}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-500 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Partner ID
                </label>
                <select
                  value={completePartnerId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setCompletePartnerId(pid);
                    const found = partners.find((p) => p.partnerId === pid);
                    if (found) {
                      setCompletePartnerName(found.name);
                      setCompletePartnerNumber(found.phone);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                >
                  {completePartnerId && !partners.some((p) => p.partnerId === completePartnerId) && (
                    <option value={completePartnerId}>{completePartnerId}</option>
                  )}
                  {partners.map((p) => (
                    <option key={p.partnerId} value={p.partnerId}>
                      {p.partnerId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Partner Name
                </label>
                <input
                  type="text"
                  value={completePartnerName}
                  onChange={(e) => setCompletePartnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Partner Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={completePartnerNumber}
                    onChange={(e) => setCompletePartnerNumber(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-semibold text-slate-900 dark:text-white"
                  />
                  <a
                    href={`tel:${completePartnerNumber}`}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 dark:text-sky-400 hover:text-blue-700"
                    title="Call Partner"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={completeClientName}
                  onChange={(e) => setCompleteClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Client Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={completeClientNumber}
                    onChange={(e) => setCompleteClientNumber(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-semibold text-slate-900 dark:text-white"
                  />
                  <a
                    href={`tel:${completeClientNumber}`}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 dark:text-sky-400 hover:text-blue-700"
                    title="Call Client"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Licence Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
              <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Licence Type</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setLicenceType("Permanent Licence")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  licenceType === "Permanent Licence"
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="modalLicenceType"
                  checked={licenceType === "Permanent Licence"}
                  onChange={() => setLicenceType("Permanent Licence")}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">Permanent Licence</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Initial/First time licence
                  </p>
                </div>
              </div>

              <div
                onClick={() => setLicenceType("Renewal Licence")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  licenceType === "Renewal Licence"
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="modalLicenceType"
                  checked={licenceType === "Renewal Licence"}
                  onChange={() => setLicenceType("Renewal Licence")}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">Renewal Licence</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Existing licence renewal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Licence Details */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
              <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Licence Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Task Category
                </label>
                <select
                  value={completeCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setCompleteCategory(cat);
                    const match = services.find((s) => s.category?.toLowerCase() === cat.toLowerCase());
                    if (match) setCompleteServiceName(match.name);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  {completeCategory && !services.some((s) => s.category?.toLowerCase() === completeCategory.toLowerCase()) && (
                    <option value={completeCategory}>{completeCategory}</option>
                  )}
                  {Array.from(new Set(services.map((s) => s.category).filter(Boolean))).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Service Name * (Catalog Only)
                </label>
                <select
                  value={completeServiceName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCompleteServiceName(name);
                    const match = services.find((s) => s.name?.toLowerCase() === name.toLowerCase());
                    if (match && match.category) setCompleteCategory(match.category);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white cursor-pointer"
                >
                  {completeServiceName && !services.some((s) => s.name?.toLowerCase() === completeServiceName.toLowerCase()) && (
                    <option value={completeServiceName}>{completeServiceName}</option>
                  )}
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Licence Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2156"
                  value={completeLicenceNumber}
                  onChange={(e) => setCompleteLicenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={completeIssueDate}
                  onChange={(e) => setCompleteIssueDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={completeExpiryDate}
                  onChange={(e) => setCompleteExpiryDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPFSSAI123"
                  value={completeUserId}
                  onChange={(e) => setCompleteUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showCompletePassword ? "text" : "password"}
                    placeholder="Password"
                    value={completePassword}
                    onChange={(e) => setCompletePassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCompletePassword(!showCompletePassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCompletePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Attachments */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
              <Paperclip className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Attachments</span>
            </div>

            <input
              type="file"
              ref={completeFileInputRef}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setCompleteAttachmentFile(f);
                  setCompleteAttachments([f.name]);
                  toast.success(`Selected attachment: ${f.name}`);
                }
              }}
            />

            <div
              onClick={() => completeFileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 rounded-2xl p-5 text-center bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 transition-all cursor-pointer space-y-1"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                <Paperclip className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-blue-600 dark:text-sky-400 underline">Choose files</span> or drag &amp; drop
              </p>
              <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 10 MB)</p>
              {completeAttachments.length > 0 && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-bold">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{completeAttachments[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-95 inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Completing..." : "Complete"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

