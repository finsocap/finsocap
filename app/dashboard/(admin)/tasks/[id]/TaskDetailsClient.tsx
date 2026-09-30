"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Phone, Calendar, Clock, Paperclip, AtSign, 
  Send, Upload, Download, Trash2, CheckCircle2, AlertTriangle, 
  User, Building2, Briefcase, FileCheck, Loader2, Sparkles,
  ChevronDown
} from "lucide-react";
import { TaskItem, TaskStatus, TaskComment, TaskAttachment } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { useTheme } from "@/components/Providers/ThemeProvider";

export default function TaskDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { config } = useTheme();

  const [task, setTask] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    async function loadTask() {
      const data = await taskService.getById(id);
      setTask(data);
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
    const updated = await taskService.updateStatus(task.id, newStatus);
    if (updated) {
      setTask({ ...updated });
      showToast(`Status updated to "${newStatus}"`);
    }
  };

  // Handle new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setIsPostingComment(true);
    const comment = await taskService.addComment(task.id, newCommentText.trim());
    if (comment) {
      setTask({
        ...task,
        comments: [comment, ...(task.comments || [])],
      });
      setNewCommentText("");
      showToast("Comment posted!");
    }
    setIsPostingComment(false);
  };

  // Handle file upload
  const handleUploadFile = async () => {
    if (!uploadFileName.trim()) return;
    const newAtt = await taskService.addAttachment(task.id, {
      fileName: uploadFileName.trim(),
      fileSize: "1.2 MB",
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

  // Handle file delete
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (window.confirm("Delete this document?")) {
      await taskService.deleteAttachment(task.id, attachmentId);
      setTask({
        ...task,
        attachments: (task.attachments || []).filter((a) => a.id !== attachmentId),
      });
      showToast("Document removed.");
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
    <div className="space-y-7 pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-xl text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Ultra-Modern Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-gradient-to-r from-slate-900 via-[#0d1d45] to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800/80 relative overflow-hidden">
        {/* Ambient glow light */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1.5">
            <Link href="/dashboard/tasks" className="hover:text-sky-400 transition-colors">
              Tasks Operations
            </Link>
            <span>&rsaquo;</span>
            <span className="text-sky-400 font-mono font-black">{task.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 font-black">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                {task.clientName}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {task.serviceName}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                {task.nameOfBusiness} &bull; Cyber Cafe Partner: <strong className="text-amber-400">{task.partnerName}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Task Date: {task.taskDate}</span>
          </div>

          <Link
            href="/dashboard/tasks"
            className="btn-glass-modern text-xs py-2 px-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tasks</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary Card (Partner, Client, Service & Live Status Dropdown) */}
      <div className="card-luxury p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-xs">
          {/* Partner Name */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Franchise Partner
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {task.partnerName}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">CSC / Cyber Cafe</span>
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
              Client Phone
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
              Business Entity
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {task.nameOfBusiness}
            </p>
          </div>

          {/* Live Status Selector */}
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Update SLA Status
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
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-1.5 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => handleStatusChange(opt.status)}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                    <span>{opt.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Second Row: Service, Category, Due Date, Overdue */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Task Category: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{task.taskCategory}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Service: </span>
            <span className="font-black text-blue-600 dark:text-sky-400">{task.serviceName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Due Date: <strong className="text-slate-900 dark:text-white">{task.dueDate}</strong></span>
          </div>
          <div>
            {task.overdueDays && task.overdueDays > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[11px] bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue by {task.overdueDays} days
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SLA On Schedule
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Comments (Left) & Attachments + Status History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Comments Timeline */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card-luxury p-6 space-y-5">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span>Comments & Internal Communication</span>
            </h3>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Add an internal note or operational update for employee/partner..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <button type="button" title="Attach file" className="p-2 hover:text-sky-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button type="button" title="Mention teammate" className="p-2 hover:text-sky-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <AtSign className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPostingComment || !newCommentText.trim()}
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Attachments & Status History Timeline */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Attachments */}
          <div className="card-luxury p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-sky-500" />
                <span>Documents & Attachments ({task.attachments?.length || 0})</span>
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="btn-primary-vibrant text-xs py-1.5 px-3.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>

            {/* Upload Modal Drawer */}
            {uploadModalOpen && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Attach Verified Document</p>
                <input
                  type="text"
                  placeholder="Document Title (e.g. Electricity Bill.pdf)"
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
                    Confirm Attachment
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {(task.attachments || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center font-medium">No documents uploaded yet.</p>
              ) : (
                task.attachments?.map((att, idx) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs group hover:border-blue-400/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center font-black">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white hover:text-sky-500 transition-colors cursor-pointer">
                          {att.fileName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {att.uploadDate} &bull; Uploaded by {att.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading ${att.fileName}...`)}
                        title="Download Document"
                        className="w-7 h-7 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(att.id)}
                        title="Remove Document"
                        className="w-7 h-7 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Status History Audit Trail */}
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Status History Audit Trail</span>
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {(task.statusHistory || []).map((sh) => (
                <div key={sh.id} className="relative">
                  <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#0c1427]" />
                  <div>
                    <span className="font-black text-xs text-blue-600 dark:text-sky-400">
                      {sh.status}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {sh.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {sh.timestamp} {sh.updatedBy ? `• by ${sh.updatedBy}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
