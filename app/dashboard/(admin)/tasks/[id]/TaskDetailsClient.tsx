"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Phone, Calendar, Clock, Paperclip, AtSign, 
  Send, Upload, Download, CheckCircle2, AlertTriangle, 
  User, Building2, Briefcase, FileCheck, Loader2, Sparkles,
  ChevronDown, X, ShieldCheck, Award, Eye, EyeOff, FileText, QrCode, Check, Edit3
} from "lucide-react";
import { TaskItem, TaskStatus, TaskComment, TaskAttachment, CommentAttachment, TaskCertificate } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { useCrmStore } from "@/lib/crmStore";
import { useTheme } from "@/components/Providers/ThemeProvider";

export default function TaskDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { config } = useTheme();
  const { completeTask: completeTaskInStore, services, partners } = useCrmStore();

  const [task, setTask] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Mark Task as Completed Modal State (Screenshot 1 & Screenshot 2 Exact Match)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [licenceType, setLicenceType] = useState<"Permanent Licence" | "Renewal Licence">("Permanent Licence");
  const [completeCategory, setCompleteCategory] = useState("Compliance");
  const [completeServiceName, setCompleteServiceName] = useState("FSSAI Registration");
  const [completeLicenceNumber, setCompleteLicenceNumber] = useState("2156");
  const [completeIssueDate, setCompleteIssueDate] = useState("2026-09-25");
  const [completeExpiryDate, setCompleteExpiryDate] = useState("2028-09-25");
  const [completeUserId, setCompleteUserId] = useState("UPFSSAI123");
  const [completePassword, setCompletePassword] = useState("Abc@1234");
  const [showCompletePassword, setShowCompletePassword] = useState(false);
  const [completePartnerId, setCompletePartnerId] = useState("P-101");
  const [completePartnerName, setCompletePartnerName] = useState("");
  const [completePartnerNumber, setCompletePartnerNumber] = useState("");
  const [completeClientName, setCompleteClientName] = useState("");
  const [completeClientNumber, setCompleteClientNumber] = useState("");
  const [completeAttachments, setCompleteAttachments] = useState<string[]>([]);
  const completeFileInputRef = useRef<HTMLInputElement>(null);

  // Comment Attachment State
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const [commentAttachment, setCommentAttachment] = useState<{ fileName: string; fileSize: string; fileUrl: string } | null>(null);

  // Normal Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  // Submit Certificate Modal State (Requirement: Certificate table & popup)
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certNumber, setCertNumber] = useState("");
  const [certName, setCertName] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("2026-09-30");
  const [certValidTill, setCertValidTill] = useState("2027-09-29");
  const [certFileName, setCertFileName] = useState("");
  const [previewCertModal, setPreviewCertModal] = useState<TaskCertificate | null>(null);

  // Edit Task Modal State
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editClientName, setEditClientName] = useState("");
  const [editClientContact, setEditClientContact] = useState("");
  const [editBusinessName, setEditBusinessName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editService, setEditService] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("Pending");
  const [editAssignedTo, setEditAssignedTo] = useState("Rahul Jha");
  const [editPartnerId, setEditPartnerId] = useState("P-101");
  const [editPartnerName, setEditPartnerName] = useState("");
  const [editPartnerContact, setEditPartnerContact] = useState("");

  const openEditTaskModal = () => {
    if (!task) return;
    setEditClientName(task.clientName);
    setEditClientContact(task.clientContact);
    setEditBusinessName(task.nameOfBusiness);
    setEditCategory(task.taskCategory);
    setEditService(task.serviceName);
    setEditDueDate(task.dueDate);
    setEditStatus(task.status);
    setEditAssignedTo(task.assignedTo?.name || "Rahul Jha");
    setEditPartnerId(task.partnerId || "P-101");
    setEditPartnerName(task.partnerName);
    setEditPartnerContact(task.partnerContact);
    setIsEditTaskModalOpen(true);
  };

  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    const updated = await taskService.updateTask(task.id, {
      clientName: editClientName.trim(),
      clientContact: editClientContact.trim(),
      nameOfBusiness: editBusinessName.trim(),
      taskCategory: editCategory,
      serviceName: editService.trim(),
      dueDate: editDueDate,
      status: editStatus,
      partnerId: editPartnerId,
      partnerName: editPartnerName.trim(),
      partnerContact: editPartnerContact.trim(),
      assignedTo: {
        id: task.assignedTo?.id || "EMP001",
        name: editAssignedTo,
        role: task.assignedTo?.role || "Operations Specialist",
        avatar: task.assignedTo?.avatar,
      },
    });
    if (updated) {
      setTask({ ...updated });
      showToast("Task details updated successfully!");
      setIsEditTaskModalOpen(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    async function loadTask() {
      const data = await taskService.getById(id);
      setTask(data);
      if (data) {
        setCertName(`${data.serviceName} Certificate`);
        setCertNumber(`${data.serviceName.slice(0, 4).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        setCertFileName(`${data.serviceName.replace(/\s+/g, "_")}_Official_Certificate.pdf`);
        setCompletePartnerId(data.partnerId || "P-101");
        setCompletePartnerName(data.partnerName || "Rahul Jha");
        setCompletePartnerNumber(data.partnerContact || "9873207632");
        setCompleteClientName(data.clientName || "Amit Kumar");
        setCompleteClientNumber(data.clientContact || "9876543210");
        setCompleteCategory(data.taskCategory || "Compliance");
        setCompleteServiceName(data.serviceName || "FSSAI Registration");
        setCompleteLicenceNumber(data.license || `${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setLoading(false);
    }
    loadTask();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
        <p className="text-sm font-medium">Loading task workspace...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Task Not Found</h2>
        <p className="text-sm mt-1">The requested task ID could not be located.</p>
        <Link href="/dashboard/tasks" className="mt-4 inline-block text-xs font-semibold text-sky-600 hover:underline">
          &larr; Back to Tasks
        </Link>
      </div>
    );
  }

  // Handle status update
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatusDropdownOpen(false);
    if (newStatus === "Completed") {
      setIsCompleteModalOpen(true);
      return;
    }
    const updated = await taskService.updateStatus(task.id, newStatus);
    if (updated) {
      setTask({ ...updated });
      showToast(`Status updated to "${newStatus}"`);
    }
  };

  // Submit Task Completion Modal (Screenshot 1 Exact Match)
  const handleMarkTaskCompletedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeLicenceNumber.trim()) {
      showToast("Please enter a valid Licence Number");
      return;
    }

    const fileName = completeAttachments[0] || `${completeServiceName.replace(/\s+/g, "_")}_Official_Licence.pdf`;

    // 1. Update taskService
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
    });

    // 2. Persist directly to crmStore for Licence Report (Requirement: Submitting this restores data into Licence Report)
    completeTaskInStore(task.id, {
      type: licenceType,
      category: completeCategory,
      service: completeServiceName,
      number: completeLicenceNumber.trim(),
      issue: completeIssueDate,
      expiry: completeExpiryDate,
      user: completeUserId.trim(),
      password: completePassword.trim(),
      filesCount: completeAttachments.length > 0 ? completeAttachments.length : 1,
      partner: completePartnerName,
      partnerPhone: completePartnerNumber,
      client: completeClientName,
      phone: completeClientNumber,
    });

    if (updatedTask) {
      setTask({ ...updatedTask });
    } else {
      setTask((prev) => prev ? { ...prev, status: "Completed", license: completeLicenceNumber.trim() } : null);
    }

    setIsCompleteModalOpen(false);
    showToast(`Task ${task.id} marked as Completed & licence saved to Licence Report!`);
  };

  // Handle comment file selection
  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
      setCommentAttachment({
        fileName: file.name,
        fileSize: sizeStr,
        fileUrl: "#",
      });
      showToast(`Attached ${file.name} to comment.`);
    }
  };

  // Handle new comment submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() && !commentAttachment) return;
    setIsPostingComment(true);

    const attachmentsList: CommentAttachment[] | undefined = commentAttachment ? [
      {
        id: `ca-${Date.now()}`,
        fileName: commentAttachment.fileName,
        fileSize: commentAttachment.fileSize,
        fileUrl: commentAttachment.fileUrl,
      }
    ] : undefined;

    const comment = await taskService.addComment(
      task.id, 
      newCommentText.trim() || (commentAttachment ? `Uploaded document: ${commentAttachment.fileName}` : ""),
      attachmentsList,
      "Ankit Sharma",
      "Admin"
    );

    if (comment) {
      setTask({
        ...task,
        comments: [comment, ...(task.comments || [])],
      });
      setNewCommentText("");
      setCommentAttachment(null);
      if (commentFileInputRef.current) commentFileInputRef.current.value = "";
      showToast("Comment with attachment posted!");
    }
    setIsPostingComment(false);
  };

  // Handle normal file upload (Documents card)
  const handleUploadFile = async () => {
    if (!uploadFileName.trim()) return;
    const newAtt = await taskService.addAttachment(task.id, {
      fileName: uploadFileName.trim(),
      fileSize: "1.4 MB",
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      uploadedBy: "AS",
      fileUrl: "#",
    });
    if (newAtt) {
      setTask({
        ...task,
        attachments: [newAtt, ...(task.attachments || [])],
      });
      setUploadFileName("");
      setUploadModalOpen(false);
      showToast("Document attached successfully!");
    }
  };

  // Handle Certificate Submission
  const handleSubmitCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim() || !certName.trim()) return;

    const newCert = await taskService.addCertificate(task.id, {
      certificateNumber: certNumber.trim(),
      certificateName: certName.trim(),
      issuedDate: certIssueDate,
      validTill: certValidTill,
      fileName: certFileName.trim() || `${certNumber.trim()}_Verified.pdf`,
      fileUrl: "#",
      submittedBy: "Ankit Sharma (Admin)",
      submittedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Active",
    });

    if (newCert) {
      setTask({
        ...task,
        status: "Completed",
        certificates: [newCert, ...(task.certificates || [])],
      });
      setCertModalOpen(false);
      showToast(`Certificate ${newCert.certificateNumber} issued & published to Partner Dashboard!`);
    }
  };

  const statusOptions: { status: TaskStatus; dotColor: string }[] = [
    { status: "Pending", dotColor: "bg-amber-500" },
    { status: "In Progress", dotColor: "bg-sky-500" },
    { status: "Sent for Review", dotColor: "bg-purple-500" },
    { status: "Pending from Client", dotColor: "bg-orange-500" },
    { status: "Pending from Department", dotColor: "bg-indigo-500" },
    { status: "Overdue", dotColor: "bg-red-600" },
    { status: "Completed", dotColor: "bg-emerald-500" },
    { status: "Cancelled", dotColor: "bg-slate-500" },
  ];

  return (
    <div className="space-y-7 pb-24">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-xl text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner matching Screenshot 2 (Official Finsocap Theme) */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 dark:from-[#0b1226] dark:via-[#0e1c44]/80 dark:to-[#080d1a] border border-blue-200/70 dark:border-blue-900/40 shadow-sm shadow-blue-500/5">
        {/* Ambient Brand Glow Mesh */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
          <div className="absolute -top-24 -left-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-20 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          {/* Brand Identity & Title */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0e1c44] via-blue-600 to-sky-400 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0b1226] rounded-full ring-2 ring-emerald-500/20 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                  <span>FINSOCAP INTELLIGENCE SUITE</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • <Link href="/dashboard/tasks" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">Tasks</Link> &rsaquo; <span className="font-mono font-bold text-blue-600 dark:text-sky-400">{task.id}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2.5">
                Task Details
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/80 dark:border-blue-800/80 font-mono">
                  {task.id}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                View and manage complete task information, documents, comments and status updates.
              </p>
            </div>
          </div>

          {/* Right Action / Controls */}
          <div className="relative z-30 flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Created On: {task.taskDate}</span>
            </div>

            <Link
              href="/dashboard/tasks"
              className="btn-glass-modern text-xs py-2 px-3.5 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Tasks</span>
            </Link>

            {task.status !== "Completed" && (
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            )}

            <button
              type="button"
              onClick={openEditTaskModal}
              className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-blue-500/25"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="relative z-10 mt-5 pt-3.5 border-t border-blue-100/80 dark:border-blue-900/40 flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Sync Active
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Partner: <strong className="text-slate-700 dark:text-slate-300">{task.partnerName}</strong> &bull; Client: <strong className="text-slate-700 dark:text-slate-300">{task.clientName}</strong> &bull; Service: <strong className="text-slate-700 dark:text-slate-300">{task.serviceName}</strong></span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 font-bold text-[10px] border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
            Finsocap v2.4 Enterprise
          </span>
        </div>
      </div>

      {/* 2. Top Summary Card (Partner ID, Partner, Client, Business, Service, Live Status Dropdown) */}
      <div className={`card-luxury p-6 relative ${statusDropdownOpen ? "z-40" : "z-20"}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-xs">
          {/* Partner ID & Name */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Partner ID & Name
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                {task.partnerId || "P-101"}
              </span>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                {task.partnerName}
              </p>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">Franchise Partner</span>
          </div>

          {/* Partner Contact */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Partner Contact
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{task.partnerContact}</span>
              <a
                href={`tel:${task.partnerContact}`}
                title="Call Partner"
                className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 shadow-xs flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Client Name */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Client Name
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {task.clientName}
            </p>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Applicant</span>
          </div>

          {/* Client Contact */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Client Contact
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{task.clientContact}</span>
              <a
                href={`tel:${task.clientContact}`}
                title="Call Client"
                className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/20 shadow-xs flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Name of Business */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Name of Business
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {task.nameOfBusiness}
            </p>
          </div>

          {/* Live Status Selector */}
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Status
            </p>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="truncate">{task.status}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {statusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setStatusDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-1.5 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={() => handleStatusChange(opt.status)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between cursor-pointer transition-colors ${
                        task.status === opt.status ? "bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400" : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                        <span>{opt.status}</span>
                      </div>
                      {task.status === opt.status && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Second Row: Category, Service, Due Date, Overdue */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Task Category: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{task.taskCategory}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Service Name: </span>
            <span className="font-black text-blue-600 dark:text-sky-400">{task.serviceName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Due Date: <strong className="text-slate-900 dark:text-white">{task.dueDate}</strong></span>
          </div>
          <div>
            {task.overdueDays && task.overdueDays > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[11px] bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue: {task.overdueDays} days
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SLA On Schedule
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Comments with File Upload (Left) & Attachments (Right - No Delete) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Comments Timeline with Attachment Support */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card-luxury p-6 space-y-5">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span>Comments</span>
            </h3>

            {/* Comment Input Box with File Attachment (Requirement 5th ss) */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Add a comment... (Service team can attach verified files and notices)"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
              />

              {/* Selected File Chip */}
              {commentAttachment && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                    <span className="font-bold text-slate-900 dark:text-white">{commentAttachment.fileName}</span>
                    <span className="text-[10px] text-slate-400">({commentAttachment.fileSize})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCommentAttachment(null);
                      if (commentFileInputRef.current) commentFileInputRef.current.value = "";
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  {/* Paperclip Button with file input */}
                  <label
                    title="Attach file with comment"
                    className="p-2 hover:text-sky-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center"
                  >
                    <Paperclip className="w-4 h-4" />
                    <input
                      ref={commentFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleCommentFileChange}
                    />
                  </label>
                  <button type="button" title="Mention teammate" className="p-2 hover:text-sky-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <AtSign className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPostingComment || (!newCommentText.trim() && !commentAttachment)}
                  className="btn-primary-vibrant text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comments Feed Timeline */}
            <div className="space-y-3 pt-2">
              {(task.comments || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center font-medium">No comments yet. Start the conversation!</p>
              ) : (
                task.comments?.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {comment.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {comment.userName}
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {comment.userRole}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {comment.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 pl-10 font-medium">
                      {comment.text}
                    </p>

                    {/* Attached files inside comment (Requirement 5th ss) */}
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="pl-10 pt-1 space-y-1.5">
                        {comment.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-slate-800 dark:text-slate-200">{att.fileName}</span>
                            {att.fileSize && <span className="text-[10px] text-slate-400">({att.fileSize})</span>}
                            <button
                              type="button"
                              onClick={() => showToast(`Opening ${att.fileName}...`)}
                              className="text-blue-600 hover:underline text-[11px] font-bold ml-1 cursor-pointer"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Attachments (View & Download Only - NO DELETE) + Status History */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Attachments */}
          <div className="card-luxury p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-sky-500" />
                <span>Attachments</span>
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="btn-primary-vibrant text-xs py-1.5 px-3.5 cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            {/* Upload Modal Drawer */}
            {uploadModalOpen && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Customer Document</p>
                <input
                  type="text"
                  placeholder="Document Title (e.g. Address Proof.pdf)"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-3 py-1.5 text-slate-500 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadFile}
                    className="btn-primary-vibrant text-xs py-1.5 px-3.5 cursor-pointer"
                  >
                    Confirm Upload
                  </button>
                </div>
              </div>
            )}

            {/* Attachments Table matching Screenshot 5 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">File Name</th>
                    <th className="py-2.5 px-2">Upload Date</th>
                    <th className="py-2.5 px-2">Uploaded By</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {(task.attachments || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No documents uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    task.attachments?.map((att, idx) => (
                      <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-2 font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer">
                          <button
                            type="button"
                            onClick={() => showToast(`Previewing ${att.fileName}...`)}
                            className="text-left font-bold"
                          >
                            {att.fileName}
                          </button>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap">
                          {att.uploadDate}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] inline-flex items-center justify-center">
                            {att.uploadedBy}
                          </span>
                        </td>
                        {/* ONLY View & Download Allowed - NO DELETE BUTTON (Requirement 5th ss) */}
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => showToast(`Opening preview for ${att.fileName}...`)}
                              title="View Document"
                              className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`Downloading ${att.fileName}...`)}
                              title="Download Document"
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Status History Audit Trail */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Status History</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 text-xs">
              {(task.statusHistory || []).map((sh) => (
                <div key={sh.id} className="relative">
                  <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#0c1427]" />
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-600 dark:text-sky-400">
                      {sh.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {sh.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                    {sh.title}
                  </p>
                  {sh.updatedBy && (
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      by {sh.updatedBy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Issued Certificates & Licences Section - Only visible when task is Completed (Requirement 2nd ss) */}
      {task.status === "Completed" && (
        <div className="card-luxury p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                  <span>Issued Certificates & Licences</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                    {(task.certificates || []).length} Issued
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official government registrations and approved license certificates issued to client and visible on Partner Dashboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCertModalOpen(true)}
              className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Award className="w-4 h-4" />
              <span>+ Submit Certificate / Licence</span>
            </button>
          </div>

          {/* Certificates Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                  <th className="py-3 px-3.5">#</th>
                  <th className="py-3 px-3.5">Certificate Number</th>
                  <th className="py-3 px-3.5">Certificate Name</th>
                  <th className="py-3 px-3.5">Issue Date</th>
                  <th className="py-3 px-3.5">Valid Till</th>
                  <th className="py-3 px-3.5">Submitted By</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {(task.certificates || []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      <Award className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No certificates issued yet for this task.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Once government approval is received, click &quot;+ Submit Certificate / Licence&quot; to publish the verified license.
                      </p>
                    </td>
                  </tr>
                ) : (
                  task.certificates?.map((cert, idx) => (
                    <tr key={cert.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-blue-600 dark:text-sky-400">
                          {cert.certificateNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                        {cert.certificateName}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                        {cert.issuedDate}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                        {cert.validTill || "Lifetime / NA"}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                        {cert.submittedBy}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewCertModal(cert)}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Certificate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`Downloading ${cert.certificateNumber}...`)}
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Submit Certificate / Licence (Additional Point 1) */}
      {certModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Submit Verified Certificate / Licence
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCertificate} className="space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                Submitting this certificate will mark the task as <strong>Completed</strong> and immediately publish the download link on the <strong>Partner Dashboard</strong> for {task.partnerName}.
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Certificate / Licence Number *
                </label>
                <input
                  type="text"
                  required
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="e.g. FSSAI-2026-98124 or TM-2026-0158"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Certificate Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="e.g. FSSAI Registration Certificate (Food Safety)"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={certIssueDate}
                    onChange={(e) => setCertIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Valid Till / Expiry Date
                  </label>
                  <input
                    type="date"
                    value={certValidTill}
                    onChange={(e) => setCertValidTill(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Certificate Document (PDF / Image)
                </label>
                <input
                  type="text"
                  value={certFileName}
                  onChange={(e) => setCertFileName(e.target.value)}
                  placeholder="e.g. FSSAI_Certificate_Signed.pdf"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCertModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold-vibrant text-xs py-2 px-5 cursor-pointer shadow-md shadow-amber-500/25"
                >
                  Confirm &amp; Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Certificate Preview */}
      {previewCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  Verified Government Licence
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCertModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Visual Card */}
            <div className="p-5 bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-amber-300 dark:border-amber-700/60 text-center space-y-3 relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-400/30">
                <Award className="w-6 h-6" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Government of India Compliance Registry
                </p>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {previewCertModal.certificateName}
                </h4>
                <p className="font-mono text-xs font-bold text-blue-600 dark:text-sky-400 mt-0.5">
                  Registration No: {previewCertModal.certificateNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Client / Entity</span>
                  <span className="font-bold text-slate-900 dark:text-white">{task.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Business Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{task.nameOfBusiness}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Issue Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{previewCertModal.issuedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Valid Till</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{previewCertModal.validTill || "Lifetime"}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Digitally Verified &amp; Signed by Registrar</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewCertModal(null)}
                className="btn-glass-modern text-xs py-2 px-4 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Downloading official PDF for ${previewCertModal.certificateNumber}...`);
                  setPreviewCertModal(null);
                }}
                className="btn-gold-vibrant text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Mark Task as Completed (Screenshot 1 Exact Match) */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Mark Task as Completed
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkTaskCompletedSubmit} className="space-y-4 text-xs">
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
                  {/* Permanent Licence Card */}
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
                      name="licenceType"
                      checked={licenceType === "Permanent Licence"}
                      onChange={() => setLicenceType("Permanent Licence")}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">
                        Permanent Licence
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Initial/First time licence
                      </p>
                    </div>
                  </div>

                  {/* Renewal Licence Card */}
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
                      name="licenceType"
                      checked={licenceType === "Renewal Licence"}
                      onChange={() => setLicenceType("Renewal Licence")}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">
                        Renewal Licence
                      </p>
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
                        const match = services.find((s) => s.category === cat);
                        if (match) setCompleteServiceName(match.name);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold cursor-pointer"
                    >
                      {Array.from(new Set(services.map((s) => s.category))).map((c) => (
                        <option key={c} value={c}>{c}</option>
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
                        const match = services.find((s) => s.name === name);
                        if (match) setCompleteCategory(match.category);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white cursor-pointer"
                    >
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
                      setCompleteAttachments([f.name]);
                      showToast(`Uploaded ${f.name}`);
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
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-95"
                >
                  Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit / Modify Task Modal */}
      {isEditTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Edit Task Details ({task.id})
                  </h3>
                  <p className="text-xs text-slate-500">Modify client, category, status, due date and assignment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTaskModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Client Contact Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientContact}
                    onChange={(e) => setEditClientContact(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Name of Business
                  </label>
                  <input
                    type="text"
                    value={editBusinessName}
                    onChange={(e) => setEditBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    placeholder="e.g. 15 Oct 2026"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Task Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Food & Beverage">Food &amp; Beverage</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Taxation">Taxation</option>
                    <option value="Registration">Registration</option>
                    <option value="Licence">Licence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Service Name * (Catalog Only)
                  </label>
                  <select
                    required
                    value={editService}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditService(val);
                      const match = services.find((s) => s.name === val);
                      if (match) setEditCategory(match.category);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Task Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="WIP">WIP</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Assigned Staff Member
                  </label>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Rahul Jha">Rahul Jha (Senior Executive)</option>
                    <option value="Kanhaiya">Kanhaiya (Compliance Officer)</option>
                    <option value="Gaurav">Gaurav (Operations Specialist)</option>
                    <option value="Roshan">Roshan (Case Manager)</option>
                    <option value="Roshni">Roshni (Tax Associate)</option>
                    <option value="Asha">Asha (Document Analyst)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Partner ID
                  </label>
                  <select
                    value={editPartnerId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setEditPartnerId(pid);
                      const found = partners.find((p) => p.partnerId === pid);
                      if (found) {
                        setEditPartnerName(found.name);
                        setEditPartnerContact(found.phone);
                      }
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {partners.map((p) => (
                      <option key={p.partnerId} value={p.partnerId}>
                        {p.partnerId} • {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={editPartnerName}
                    onChange={(e) => setEditPartnerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Partner Contact Number
                  </label>
                  <input
                    type="text"
                    value={editPartnerContact}
                    onChange={(e) => setEditPartnerContact(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditTaskModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2.5 px-6 shadow-md shadow-blue-500/25 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Task Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
