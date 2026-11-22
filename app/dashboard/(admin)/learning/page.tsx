"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  FileText, 
  UploadCloud, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  Search, 
  Clock, 
  Calendar, 
  HardDrive, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Plus, 
  RefreshCw,
  ExternalLink,
  BookOpen,
  Link2,
  Video
} from "lucide-react";
import { tutorialService, TutorialItem, PaginatedTutorials } from "@/lib/api/tutorialService";
import Pagination from "@/components/Dashboard/Pagination";
import { useToast } from "@/components/Global/ToastNotification";

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Parses raw title to extract display title, link, and content
 * Supports formats:
 * 1. Multiline / Linebreak format:
 *    Title
 *    https://link.com
 *    Content / notes
 * 2. Pipe separator format:
 *    Title | https://link.com | Content
 */
function parseTutorialTitle(rawTitle: string): { 
  displayTitle: string; 
  linkUrl: string | null; 
  contentSnippet: string | null;
} {
  if (!rawTitle) return { displayTitle: "", linkUrl: null, contentSnippet: null };

  const lines = rawTitle.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    const title = lines[0];
    let foundUrl: string | null = null;
    const contentParts: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const urlMatch = line.match(/^https?:\/\/[^\s]+/i);
      if (urlMatch && !foundUrl) {
        foundUrl = urlMatch[0];
      } else {
        contentParts.push(line);
      }
    }

    return {
      displayTitle: title,
      linkUrl: foundUrl,
      contentSnippet: contentParts.join(" "),
    };
  }

  // Check pipe separator: "Title | https://... | Content"
  if (rawTitle.includes(" | ")) {
    const parts = rawTitle.split(" | ").map(p => p.trim());
    let url: string | null = null;
    let title = parts[0];
    const contents: string[] = [];

    for (let i = 1; i < parts.length; i++) {
      if (/^https?:\/\//i.test(parts[i]) && !url) {
        url = parts[i];
      } else {
        contents.push(parts[i]);
      }
    }

    return {
      displayTitle: title,
      linkUrl: url,
      contentSnippet: contents.join(" | ") || null,
    };
  }

  // Check single line embedded URL
  const urlMatch = rawTitle.match(/(https?:\/\/[^\s\)]+)/i);
  if (urlMatch) {
    const url = urlMatch[0];
    const cleanedTitle = rawTitle.replace(url, "").replace(/[|()\[\]]/g, "").trim();
    return {
      displayTitle: cleanedTitle || rawTitle,
      linkUrl: url,
      contentSnippet: null,
    };
  }

  return { displayTitle: rawTitle, linkUrl: null, contentSnippet: null };
}

/**
 * Generates an official branded PDF document from text content and video link
 */
