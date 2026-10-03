"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit3, Trash2, ExternalLink, BookOpen, 
  Sparkles, Calendar, User, Eye, ArrowUpRight, CheckCircle2, 
  Layers, Filter, AlertTriangle, FileText, Share2, Copy, Check, ChevronDown, Save,
  Clock, CalendarDays, Send, Archive
} from "lucide-react";
import Link from "next/link";
import { fetchWithCache, getCachedData, clearCachedData } from "@/lib/clientCache";

type Blog = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  category?: any;
  categoryId?: string;
  seoTitle?: string;
  seoDesc?: string;
  tags?: string;
  status?: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  scheduledPublishAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  views?: number;
  author?: {
    name: string;
  };
};

// Formats a date to YYYY-MM-DDTHH:mm using local timezone (IST) for datetime-local input
function toLocalDateTimeInput(dateInput?: Date | string | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>(() => getCachedData<Blog[]>("/api/blogs?admin=true") || []);
  const [loading, setLoading] = useState(() => !getCachedData("/api/blogs?admin=true"));
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [categories, setCategories] = useState<string[]>([]);

  // Delete confirmation popup state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    blogId: string;
    blogTitle: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Social Share popup modal state
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    blog: Blog;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const getCategoryName = (category: any) => {
    if (!category) return "Uncategorized";
    if (typeof category === "object") return category.name || "Uncategorized";
    return String(category);
  };

  const fetchBlogs = async () => {
    try {
      await fetchWithCache<Blog[]>("/api/blogs?admin=true", (data) => {
        const list: Blog[] = Array.isArray(data) ? data : [];
        setBlogs(list);

        // Extract unique categories
        const catSet = new Set<string>();
        list.forEach(b => {
          const name = getCategoryName(b.category);
          if (name) catSet.add(name);
        });
        setCategories(Array.from(catSet));
      });
    } catch (err) {
      console.error("Error fetching blogs", err);
    } finally {
      setLoading(false);
    }
  };

  // Active 24h Draft detection
  const [activeDraft, setActiveDraft] = useState<{ title?: string; savedAt?: number } | null>(null);

  // Social Auto-Publishing Integrations (LinkedIn & Meta)
  const [socialIntegrations, setSocialIntegrations] = useState<{
    linkedin?: {
      connected: boolean;
      userName?: string;
      organizationId?: string;
      organizationName?: string;
      postTarget?: "organization" | "person";
    };
    meta?: { connected: boolean; pageName?: string; pageId?: string };
  } | null>(null);
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [metaPageIdInput, setMetaPageIdInput] = useState("");
  const [metaPageTokenInput, setMetaPageTokenInput] = useState("");
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // LinkedIn Company Page Modal state
  const [linkedinModalOpen, setLinkedinModalOpen] = useState(false);
  const [linkedinOrgIdInput, setLinkedinOrgIdInput] = useState("");
  const [linkedinPostTarget, setLinkedinPostTarget] = useState<"organization" | "person">("organization");
  const [isSavingLinkedin, setIsSavingLinkedin] = useState(false);

  const [socialBannerMsg, setSocialBannerMsg] = useState<string | null>(null);

  // Reschedule Modal state
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    blog: Blog;
    newDate: string;
  } | null>(null);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [broadcastingBlogId, setBroadcastingBlogId] = useState<string | null>(null);

  const handleSaveReschedule = async (publishImmediately: boolean = false) => {
    if (!rescheduleModal?.blog) return;
    setIsSavingSchedule(true);
    try {
      const b = rescheduleModal.blog;
      const res = await fetch(`/api/blogs/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: b.title,
          content: b.content || "<p>Updated blog</p>",
          slug: b.slug,
          categoryId: (b.category as any)?.id || b.categoryId,
          thumbnail: b.thumbnail,
          seoTitle: b.seoTitle,
          seoDesc: b.seoDesc,
          tags: b.tags,
          status: publishImmediately ? "PUBLISHED" : "SCHEDULED",
          scheduledAt: publishImmediately
            ? null
            : rescheduleModal.newDate
            ? new Date(rescheduleModal.newDate).toISOString()
            : null,
        }),
      });

      if (res.ok) {
        clearCachedData("/api/blogs");
        await fetchBlogs();
        setRescheduleModal(null);
        alert(publishImmediately ? "✅ Blog published immediately!" : "✅ Blog schedule updated successfully!");
      } else {
        const err = await res.json();
        alert(`⚠️ Failed: ${err.error || "Could not update schedule"}`);
      }
    } catch (e: any) {
      alert(`⚠️ Error: ${e.message}`);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handle1ClickBroadcast = async (blog: Blog) => {
    setBroadcastingBlogId(blog.id);
    try {
      const res = await fetch("/api/social/auto-publish-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.seoDesc || blog.title,
          thumbnail: blog.thumbnail || "",
          publishLinkedIn: true,
          publishMeta: true,
        }),
      });
      const data = await res.json();
      if (data.anySuccess) {
        alert("🎉 Successfully broadcasted to LinkedIn & Meta (Facebook Page)!");
      } else {
        alert(`⚠️ Broadcast status: ${data.message || "Please verify LinkedIn/Meta connection in settings."}`);
      }
    } catch (e: any) {
      alert(`⚠️ Failed to broadcast: ${e.message}`);
    } finally {
      setBroadcastingBlogId(null);
    }
  };

  const handleSaveLinkedin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLinkedin(true);
    try {
      const res = await fetch("/api/social/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "configure_linkedin",
          organizationId: linkedinOrgIdInput.trim(),
          postTarget: linkedinPostTarget,
        }),
      });
      if (res.ok) {
        setSocialIntegrations(prev => prev ? {
          ...prev,
          linkedin: {
            ...prev.linkedin,
            connected: true,
            organizationId: linkedinOrgIdInput.trim(),
            postTarget: linkedinPostTarget,
          }
        } : null);
        setLinkedinModalOpen(false);
        alert("✅ LinkedIn broadcast settings saved!");
      }
    } catch (e: any) {
      alert(`⚠️ Failed: ${e.message}`);
    } finally {
      setIsSavingLinkedin(false);
    }
  };

  useEffect(() => {
    fetchBlogs();

    // Fetch social integrations status
    fetch("/api/social/integrations")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSocialIntegrations({
            linkedin: data.linkedin,
            meta: data.meta
          });
          if (data.linkedin?.organizationId) {
            setLinkedinOrgIdInput(data.linkedin.organizationId);
          }
          if (data.linkedin?.postTarget) {
            setLinkedinPostTarget(data.linkedin.postTarget);
          }
          if (data.meta?.pageId) {
            setMetaPageIdInput(data.meta.pageId);
          }
        }
      })
      .catch(() => {});

    // Check query params for LinkedIn connect response
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("connected") === "linkedin") {
        setSocialBannerMsg("🎉 LinkedIn connected successfully! New blogs will automatically publish to your LinkedIn profile.");
        window.history.replaceState({}, "", "/dashboard/blogs");
      } else if (params.get("error")) {
        setSocialBannerMsg("⚠️ " + params.get("error"));
        window.history.replaceState({}, "", "/dashboard/blogs");
      }
    }

    try {
      const raw = localStorage.getItem("finsocap_blog_draft_v1");
      if (raw) {
        const draft = JSON.parse(raw);
        const age = Date.now() - (draft.savedAt || 0);
        if (age <= 24 * 60 * 60 * 1000) {
          setActiveDraft(draft);
        } else {
          localStorage.removeItem("finsocap_blog_draft_v1");
        }
      }
    } catch (e) {}
  }, []);

  const handleDisconnectLinkedIn = async () => {
    if (confirm("Disconnect LinkedIn account? Future blogs will not auto-post to LinkedIn until reconnected.")) {
      try {
        await fetch("/api/social/integrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "disconnect_linkedin" })
        });
        setSocialIntegrations(prev => prev ? { ...prev, linkedin: { connected: false } } : null);
        setSocialBannerMsg("LinkedIn account disconnected.");
      } catch (e) {}
    }
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);
    try {
      const res = await fetch("/api/social/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_meta",
          pageId: metaPageIdInput,
          pageAccessToken: metaPageTokenInput
        })
      });
      if (res.ok) {
        setSocialIntegrations(prev => prev ? {
          ...prev,
          meta: { connected: Boolean(metaPageIdInput && metaPageTokenInput), pageId: metaPageIdInput, pageName: "Finsocap Facebook Page" }
        } : null);
        setMetaModalOpen(false);
        setSocialBannerMsg("✅ Meta (Facebook Page) settings updated!");
      }
    } catch (e) {
      alert("Failed to save Meta settings");
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleDiscardDraft = () => {
    if (confirm("Are you sure you want to discard this saved draft?")) {
      try {
        localStorage.removeItem("finsocap_blog_draft_v1");
      } catch (e) {}
      setActiveDraft(null);
    }
  };

  const handleArchiveBlog = async (blog: Blog) => {
    if (!confirm(`Are you sure you want to unpublish "${blog.title}"? It will be moved to Drafts and removed from the live website.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blog.title,
          content: blog.content || "<p></p>",
          slug: blog.slug,
          categoryId: blog.categoryId || (blog.category as any)?.id,
          status: "DRAFT",
          scheduledAt: null,
          thumbnail: blog.thumbnail,
          seoTitle: blog.seoTitle,
          seoDesc: blog.seoDesc,
          tags: blog.tags
        })
      });
      if (res.ok) {
        clearCachedData("/api/blogs?admin=true");
        setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, status: "DRAFT", scheduledAt: null } : b));
      } else {
        alert("Failed to unpublish post.");
      }
    } catch {
      alert("Network error occurred.");
    }
  };

  const confirmDelete = (blog: Blog) => {
    setDeleteModal({
      isOpen: true,
      blogId: blog.id,
      blogTitle: blog.title
    });
  };

  const executeDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/blogs/${deleteModal.blogId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBlogs(prev => prev.filter(b => b.id !== deleteModal.blogId));
        setDeleteModal(null);
      } else {
        alert("Failed to delete blog post.");
      }
    } catch (err) {
      alert("Unexpected network error.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const titleMatch = (b.title || "").toLowerCase().includes(search.toLowerCase());
    const catName = getCategoryName(b.category).toLowerCase();
    const catMatch = catName.includes(search.toLowerCase());
    const matchesSearch = titleMatch || catMatch;

    const matchesCategory = selectedCategory === "ALL" || getCategoryName(b.category) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-32">
      
      {/* 1. HERO HEADER WITH GRADIENT ACCENT */}
      {/* 1. HERO HEADER WITH GRADIENT ACCENT (Matching Screenshot 2 - Official Finsocap Theme) */}
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
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0b1226] rounded-full ring-2 ring-emerald-500/20 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                  <span>FINSOCAP EDITORIAL & CONTENT CMS</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • Knowledge Hub Telemetry
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Blog Articles & Knowledge Hub
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                Create, edit, and optimize articles for SEO, consumer insights, and tax/insurance guides.
              </p>
            </div>
          </div>

          <div className="relative z-30 flex items-center gap-3">
            <Link
              href="/dashboard/blogs/new"
              className="btn-primary-vibrant text-xs py-2.5 px-5 shadow-md shadow-blue-500/25 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Post</span>
            </Link>
          </div>
        </div>

        {/* Quick KPI Stats & Telemetry */}
        <div className="relative z-10 mt-5 pt-4 border-t border-blue-100/80 dark:border-blue-900/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{blogs.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Published Articles</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{categories.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Active Categories</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Live 24/7</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Direct URL Indexing</p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 font-bold text-[10px] border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
              Finsocap v2.4 Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* SOCIAL NOTIFICATION TOAST/ALERT */}
      {socialBannerMsg && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <span>{socialBannerMsg}</span>
          <button
            type="button"
            onClick={() => setSocialBannerMsg(null)}
            className="text-indigo-400 hover:text-indigo-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. AUTOMATED BLOG BROADCAST STATUS BAR (LINKEDIN & META) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              Automated Blog Broadcast (LinkedIn & Meta)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Zero Manual Effort
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Publish blogs on Finsocap and automatically broadcast them to your LinkedIn profile and Meta Page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* LinkedIn Badge / Button */}
          {socialIntegrations?.linkedin?.connected ? (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0077b5]">
                  {socialIntegrations.linkedin.postTarget === "organization" && socialIntegrations.linkedin.organizationId
                    ? `LinkedIn: Finsocap Page`
                    : `LinkedIn: ${socialIntegrations.linkedin.userName || "Connected"}`}
                </span>
                <button
                  type="button"
                  onClick={() => setLinkedinModalOpen(true)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer ml-1"
                >
                  Configure
                </button>
              </div>
              <button
                type="button"
                onClick={handleDisconnectLinkedIn}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 ml-1 underline cursor-pointer"
                title="Disconnect LinkedIn"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <a
              href="/api/social/connect/linkedin"
              className="flex items-center gap-1.5 bg-[#0077b5] hover:bg-[#005f93] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-sm leading-none">in</span>
              <span>Connect LinkedIn</span>
            </a>
          )}

          {/* Meta / Facebook Badge / Button */}
          {socialIntegrations?.meta?.connected ? (
            <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-200 px-3.5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-[#1877f2]">
                Meta: {socialIntegrations.meta.pageName || "Active"}
              </span>
              <button
                type="button"
                onClick={() => setMetaModalOpen(true)}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 ml-1 underline cursor-pointer"
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMetaModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-slate-200 cursor-pointer"
            >
              <span>📘 Configure Meta</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE 24H UNSAVED DRAFT ALERT BANNER */}
      {activeDraft && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  Unsaved Draft Saved
                </span>
                <span className="text-[11px] text-amber-800/80 font-medium">
                  Auto-saved {activeDraft.savedAt ? new Date(activeDraft.savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "recently"} • Valid for 24h
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 mt-1 line-clamp-1">
                {activeDraft.title || "Untitled Draft Article"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
            {/* 1. Edit Action */}
            <Link
              href="/dashboard/blogs/new"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-[#1b2b5a] border border-slate-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Draft</span>
            </Link>

            {/* 2. Publish Action */}
            <Link
              href="/dashboard/blogs/new"
              className="px-4 py-2 rounded-xl bg-[#1b2b5a] hover:bg-[#243b78] active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Publish Post →</span>
            </Link>

            {/* 3. Delete Action */}
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 active:scale-95 text-red-600 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Delete this draft permanently"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Delete Draft</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input with Dynamic Icon */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search blogs by title, tags, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown Selector */}
        <div className="relative sm:w-72">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Categories ({blogs.length})</option>
            {categories.map((cat) => {
              const count = blogs.filter(b => getCategoryName(b.category) === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* 3. BLOGS TABLE / CARD VIEW */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-extrabold text-[10px]">
              <tr>
                <th className="px-6 py-4">Article Title & Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Published Date</th>
                <th className="px-6 py-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-semibold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading published blog posts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">No blog posts found</p>
                      <p className="text-[11px]">Try adjusting your search query or create a fresh article.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Title & Preview Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5 max-w-md">
                        {blog.thumbnail ? (
                          <img
                            src={blog.thumbnail}
                            alt={blog.title}
                            className="w-14 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-14 h-11 rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-100 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                            <BookOpen className="w-5 h-5 opacity-70" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link 
                            href={`/dashboard/blogs/${blog.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-sm line-clamp-1 transition-colors"
                          >
                            {blog.title}
                          </Link>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            /blog/{blog.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
                        {getCategoryName(blog.category)}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {blog.author?.name ? blog.author.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <span className="font-semibold text-slate-700">
                          {blog.author?.name || "Editorial Team"}
                        </span>
                      </div>
                    </td>

                    {/* Published Date / Schedule Status */}
                    <td className="px-6 py-4">
                      {blog.status === "SCHEDULED" ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                            <Clock className="w-2.5 h-2.5" /> Scheduled
                          </span>
                          {blog.scheduledAt && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              {new Date(blog.scheduledAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", year: "numeric" })}
                              {" "}{new Date(blog.scheduledAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true })}{" "}
                              <span className="text-[9px] font-bold text-violet-600">IST</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Published
                          </span>
                          <div className="flex items-center gap-1 text-slate-500 font-medium text-xs">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(blog.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Action Buttons: Edit, View Live, Delete */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        
                        {/* RESCHEDULE BUTTON (ONLY FOR SCHEDULED POSTS) */}
                        {blog.status === "SCHEDULED" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleModal({
                                isOpen: true,
                                blog,
                                newDate: blog.scheduledAt
                                  ? toLocalDateTimeInput(blog.scheduledAt)
                                  : toLocalDateTimeInput(new Date(Date.now() + 86400000)),
                              });
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-100 hover:bg-violet-600 text-violet-700 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title="Reschedule this post"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Reschedule</span>
                          </button>
                        )}

                        {/* UNPUBLISH / ARCHIVE BUTTON (ONLY FOR PUBLISHED POSTS) */}
                        {blog.status === "PUBLISHED" && (
                          <button
                            type="button"
                            onClick={() => handleArchiveBlog(blog)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title="Unpublish post (Move to Drafts)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>Unpublish</span>
                          </button>
                        )}

                        {/* SCHEDULE BUTTON (FOR DRAFTS) */}
                        {blog.status === "DRAFT" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleModal({
                                isOpen: true,
                                blog,
                                newDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                              });
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title="Schedule this draft post"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Schedule</span>
                          </button>
                        )}

                        {/* SHARE ON SOCIAL MEDIA BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            setShareModal({ isOpen: true, blog });
                            setCopied(false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="Share to Social Media"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>

                        {/* EDIT BUTTON */}
                        <Link
                          href={`/dashboard/blogs/${blog.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="Edit this post"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>

                        {/* VIEW LIVE BUTTON */}
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-200"
                          title="View Live on Website"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => confirmDelete(blog)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* 4. MANDATORY CONFIRMATION DELETE MODAL */}
      {deleteModal?.isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
          onClick={() => setDeleteModal(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Delete this blog post?
            </h3>
            
            <p className="text-xs text-slate-500 mb-2 leading-relaxed px-1">
              Are you sure you want to permanently delete:
            </p>
            
            <p className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-5 w-full line-clamp-2">
              "{deleteModal.blogTitle}"
            </p>

            <div className="w-full flex flex-col gap-2">
              <button 
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting Post..." : "Yes, Confirm Delete"}</span>
              </button>

              <button 
                type="button"
                onClick={() => setDeleteModal(null)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel / Keep Blog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SOCIAL MEDIA SHARE MODAL */}
      {shareModal?.isOpen && shareModal.blog && (() => {
        const blogUrl = `https://finsocap.com/blog/${shareModal.blog.slug}`;
        const encodedUrl = encodeURIComponent(blogUrl);
        const encodedTitle = encodeURIComponent(shareModal.blog.title);
        const whatsappText = encodeURIComponent(`*${shareModal.blog.title}*\n\nRead full article on Finsocap:\n${blogUrl}`);

        const handleCopy = () => {
          navigator.clipboard.writeText(blogUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        };

        return (
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
            onClick={() => setShareModal(null)}
          >
            <div 
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Share to Social Media</h3>
                    <p className="text-[11px] text-slate-400">Directly post and amplify your reach</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShareModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Blog Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
                {shareModal.blog.thumbnail ? (
                  <img
                    src={shareModal.blog.thumbnail}
                    alt={shareModal.blog.title}
                    className="w-16 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{shareModal.blog.title}</p>
                  <p className="text-[10px] text-blue-600 font-mono truncate mt-0.5">{blogUrl}</p>
                </div>
              </div>

              {/* Share Channels Grid */}
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Choose Platform:</p>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all active:scale-98 shadow-xs"
                >
                  <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    💬
                  </span>
                  <div>
                    <p className="leading-none">WhatsApp</p>
                    <span className="text-[10px] font-medium text-emerald-600">Chat & Status</span>
                  </div>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#0077b5] text-xs font-bold transition-all active:scale-98 shadow-xs"
                >
                  <span className="w-8 h-8 rounded-xl bg-[#0077b5] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    in
                  </span>
                  <div>
                    <p className="leading-none">LinkedIn</p>
                    <span className="text-[10px] font-medium text-blue-600">Professional Feed</span>
                  </div>
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all active:scale-98 shadow-xs"
                >
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    𝕏
                  </span>
                  <div>
                    <p className="leading-none">Twitter / X</p>
                    <span className="text-[10px] font-medium text-slate-500">Tweet Post</span>
                  </div>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-100 text-[#1877f2] text-xs font-bold transition-all active:scale-98 shadow-xs"
                >
                  <span className="w-8 h-8 rounded-xl bg-[#1877f2] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    f
                  </span>
                  <div>
                    <p className="leading-none">Facebook</p>
                    <span className="text-[10px] font-medium text-blue-600">Page & Timeline</span>
                  </div>
                </a>
              </div>

              {/* Copy URL Box */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={blogUrl}
                  className="w-full bg-transparent text-xs text-slate-600 font-mono outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                  }`}
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                  )}
                </button>
              </div>

              {/* Quick Share via Finsocap Social Engine */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">1-Click Auto Post via Finsocap</p>
                <button
                  type="button"
                  onClick={async () => {
                    const caption = `📢 Read our latest article!\n\n✨ ${shareModal.blog.title}\n\n${blogUrl}\n\n#finsocap #finance #insurance #investment`;
                    try {
                      await fetch("/api/social/publish", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          message: caption,
                          mediaUrl: shareModal.blog.thumbnail || "",
                          platforms: ["facebook", "linkedin", "twitter"],
                          scheduledAt: null,
                        }),
                      });
                      alert("✅ Successfully posted to Facebook, LinkedIn & Twitter/X!");
                    } catch {
                      alert("⚠️ Failed to post. Please try again.");
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#1877F2] via-[#0A66C2] to-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Post Now to Facebook · LinkedIn · Twitter (X)
                </button>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Need scheduled campaigns?</span>
                  <Link
                    href="/dashboard/social"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Social Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* META (FACEBOOK PAGE) CONFIGURATION MODAL */}
      {metaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                  f
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Meta / Facebook Page Auto-Post</h3>
                  <p className="text-[11px] text-slate-500">Configure Facebook Page for automated blog sharing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMetaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facebook Page ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 109283746582910"
                  value={metaPageIdInput}
                  onChange={(e) => setMetaPageIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Page Access Token (Permanent / Long-lived)
                </label>
                <textarea
                  rows={3}
                  placeholder="EAABw..."
                  value={metaPageTokenInput}
                  onChange={(e) => setMetaPageTokenInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-slate-600 mt-2 space-y-1">
                  <p className="font-bold text-blue-900 flex items-center gap-1">
                    <span>💡 How to get Permanent Page Access Token:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-500">
                    <li>Open <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">Meta Graph API Explorer</a>.</li>
                    <li>Select your App &amp; grant: <code>pages_show_list</code>, <code>pages_manage_posts</code>, <code>pages_read_engagement</code>.</li>
                    <li>In the <strong>User or Page</strong> dropdown, choose your <strong>Finsocap Page</strong> (not User Token).</li>
                    <li>Copy the generated <strong>Page Access Token</strong> &amp; <strong>Page ID</strong> here.</li>
                  </ol>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                {socialIntegrations?.meta?.connected ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Disconnect Meta Facebook Page?")) {
                        await fetch("/api/social/integrations", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "disconnect_meta" }),
                        });
                        setSocialIntegrations(prev => prev ? { ...prev, meta: { connected: false } } : null);
                        setMetaModalOpen(false);
                      }
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMetaModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMeta}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingMeta ? "Saving..." : "Save Meta Config"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE & PUBLISH MODAL */}
      {rescheduleModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Manage Post Schedule</h3>
                  <p className="text-[11px] text-slate-500">Pick a new publish time or release immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{rescheduleModal.blog.title}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">/blog/{rescheduleModal.blog.slug}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    rescheduleModal.blog.status === "SCHEDULED" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {rescheduleModal.blog.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Set New Date &amp; Time (Indian Standard Time - IST, GMT+5:30)
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleModal.newDate}
                  onChange={(e) =>
                    setRescheduleModal(prev => prev ? { ...prev, newDate: e.target.value } : null)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-slate-50"
                />
                {rescheduleModal.newDate && (
                  <p className="text-[11px] text-violet-700 font-semibold mt-1.5">
                    📅 Post will go live on: {new Date(rescheduleModal.newDate).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}{" "}
                    (IST - Indian Time)
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isSavingSchedule}
                  onClick={() => handleSaveReschedule(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200 cursor-pointer disabled:opacity-50"
                  title="Make this blog live right now on the website"
                >
                  ⚡ Publish Now
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleModal(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingSchedule || !rescheduleModal.newDate}
                    onClick={() => handleSaveReschedule(false)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingSchedule ? "Saving..." : "Save Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LINKEDIN BROADCAST DESTINATION MODAL */}
      {linkedinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#0077b5] text-white flex items-center justify-center font-bold text-base">
                  in
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">LinkedIn Broadcast Settings</h3>
                  <p className="text-[11px] text-slate-500">Choose where new blogs should be published</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkedinModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLinkedin} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0077b5] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {socialIntegrations?.linkedin?.userName?.slice(0, 2).toUpperCase() || "IN"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {socialIntegrations?.linkedin?.userName || "Connected Account"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Authenticated Admin Profile
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Publish Articles To:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkedinPostTarget("organization")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      linkedinPostTarget === "organization"
                        ? "border-[#0077b5] bg-blue-50/50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      🏢 Company Page
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Finsocap Official Page</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkedinPostTarget("person")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      linkedinPostTarget === "person"
                        ? "border-[#0077b5] bg-blue-50/50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      👤 Personal Profile
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {socialIntegrations?.linkedin?.userName || "Personal Account"}
                    </p>
                  </button>
                </div>
              </div>

              {linkedinPostTarget === "organization" && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-700">
                    Finsocap LinkedIn Page ID or Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. finsocap or 10543210 or linkedin.com/company/finsocap"
                    value={linkedinOrgIdInput}
                    onChange={(e) => setLinkedinOrgIdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <p className="text-[10px] text-slate-400">
                    Paste your page's numeric ID or handle from your LinkedIn URL (e.g. <code>https://linkedin.com/company/finsocap</code>).
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLinkedinModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLinkedin}
                  className="px-5 py-2 rounded-xl bg-[#0077b5] hover:bg-[#005f93] active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingLinkedin ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