async function generateSopPdfBlob(title: string, content: string, linkUrl?: string | null): Promise<File> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // FinSoCap Header Banner
  doc.setFillColor(27, 43, 90); // #1b2b5a
  doc.rect(0, 0, 210, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("FINSOCAP FINANCIAL SERVICES", 20, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.text("Official Partner Learning Centre • Standard Operating Procedure (SOP)", 20, 24);

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 30, 60);
  const titleLines = doc.splitTextToSize(title, 170);
  doc.text(titleLines, 20, 48);

  let currentY = 48 + titleLines.length * 8;

  // Video / External Resource Link Section
  if (linkUrl) {
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(20, currentY, 170, 16, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text("Official Video / Training Link:", 25, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(29, 78, 216);
    doc.textWithLink(linkUrl, 25, currentY + 12, { url: linkUrl });

    currentY += 24;
  }

  // Content / Key Learning Points Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 30, 60);
  doc.text("SOP Training Content & Instructions:", 20, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  const cleanContent = content || "Official standard operating procedure document for partner franchises.";
  const contentLines = doc.splitTextToSize(cleanContent, 170);

  // Page split if needed
  for (const line of contentLines) {
    if (currentY > 275) {
      doc.addPage();
      currentY = 25;
    }
    doc.text(line, 20, currentY);
    currentY += 6;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-US")} • Confidential for authorized partners only`, 20, 287);

  const pdfArray = doc.output("arraybuffer");
  const blob = new Blob([pdfArray], { type: "application/pdf" });
  const sanitizedName = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}-sop.pdf`;
  return new File([blob], sanitizedName, { type: "application/pdf" });
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function PartnerLearningCentrePage() {
  const toast = useToast();
  const router = useRouter();
  const [userRole, setUserRole] = useState("ADMIN");

  useEffect(() => {
    try {
      const sess = localStorage.getItem("finsocap_user_session");
      if (sess) {
        const p = JSON.parse(sess);
        const r = (p?.user?.role || p?.role || "ADMIN").toUpperCase();
        setUserRole(r);
        if (["STAFF", "SPECIALIST", "EXECUTIVE"].includes(r)) {
          toast.warning("Access Restricted", "Partner Learning Centre is only accessible to Franchise Partners and Admins.");
          router.replace("/dashboard");
        }
      }
    } catch (e) {}
  }, [router, toast]);

  const isRestrictedRole = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole);

  // Tutorials State
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Action States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialItem | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  // Fetch Tutorials from Backend API
  const fetchTutorials = useCallback(async (targetPage: number = 1) => {
    setIsLoading(true);
    try {
      // Backend API is 0-indexed for page parameter
      const res = await tutorialService.getTutorials(targetPage - 1, pageSize);
      if (res?.success && res.data) {
        const items = res.data.items || [];
        setTutorials(items);
        setTotalElements(res.data.totalElements || items.length);
        setTotalPages(Math.max(1, res.data.totalPages || Math.ceil(items.length / pageSize)));
      } else {
        setTutorials([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("[Learning Centre] Fetch error:", err);
      toast.error(err?.message || "Failed to load tutorials from server", "Error");
      setTutorials([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, toast]);

  useEffect(() => {
    fetchTutorials(page);
  }, [page, fetchTutorials]);

  // Derived Overview Stats (Strictly calculated from real API response)
  const overviewStats = useMemo(() => {
    const totalCount = totalElements;
    const latestCreated = [...tutorials].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    })[0];

    const latestUpdated = [...tutorials].sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt;
      const dateB = b.updatedAt || b.createdAt;
      const timeA = dateA ? new Date(dateA).getTime() : 0;
      const timeB = dateB ? new Date(dateB).getTime() : 0;
      return timeB - timeA;
    })[0];

    return {
      total: totalCount,
      recentlyAdded: latestCreated ? latestCreated.title : "None yet",
      recentlyAddedDate: latestCreated?.createdAt ? formatDate(latestCreated.createdAt) : null,
      lastUpdated: latestUpdated ? formatDate(latestUpdated.updatedAt || latestUpdated.createdAt) : "No updates",
    };
  }, [tutorials, totalElements]);

  // Filtered by Search Term (Client-side view filter on loaded page)
  const filteredTutorials = useMemo(() => {
    if (!searchTerm.trim()) return tutorials;
    const q = searchTerm.toLowerCase();
    return tutorials.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.fileName && t.fileName.toLowerCase().includes(q))
    );
  }, [tutorials, searchTerm]);

  // Handle Create Tutorial Submission
  const handleCreateTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const baseTitle = formTitle.trim();
    if (!baseTitle) {
      setFormError("Tutorial title is required.");
      return;
    }

    const cleanLink = formLink.trim();
    if (cleanLink && !/^https?:\/\//i.test(cleanLink)) {
      setFormError("Link must start with http:// or https://");
      return;
    }

    // Build payload title with linebreak and space separating title, link, and content
    // Format: Title \n Link \n Content
    let payloadTitle = baseTitle;
    if (cleanLink && formContent.trim()) {
      payloadTitle = `${baseTitle}\n${cleanLink}\n${formContent.trim()}`;
    } else if (cleanLink) {
      payloadTitle = `${baseTitle}\n${cleanLink}`;
    } else if (formContent.trim()) {
      payloadTitle = `${baseTitle}\n${formContent.trim()}`;
    }

    if (payloadTitle.length > 200) {
      setFormError(`Combined payload is ${payloadTitle.length} characters (API max limit is 200 characters). Please keep it within 200 chars or use PDF upload.`);
      return;
    }

    let finalFile = formFile;

    // If user provided text content / link but didn't upload a PDF, auto-generate official PDF!
    if (!finalFile) {
      if (formContent.trim() || cleanLink) {
        try {
          finalFile = await generateSopPdfBlob(baseTitle, formContent.trim(), cleanLink);
        } catch (pdfErr) {
          console.error(pdfErr);
          setFormError("Could not generate PDF from content. Please attach a PDF manually.");
          return;
        }
      } else {
        setFormError("Please either upload a PDF document or enter SOP training content / notes.");
        return;
      }
    }

    if (finalFile.type !== "application/pdf" && !finalFile.name.toLowerCase().endsWith(".pdf")) {
      setFormError("Only valid PDF files are accepted.");
      return;
    }
    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (finalFile.size > maxBytes) {
      setFormError("File size exceeds 10 MB limit.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await tutorialService.createTutorial(payloadTitle, finalFile);
      if (res?.success) {
        toast.success("Study material uploaded successfully!", "Created");
        setIsUploadModalOpen(false);
        setFormTitle("");
        setFormLink("");
        setFormContent("");
        setFormFile(null);
        // Refresh page 1
        setPage(1);
        fetchTutorials(1);
      } else {
        setFormError(res?.message || "Failed to upload tutorial.");
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || "An error occurred while uploading.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Tutorial Submission
  const handleUpdateTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorial) return;
    setFormError(null);

    const baseTitle = formTitle.trim();
    if (!baseTitle) {
      setFormError("Tutorial title cannot be empty.");
      return;
    }

    const cleanLink = formLink.trim();
    if (cleanLink && !/^https?:\/\//i.test(cleanLink)) {
      setFormError("Link must start with http:// or https://");
      return;
    }

    let payloadTitle = baseTitle;
    if (cleanLink && formContent.trim()) {
      payloadTitle = `${baseTitle}\n${cleanLink}\n${formContent.trim()}`;
    } else if (cleanLink) {
      payloadTitle = `${baseTitle}\n${cleanLink}`;
    } else if (formContent.trim()) {
      payloadTitle = `${baseTitle}\n${formContent.trim()}`;
    }

    if (payloadTitle.length > 200) {
      setFormError(`Combined payload is ${payloadTitle.length} characters (API max limit is 200 characters). Please keep it within 200 chars or use PDF upload.`);
      return;
    }

    let fileToUpload = formFile;
    if (!fileToUpload && formContent.trim()) {
      try {
        fileToUpload = await generateSopPdfBlob(baseTitle, formContent.trim(), cleanLink);
      } catch (pdfErr) {
        console.error(pdfErr);
      }
    }

    if (fileToUpload) {
      if (fileToUpload.type !== "application/pdf" && !fileToUpload.name.toLowerCase().endsWith(".pdf")) {
        setFormError("Uploaded file must be a PDF document.");
        return;
      }
      if (fileToUpload.size > 10 * 1024 * 1024) {
        setFormError("File size exceeds 10 MB limit.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await tutorialService.updateTutorial(
        selectedTutorial.id,
        payloadTitle,
        fileToUpload || undefined
      );
      if (res?.success) {
        toast.success("Tutorial updated successfully!", "Updated");
        setIsEditModalOpen(false);
        setSelectedTutorial(null);
        setFormTitle("");
        setFormLink("");
        setFormContent("");
        setFormFile(null);
        fetchTutorials(page);
      } else {
        setFormError(res?.message || "Failed to update tutorial.");
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || "An error occurred while updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteTutorial = async (id: number) => {
    setActionInProgressId(id);
    try {
      const res = await tutorialService.deleteTutorial(id);
      if (res?.success) {
        toast.success("Tutorial deleted successfully.", "Removed");
        setDeleteConfirmationId(null);
        fetchTutorials(page);
      } else {
        toast.error(res?.message || "Could not delete tutorial.", "Error");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete tutorial.", "Error");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Download Action
  const handleDownload = async (tut: TutorialItem) => {
    setActionInProgressId(tut.id);
    try {
      await tutorialService.downloadPdf(tut.id, tut.fileName || `${tut.title}.pdf`);
      toast.success("Download started successfully", "Downloading");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to download tutorial PDF", "Download Error");
    } finally {
      setActionInProgressId(null);
    }
  };

  // View Inline Preview
  const handlePreview = async (tut: TutorialItem) => {
    setActionInProgressId(tut.id);
    try {
      const url = await tutorialService.getPdfObjectUrl(tut.id);
      setPreviewPdfUrl(url);
      setPreviewTitle(tut.title);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load PDF preview", "Preview Error");
    } finally {
      setActionInProgressId(null);
    }
  };

  const closePreview = () => {
    if (previewPdfUrl) {
      window.URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setPreviewTitle("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Partner Learning Centre
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  SOP & Study Materials
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Manage training resources, study materials and official SOP documents for partners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTutorials(page)}
              disabled={isLoading}
              title="Refresh tutorials"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
            {!isRestrictedRole && (
              <button
                onClick={() => {
                  setFormTitle("");
                  setFormFile(null);
                  setFormError(null);
                  setIsUploadModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Tutorial</span>
              </button>
            )}
          </div>
        </div>

        {/* Overview KPI Cards (Dynamic counts from API response) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Tutorials
              </span>
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {overviewStats.total}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Official SOP documents online
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Last Updated
              </span>
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">
              {overviewStats.lastUpdated}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Synchronized with Partner Learning Centre
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Tutorials Management Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Search & Table Header Bar */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Study Materials & SOP Documents
            </h2>
            <p className="text-[11px] text-slate-400">
              Showing active learning modules accessible by partner franchises
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tutorials by title..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/30 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Tutorial Title</th>
                <th className="py-3 px-4">PDF File Name</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading tutorials...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTutorials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        No Tutorials Uploaded Yet
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Click &quot;Add New Tutorial&quot; to upload an official PDF SOP document for partners.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTutorials.map((tut) => {
                  const { displayTitle, linkUrl, contentSnippet } = parseTutorialTitle(tut.title);
                  return (
                    <tr
                      key={tut.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="max-w-xs sm:max-w-md">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {displayTitle}
                            </span>
                            {contentSnippet && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={contentSnippet}>
                                {contentSnippet}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-400">ID: #{tut.id}</span>
                              {linkUrl && (
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                                >
                                  <Video className="w-3 h-3 text-red-500" />
                                  <span>Watch Video / Link</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {tut.fileName || "—"}
                      </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {formatBytes(tut.sizeBytes)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {formatDate(tut.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {formatDate(tut.updatedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Preview Button */}
                        <button
                          onClick={() => handlePreview(tut)}
                          disabled={actionInProgressId === tut.id}
                          title="View PDF Document"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(tut)}
                          disabled={actionInProgressId === tut.id}
                          title="Download PDF"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Edit Button: Admin Only */}
                        {!isRestrictedRole && (
                          <button
                            onClick={() => {
                              setSelectedTutorial(tut);
                              const parsed = parseTutorialTitle(tut.title);
                              setFormTitle(parsed.displayTitle);
                              setFormLink(parsed.linkUrl || "");
                              setFormFile(null);
                              setFormError(null);
                              setIsEditModalOpen(true);
                            }}
                            disabled={actionInProgressId === tut.id}
                            title="Edit Tutorial"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button: Admin Only */}
                        {!isRestrictedRole && (
                          <button
                            onClick={() => setDeleteConfirmationId(tut.id)}
                            disabled={actionInProgressId === tut.id}
                            title="Delete Tutorial"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar (5 / 10 items) */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalElements}
              itemsPerPage={pageSize}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Upload New Tutorial Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add New Tutorial / SOP
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTutorial} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tutorial Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. FSSAI Food License Filing: Step-by-Step Guide"
                  maxLength={160}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Video / External Reference Link (Optional)
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    YouTube / Drive / Loom
                  </span>
                </div>
                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Link partners can open to watch the video explanation or online walkthrough.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Training Notes & Content (Optional if uploading PDF)
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Enter SOP steps, guidance, or key learning points. If you don't upload a PDF file, an official branded PDF will be auto-generated from this content!"
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Write the content you want to send with the link.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  PDF Document File (Optional if content entered)
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="tutorial-file-upload"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="tutorial-file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                    {formFile ? (
                      <div className="text-xs">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block">
                          {formFile.name}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {formatBytes(formFile.size)} • Click to change
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          Click to select PDF
                        </span>{" "}
                        or drag and drop
                        <span className="text-slate-400 text-[10px] block mt-0.5">
                          Maximum file size 10 MB (or leave blank to auto-create PDF from content)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload & Publish</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tutorial Modal */}
      {isEditModalOpen && selectedTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Edit Tutorial #{selectedTutorial.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedTutorial(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTutorial} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tutorial Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Tutorial Title"
                  maxLength={160}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Video / External Link (Optional)
                </label>
                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Update Training Notes & Content (Optional)
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Update SOP notes or guidance..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Replace PDF Document (Optional)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Current file: <span className="font-mono">{selectedTutorial.fileName}</span> ({formatBytes(selectedTutorial.sizeBytes)})
                </p>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="tutorial-edit-file-upload"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="tutorial-edit-file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
                    {formFile ? (
                      <div className="text-xs">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block">
                          {formFile.name}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {formatBytes(formFile.size)} • Click to change
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          Choose new PDF
                        </span>{" "}
                        to replace existing file
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedTutorial(null);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Confirm Tutorial Deletion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to permanently delete this tutorial? Partners will no longer be able to view or download this SOP document.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTutorial(deleteConfirmationId)}
                disabled={actionInProgressId === deleteConfirmationId}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-2"
              >
                {actionInProgressId === deleteConfirmationId ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Tutorial</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Inline Viewer Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-xs p-4 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xl">
                  {previewTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </a>
                <button
                  onClick={closePreview}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2">
              <iframe
                src={previewPdfUrl}
                className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
