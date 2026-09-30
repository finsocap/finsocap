"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Image as ImageIcon,
  Settings2,
  Hash,
  Tag,
  Globe,
  Search,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Bot,
  Wand2,
  Lightbulb,
  Check,
  AlertCircle,
  Share2,
  Copy,
  Clock,
  CalendarDays,
  Send,
  Eye,
  EyeOff,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Smartphone,
  Monitor,
  CheckSquare,
  HelpCircle,
  FileText,
  Lock,
  Unlock,
  ArrowRight
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorStudioProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    categoryId?: string;
    thumbnail?: string | null;
    seoTitle?: string | null;
    seoDesc?: string | null;
    tags?: string | null;
    status?: string;
    scheduledAt?: string | null;
  };
  isEditMode?: boolean;
}

// ⚡ ULTRA-FAST CLIENT-SIDE IMAGE COMPRESSION (Reduces 5MB images to ~50KB WebP)
async function compressImageFile(file: File, maxWidth = 1200, quality = 0.82): Promise<File> {
  if (typeof window === "undefined") return file;
  if (file.type === "image/svg+xml" || file.size < 60 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) return resolve(file);
            const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: "image/webp",
            });
            resolve(compressed);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------
// STICKY TIPTAP TOOLBAR COMPONENT
// ----------------------------------------------------
const StudioToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL (e.g. https://finsocap.com):", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const uploadAndInsertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const compressedFile = await compressImageFile(file, 1200, 0.82);
      const formData = new FormData();
      formData.append("file", compressedFile);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        } else {
          alert(data.error || "Image upload failed");
        }
      } catch {
        alert("Upload error. Please try again.");
      }
    };
    input.click();
  };

  const insertTable = () => {
    const tableHtml = `
      <div class="overflow-x-auto my-6">
        <table class="w-full text-left border-collapse border border-slate-200 rounded-xl">
          <thead>
            <tr class="bg-slate-100 text-slate-800 font-bold">
              <th class="p-3 border border-slate-200">Plan / Option</th>
              <th class="p-3 border border-slate-200">Key Features</th>
              <th class="p-3 border border-slate-200">Tax Benefit</th>
              <th class="p-3 border border-slate-200">Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-3 border border-slate-200">Option A</td>
              <td class="p-3 border border-slate-200">Lowest Interest / Premium</td>
              <td class="p-3 border border-slate-200">Sec 80C</td>
              <td class="p-3 border border-slate-200">Salaried Professionals</td>
            </tr>
            <tr>
              <td class="p-3 border border-slate-200">Option B</td>
              <td class="p-3 border border-slate-200">High Coverage / Return</td>
              <td class="p-3 border border-slate-200">Sec 80D</td>
              <td class="p-3 border border-slate-200">Self-Employed &amp; Families</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `;
    editor.chain().focus().insertContent(tableHtml).run();
  };

  const insertTipCallout = () => {
    const calloutHtml = `
      <blockquote class="border-l-4 border-[#0da687] bg-emerald-50/70 p-4 rounded-r-2xl my-6 text-slate-800 font-medium">
        <strong>💡 Finsocap Expert Tip:</strong> Add your actionable recommendation or key takeaway here.
      </blockquote>
      <p></p>
    `;
    editor.chain().focus().insertContent(calloutHtml).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 w-full">
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <RotateCw className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Basic Formatting: Bold, Italic, Underline, Strikethrough */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("bold") ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("italic") ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("underline") ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("strike") ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
          editor.isActive("heading", { level: 2 }) ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Main Section (H2)"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
          editor.isActive("heading", { level: 3 }) ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Sub-section (H3)"
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          editor.isActive("paragraph") ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-100"
        }`}
        title="Normal Paragraph"
      >
        P
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("bulletList") ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("orderedList") ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("blockquote") ? "bg-[#1a2b5b] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Blockquote"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Inserts: Link, Image, Table, Tip Box */}
      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          editor.isActive("link") ? "bg-[#0da687] text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
        title="Add Link"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={uploadAndInsertImage}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        title="Upload & Insert Image"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={insertTable}
        className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
        title="Insert Financial Comparison Table"
      >
        <span>📊 Table</span>
      </button>
      <button
        type="button"
        onClick={insertTipCallout}
        className="px-2 py-1 rounded-lg text-xs font-bold text-[#0da687] hover:bg-emerald-50 flex items-center gap-1 cursor-pointer"
        title="Insert Highlight Tip Box"
      >
        <span>💡 Tip Box</span>
      </button>
    </div>
  );
};

// ----------------------------------------------------
// MAIN STUDIO COMPONENT
// ----------------------------------------------------
export default function BlogEditorStudio({ initialData, isEditMode = false }: BlogEditorStudioProps) {
  const router = useRouter();

  // Basic Details
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Featured Banner Image
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState<string>("");
  const [copiedImagePrompt, setCopiedImagePrompt] = useState(false);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(initialData?.seoDesc || "");
  const [tags, setTags] = useState(initialData?.tags || "#finsocap");
  const [serpViewMode, setSerpViewMode] = useState<"desktop" | "mobile">("desktop");

  // Local datetime input formatter to prevent UTC/IST timezone shifting
  const toLocalDateTimeInput = (dateInput?: Date | string | null): string => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Publishing & Scheduling
  const [scheduleMode, setScheduleMode] = useState<"publish" | "schedule" | "draft">(
    initialData?.status === "SCHEDULED" ? "schedule" : initialData?.status === "DRAFT" ? "draft" : "publish"
  );
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialData?.scheduledAt ? toLocalDateTimeInput(initialData.scheduledAt) : ""
  );

  // Social Auto-Broadcast
  const [autoSocialPost, setAutoSocialPost] = useState(true);
  const [socialIntegrations, setSocialIntegrations] = useState<{
    linkedin?: { connected: boolean; userName?: string };
    meta?: { connected: boolean; pageName?: string };
  } | null>(null);

  // UI Tabs & States
  const [activeInspectorTab, setActiveInspectorTab] = useState<"general" | "seo" | "schedule" | "social">("general");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [draftSavedTime, setDraftSavedTime] = useState("");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // AI Co-Pilot Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional & Comprehensive");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // Post-Publish Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState("");
  const [showImageRequiredAlert, setShowImageRequiredAlert] = useState(false);
  const [promptCopiedOrSavedNotice, setPromptCopiedOrSavedNotice] = useState(false);

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
    ],
    content: initialData?.content || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[550px] p-6 sm:p-8 text-slate-800 leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-2xl prose-h3:text-xl prose-p:text-base",
      },
    },
    onUpdate: () => {
      triggerAutoSave();
    },
  });

  // Calculate metrics
  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [editor]);

  const readingTime = useMemo(() => {
    return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  }, [wordCount]);

  // Real-Time Live SEO Health Score (0 to 100%)
  const seoAudit = useMemo(() => {
    let score = 0;
    const checks = [
      {
        id: "title_length",
        label: "Title is 40–70 characters",
        passed: title.length >= 40 && title.length <= 70,
        points: 20,
      },
      {
        id: "seo_desc",
        label: "Meta description is 120–160 characters",
        passed: seoDesc.length >= 120 && seoDesc.length <= 160,
        points: 20,
      },
      {
        id: "word_count",
        label: "Article is comprehensive (800+ words)",
        passed: wordCount >= 800,
        points: 25,
      },
      {
        id: "tags_finsocap",
        label: "First tag is strictly '#finsocap'",
        passed: tags.toLowerCase().startsWith("#finsocap"),
        points: 15,
      },
      {
        id: "featured_image",
        label: "Featured landscape image added",
        passed: Boolean(thumbnail),
        points: 10,
      },
      {
        id: "category_set",
        label: "Primary financial category selected",
        passed: Boolean(categoryId),
        points: 10,
      },
    ];

    checks.forEach((c) => {
      if (c.passed) score += c.points;
    });

    return { score, checks };
  }, [title, seoDesc, wordCount, tags, thumbnail, categoryId]);

  // Load Categories & Social Integrations on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (!categoryId && data.length > 0) {
            setCategoryId(data[0].id);
          }
        }
      })
      .catch(() => {});

    fetch("/api/social/integrations")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSocialIntegrations({
            linkedin: data.linkedin,
            meta: data.meta,
          });
        }
      })
      .catch(() => {});

    // Check Local Draft for New Blog
    if (!isEditMode && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("finsocap_blog_draft_v1");
        if (raw) {
          const draft = JSON.parse(raw);
          const age = Date.now() - (draft.savedAt || 0);
          if (age <= 24 * 60 * 60 * 1000 && !initialData?.title) {
            setTitle(draft.title || "");
            setSlug(draft.slug || "");
            setCategoryId(draft.categoryId || "");
            setThumbnail(draft.thumbnail || "");
            if (draft.aiImagePrompt) setAiImagePrompt(draft.aiImagePrompt);
            setSeoTitle(draft.seoTitle || "");
            setSeoDesc(draft.seoDesc || "");
            setTags(draft.tags || "#finsocap");
            setDraftSavedTime(new Date(draft.savedAt).toLocaleTimeString());
            setHasRestoredDraft(true);
            if (editor && draft.content) {
              editor.commands.setContent(draft.content);
            }
          }
        }
      } catch {}
    }
  }, [isEditMode, editor]);

  // Generate Tailored 1000x400 AI Image Prompt from Blog Context & Topics
  const generateOrUpdateImagePrompt = (customTitle?: string, customContent?: string) => {
    const currentTitle = (customTitle || title).trim() || "Financial Advisory & Wealth Planning";
    const cat = categories.find((c) => c.id === categoryId)?.name || "Finance";
    
    // Extract theme nuances based on title & content keywords
    const textContent = customContent || editor?.getText() || "";
    const lower = (currentTitle + " " + textContent).toLowerCase();
    
    let sceneDetails = "modern executive office desk setup with an ultra-thin laptop displaying clean financial analytics, smart scientific calculator, financial paperwork, ceramic coffee cup, and subtle green desk plant";
    
    if (lower.includes("loan") || lower.includes("emi") || lower.includes("home") || lower.includes("prepayment") || lower.includes("mortgage") || lower.includes("interest")) {
      sceneDetails = "modern corporate desk with home loan documents, smart EMI amortization graph on an ultra-thin laptop, silver house keys, scientific calculator, and warm sunlight";
    } else if (lower.includes("tax") || lower.includes("80c") || lower.includes("itr") || lower.includes("deduction") || lower.includes("income tax") || lower.includes("regime")) {
      sceneDetails = "sleek executive workspace with tax optimization planning sheets, financial balance sheets, digital tax calculator on a tablet, and organized desk accessories";
    } else if (lower.includes("health") || lower.includes("hospital") || lower.includes("mediclaim") || lower.includes("medical") || lower.includes("critical illness")) {
      sceneDetails = "tranquil modern corporate setting with family health insurance portfolio, digital wellness and medical coverage analytics on laptop, and clean minimalist desk";
    } else if (lower.includes("term") || lower.includes("life insurance") || lower.includes("family") || lower.includes("housewives")) {
      sceneDetails = "warm and reassuring financial advisory office with life coverage protection plan charts, retirement roadmap on laptop screen, and elegant ambient lighting";
    } else if (lower.includes("invest") || lower.includes("mutual fund") || lower.includes("sip") || lower.includes("wealth") || lower.includes("stock") || lower.includes("portfolio") || lower.includes("equity")) {
      sceneDetails = "high-end executive trading desk with compounding wealth growth charts, portfolio allocation metrics on sleek widescreen monitor, and financial journal";
    } else if (lower.includes("car") || lower.includes("motor") || lower.includes("vehicle") || lower.includes("bike") || lower.includes("two wheeler") || lower.includes("commercial")) {
      sceneDetails = "contemporary automotive insurance consultancy workspace with motor policy documents, vehicle safety assessment graphics on laptop, and sleek desk";
    } else if (lower.includes("child") || lower.includes("education") || lower.includes("kid") || lower.includes("savings")) {
      sceneDetails = "inspiring study desk with child education fund growth chart on tablet, graduation cap miniature, notebook, and natural warm daylight";
    } else if (lower.includes("retirement") || lower.includes("pension") || lower.includes("senior") || lower.includes("annuity")) {
      sceneDetails = "peaceful sunlit terrace desk overlooking a garden, retirement savings milestone dashboard on laptop, reading glasses, and warm tea cup";
    }

    const generatedPrompt = `Professional 1000x400 px horizontal editorial banner (2.5:1 aspect ratio) for ${cat} guide: "${currentTitle}". Setting: ${sceneDetails}. Lit with natural warm morning sunlight with soft cinematic depth of field. Finsocap brand color harmony with deep navy blue (#1a2b5b) and vibrant emerald green (#0da687) accents. Ultra-clean, realistic corporate editorial photography, 8k resolution, without logo, no text, premium aesthetic.`;

    setAiImagePrompt(generatedPrompt);
    return generatedPrompt;
  };

  // Auto-Save Handler
  const triggerAutoSave = (customPrompt?: string, customThumbnail?: string) => {
    if (isEditMode) return;
    setDraftStatus("saving");
    const promptToSave = customPrompt !== undefined ? customPrompt : aiImagePrompt;
    const thumbToSave = customThumbnail !== undefined ? customThumbnail : thumbnail;
    const payload = {
      title,
      slug: slug || generateSlug(title),
      categoryId,
      thumbnail: thumbToSave,
      aiImagePrompt: promptToSave,
      seoTitle,
      seoDesc,
      tags,
      content: editor?.getHTML() || "",
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem("finsocap_blog_draft_v1", JSON.stringify(payload));
      setDraftStatus("saved");
      setDraftSavedTime(new Date().toLocaleTimeString());
    } catch {}
  };

  // Manual Save Draft & AI Prompt Generator Handler
  const handleManualSaveDraft = () => {
    setDraftStatus("saving");
    const newPrompt = generateOrUpdateImagePrompt();
    const payload = {
      title,
      slug: slug || generateSlug(title),
      categoryId,
      thumbnail,
      aiImagePrompt: newPrompt,
      seoTitle,
      seoDesc,
      tags,
      content: editor?.getHTML() || "",
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem("finsocap_blog_draft_v1", JSON.stringify(payload));
      setDraftStatus("saved");
      setDraftSavedTime(new Date().toLocaleTimeString());
      setPromptCopiedOrSavedNotice(true);
      setTimeout(() => setPromptCopiedOrSavedNotice(false), 4000);
    } catch {}
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Thumbnail file upload handler (Compresses image to ~50KB WebP before upload)
  const handleThumbnailUpload = async (file: File) => {
    setIsUploadingThumb(true);
    try {
      const compressedFile = await compressImageFile(file, 1200, 0.82);
      const formData = new FormData();
      formData.append("file", compressedFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setThumbnail(data.url);
        setShowImageRequiredAlert(false);
        triggerAutoSave(undefined, data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Failed to upload image");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Add category inline
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setCategories((prev) => [...prev, data]);
        setCategoryId(data.id);
        setNewCategoryName("");
        setIsAddingCategory(false);
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch {
      alert("Network error adding category");
    }
  };

  // AI 1500+ Words Blog Generator
  const handleAiGenerate = async () => {
    if (!aiTopic.trim() && !title.trim()) {
      setAiError("Please provide an article topic or title.");
      return;
    }
    setIsAiGenerating(true);
    setAiError("");

    const categoryObj = categories.find((c) => c.id === categoryId);
    const categoryName = categoryObj ? categoryObj.name : "Finance & Insurance";

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "blog",
          blogTitle: aiTopic.trim() || title.trim(),
          category: categoryName,
          tone: aiTone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        const raw: string = data.text;

        // Parse delimiters
        let parsedTitle = aiTopic || title;
        let parsedSeoTitle = "";
        let parsedSeoDesc = "";
        let parsedTags = "";
        let parsedContent = raw;

        const titleMatch = raw.match(/===ARTICLE_TITLE===\s*([\s\S]*?)(?====SEO_TITLE===|===CONTENT===|$)/i);
        if (titleMatch && titleMatch[1]) {
          parsedTitle = titleMatch[1].replace(/[*#]/g, "").trim();
        }

        const seoTitleMatch = raw.match(/===SEO_TITLE===\s*([\s\S]*?)(?====SEO_DESCRIPTION===|===TAGS===|$)/i);
        if (seoTitleMatch && seoTitleMatch[1]) {
          parsedSeoTitle = seoTitleMatch[1].replace(/[*#<>\/]/g, "").trim().slice(0, 60);
        }

        const seoDescMatch = raw.match(/===SEO_DESCRIPTION===\s*([\s\S]*?)(?====TAGS===|===CONTENT===|$)/i);
        if (seoDescMatch && seoDescMatch[1]) {
          parsedSeoDesc = seoDescMatch[1].replace(/[*#<>\/]/g, "").trim().slice(0, 160);
        }

        const tagsMatch = raw.match(/===TAGS===\s*([\s\S]*?)(?====IMAGE_PROMPT===|===CONTENT===|$)/i);
        if (tagsMatch && tagsMatch[1]) {
          parsedTags = tagsMatch[1].replace(/<[^>]*>/g, "").replace(/[*]/g, "").trim();
        }

        const imagePromptMatch = raw.match(/===IMAGE_PROMPT===\s*([\s\S]*?)(?====CONTENT===|$)/i);
        let parsedImagePrompt = "";
        if (imagePromptMatch && imagePromptMatch[1]) {
          parsedImagePrompt = imagePromptMatch[1].replace(/[*#]/g, "").trim();
        } else {
          parsedImagePrompt = `Professional 1000x400 px horizontal editorial banner (2.5:1 aspect ratio) for financial guide about ${parsedTitle}. Modern corporate desk setup with an open ultra-thin laptop, smart scientific calculator, financial paperwork, ceramic coffee cup, Finsocap navy (#1a2b5b) and emerald green (#0da687) accents, warm sunlight, photorealistic photography, 8k resolution, without logo, no text.`;
        }
        setAiImagePrompt(parsedImagePrompt);

        const contentMatch = raw.match(/===CONTENT===\s*([\s\S]*)$/i);
        if (contentMatch && contentMatch[1]) {
          parsedContent = contentMatch[1].trim();
        }

        // Enforce #finsocap as first tag
        if (!parsedTags) {
          parsedTags = "#finsocap, Personal Finance, Tax Saving, Loans, Insurance";
        } else {
          const list = parsedTags
            .split(",")
            .map((t) => t.trim().replace(/^#+/, ""))
            .filter((t) => t.length > 0 && !t.toLowerCase().includes("finsocap"));
          parsedTags = ["#finsocap", ...list].join(", ");
        }

        setTitle(parsedTitle);
        setSlug(generateSlug(parsedTitle));
        setSeoTitle(parsedSeoTitle || parsedTitle.slice(0, 60));
        setSeoDesc(parsedSeoDesc || "Expert financial advisory guide by Finsocap certified advisors.");
        setTags(parsedTags);

        if (editor) {
          editor.commands.setContent(parsedContent);
        }

        setIsAiModalOpen(false);
        triggerAutoSave();
      } else {
        setAiError(data.error || "Failed to generate blog. Please try again.");
      }
    } catch {
      setAiError("Network error calling AI engine.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Submit Blog (Publish / Schedule / Draft)
  const handleSubmitPost = async () => {
    const finalTitle = title.trim();
    const finalContent = editor?.getHTML() || "";
    const finalSlug = slug.trim() || generateSlug(finalTitle);

    if (!finalTitle) {
      setError("Please enter a title for the blog post.");
      return;
    }
    if (!finalContent || finalContent === "<p></p>") {
      setError("Blog post content cannot be empty.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }
    if (scheduleMode !== "draft" && !thumbnail) {
      setError("Featured Banner Image (1000 × 400 px) is required before publishing. Please upload a banner image.");
      setShowImageRequiredAlert(true);
      setActiveInspectorTab("general");
      setTimeout(() => {
        document.getElementById("banner-upload-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    if (scheduleMode === "schedule" && !scheduledAt) {
      setError("Please pick a date & time for scheduled publishing.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const finalStatus =
      scheduleMode === "draft" ? "DRAFT" : scheduleMode === "schedule" ? "SCHEDULED" : "PUBLISHED";
    const finalScheduledAt = scheduleMode === "schedule" ? new Date(scheduledAt).toISOString() : null;

    try {
      const endpoint = isEditMode && initialData?.id ? `/api/blogs/${initialData.id}` : "/api/blogs";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          content: finalContent,
          slug: finalSlug,
          categoryId,
          thumbnail,
          seoTitle: seoTitle || finalTitle.slice(0, 60),
          seoDesc: seoDesc || finalTitle,
          tags: tags || "#finsocap",
          status: finalStatus,
          scheduledAt: finalScheduledAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save blog post.");
        return;
      }

      // If published & auto social is enabled, broadcast
      if (finalStatus === "PUBLISHED" && autoSocialPost) {
        fetch("/api/social/auto-publish-blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: finalTitle,
            slug: finalSlug,
            excerpt: seoDesc || finalTitle,
            thumbnail,
            publishLinkedIn: true,
            publishMeta: true,
          }),
        }).catch(() => {});
      }

      // Clear draft
      if (!isEditMode) {
        try {
          localStorage.removeItem("finsocap_blog_draft_v1");
        } catch {}
      }

      setPublishedSlug(finalSlug);
      setShowSuccessModal(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Interactive Publishing Workflow Steps
  const isStep1Done = Boolean(title.trim() && wordCount >= 30);
  const isStep2Done = Boolean(thumbnail && thumbnail.trim());
  const isStep3Done = Boolean(publishedSlug);
  const completedStepsCount = [isStep1Done, isStep2Done, isStep3Done].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      {/* 1. TOP STICKY ACTION HEADER BAR (Full-width edge-to-edge, zero gaps on top, left, or right) */}
      <header className="sticky top-0 z-40 h-[64px] bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between shadow-xs w-full">
        {/* Left: Back & Draft Status */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Blogs</span>
          </Link>

          <div className="w-px h-5 bg-slate-200" />

          {/* Draft Auto-Save Badge */}
          <div className="flex items-center gap-2">
            {draftStatus === "saving" && (
              <span className="text-amber-600 font-bold text-[11px] flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Saving draft...
              </span>
            )}
            {draftStatus === "saved" && (
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Saved ({draftSavedTime || "Auto"})
              </span>
            )}
            {hasRestoredDraft && (
              <span className="text-blue-700 font-bold text-[11px] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Draft Restored
              </span>
            )}
          </div>
        </div>

        {/* Center: Live Word Count, Reading Time & SEO Health Badge */}
        <div className="hidden md:flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1 text-slate-500">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{readingTime}</span>
          </div>
          <span className="text-slate-300">•</span>

          {/* SEO Score Badge */}
          <button
            type="button"
            onClick={() => setActiveInspectorTab("seo")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              seoAudit.score >= 80
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : seoAudit.score >= 50
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-rose-100 text-rose-800 border border-rose-300"
            }`}
            title="Click to view SEO recommendations"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{seoAudit.score}/100 SEO Score</span>
          </button>
        </div>

        {/* Right: Actions (AI, Preview, Publish) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write with AI</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isPreviewOpen
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isPreviewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPreviewOpen ? "Exit Preview" : "Preview"}</span>
          </button>

          {/* Save Draft Button (Saves & Generates Tailored AI Image Prompt) */}
          <button
            type="button"
            onClick={handleManualSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer border border-slate-200"
            title="Save blog draft"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Publish / Schedule Button with Banner Image Lock */}
          {(() => {
            const isPublishLocked = scheduleMode !== "draft" && !thumbnail;
            return (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    if (isPublishLocked) {
                      setShowImageRequiredAlert(true);
                      setActiveInspectorTab("general");
                      setTimeout(() => {
                        document.getElementById("banner-upload-section")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                      return;
                    }
                    handleSubmitPost();
                  }}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                    isPublishLocked
                      ? "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed hover:border-amber-400"
                      : scheduleMode === "schedule"
                      ? "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20 cursor-pointer"
                      : scheduleMode === "draft"
                      ? "bg-slate-700 hover:bg-slate-800 text-white shadow-slate-700/20 cursor-pointer"
                      : "bg-[#1a2b5b] hover:bg-[#0da687] text-white shadow-[#1a2b5b]/20 cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isPublishLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Publish Now</span>
                      <span className="hidden lg:inline text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black border border-amber-200">
                        Banner Required
                      </span>
                    </>
                  ) : scheduleMode === "schedule" ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Schedule Post</span>
                    </>
                  ) : scheduleMode === "draft" ? (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Now</span>
                    </>
                  )}
                </button>

                {/* Locked Tooltip */}
                {isPublishLocked && (
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl border border-slate-700 leading-tight">
                    <div className="flex items-start gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">Publishing Locked:</span> Upload a 1000 × 400 px banner image to enable publishing.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </header>

      {/* Toast Notice: Draft Saved & Prompt Generated */}
      {promptCopiedOrSavedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a2b5b] text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">
            Draft saved successfully!
          </span>
        </div>
      )}

      {/* Image Required Alert Banner */}
      {showImageRequiredAlert && !thumbnail && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Featured Banner Image Required:</strong> To unlock publishing, please upload a 1000 × 400 px banner image. Use the AI prompt in the sidebar to generate it.
              </span>
            </span>
            <button onClick={() => setShowImageRequiredAlert(false)} className="text-amber-600 hover:text-amber-900 font-bold ml-4">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {error}
            </span>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. DUAL-PANE WORKSPACE: CANVAS ON LEFT, STICKY INSPECTOR ON RIGHT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================= */}
          {/* LEFT COLUMN: Main Writing Canvas (8 cols)                     */}
          {/* ============================================================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Preview Mode OR Tiptap Editor Canvas */}
            {isPreviewOpen ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Live Reader Preview
                  </span>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Back to Editor
                  </button>
                </div>
                {thumbnail && (
                  <img src={thumbnail} alt={title} className="w-full h-72 object-cover rounded-2xl border border-slate-200" />
                )}
                <h1 className="text-3xl font-black text-slate-900">{title || "Untitled Article"}</h1>
                <div
                  className="prose prose-lg prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "<p>No content yet...</p>" }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs relative">
                {/* 📌 UNIFIED STICKY CANVAS HEADER: TITLE + SLUG + TOOLBAR (Never scrolls away) */}
                <div className="sticky top-[64px] z-30 bg-white rounded-t-3xl border-b border-slate-200/90 shadow-xs">
                  {/* Article Title Input & Slug */}
                  <div className="px-6 pt-5 pb-3 space-y-2 bg-white rounded-t-3xl">
                    <input
                      id="blog-title-input"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!isEditMode && !slug) {
                          setSlug(generateSlug(e.target.value));
                        }
                        triggerAutoSave();
                      }}
                      placeholder="Title: e.g. Complete Guide to Home Loans in 2026..."
                      className="w-full text-xl sm:text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none leading-snug tracking-tight bg-transparent"
                    />

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium">
                      <span className="text-slate-500 font-bold">Slug:</span>
                      <span className="font-mono text-[#0da687] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[11px] sm:text-xs font-medium">
                        /blog/{slug || generateSlug(title) || "url-slug"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const custom = window.prompt("Customize URL slug:", slug || generateSlug(title));
                          if (custom !== null) setSlug(generateSlug(custom));
                        }}
                        className="text-slate-500 hover:text-[#0da687] font-bold underline ml-1 cursor-pointer text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="border-t border-slate-100 bg-slate-50/80 px-3.5 py-2">
                    <StudioToolbar editor={editor} />
                  </div>
                </div>

                {/* Floating Bubble Menu for highlighted text */}
                {editor && (
                  <BubbleMenu
                    editor={editor}
                    className="bg-slate-900/95 text-white backdrop-blur-md px-2 py-1.5 rounded-xl shadow-2xl flex items-center gap-1 border border-slate-700/60 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("bold") ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("italic") ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("underline") ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("strike") ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-4 bg-slate-700 mx-0.5" />

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("heading", { level: 2 }) ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="H2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("heading", { level: 3 }) ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="H3"
                    >
                      H3
                    </button>

                    <div className="w-px h-4 bg-slate-700 mx-0.5" />

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("blockquote") ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="Blockquote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const previousUrl = editor.getAttributes("link").href;
                        const url = window.prompt("URL", previousUrl);
                        if (url === null) return;
                        if (url === "") {
                          editor.chain().focus().extendMarkRange("link").unsetLink().run();
                          return;
                        }
                        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                      }}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editor.isActive("link") ? "bg-[#0da687] text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                      title="Link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </BubbleMenu>
                )}

                {/* Editor Content Area */}
                <div className="min-h-[600px] cursor-text bg-white rounded-b-3xl">
                  <EditorContent editor={editor} />
                </div>
              </div>
            )}

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-2">
              <span>Finsocap CMS Editor v2.5</span>
              <span>Semantic HTML auto-optimized for Google Rich Snippets</span>
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT COLUMN: STICKY INDEPENDENT INSPECTOR (4 cols)          */}
          {/* THIS SIDEBAR NEVER SCROLLS AWAY!                             */}
          {/* ============================================================= */}
          <aside className="lg:col-span-4 sticky top-[64px] max-h-[calc(100vh-70px)] overflow-y-auto no-scrollbar pb-64 space-y-5 scroll-smooth overscroll-contain">
            
            {/* Inspector Navigation Tabs */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-4 gap-1">
              {[
                { id: "general", label: "Details", icon: Settings2 },
                { id: "seo", label: "SEO Score", icon: Search },
                { id: "schedule", label: "Schedule", icon: CalendarDays },
                { id: "social", label: "Social", icon: Share2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeInspectorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveInspectorTab(tab.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1a2b5b] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: GENERAL POST DETAILS */}
            {activeInspectorTab === "general" && (
              <div className="bg-white p-6 pb-12 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 animate-in fade-in duration-150">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-[#0da687]" /> Post Details
                </h3>

                {/* Category Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-xs text-[#0da687] font-bold hover:underline cursor-pointer"
                    >
                      {isAddingCategory ? "Cancel" : "+ New"}
                    </button>
                  </div>

                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. MSME Loans"
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:border-[#0da687]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-[#0da687] text-white text-xs font-bold rounded-xl"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        triggerAutoSave();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0da687]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 🚀 INTERACTIVE PUBLISHING WORKFLOW PIPELINE (PROCESS NODES) */}
                <div className="p-4 bg-gradient-to-br from-[#0c1631] via-[#14234b] to-[#0a1226] text-white rounded-2xl shadow-md border border-slate-700/60 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                        Publishing Pipeline
                      </span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {completedStepsCount} of 3 Ready
                    </span>
                  </div>

                  {/* Pipeline Nodes Stepper */}
                  <div className="relative pt-1 pb-1">
                    {/* Base Track */}
                    <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-slate-700/80 -z-0" />
                    {/* Active Progress Track */}
                    <div
                      className="absolute top-[18px] left-6 h-0.5 bg-gradient-to-r from-emerald-400 to-[#0da687] transition-all duration-300 -z-0"
                      style={{
                        width: `${
                          completedStepsCount === 3
                            ? "calc(100% - 48px)"
                            : completedStepsCount === 2
                            ? "calc(50% - 24px)"
                            : "0%"
                        }`,
                      }}
                    />

                    <div className="grid grid-cols-3 gap-1 relative z-10">
                      {/* Node 1: Content */}
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById("blog-title-input")?.focus();
                        }}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-md ${
                            isStep1Done
                              ? "bg-emerald-500 text-white shadow-emerald-500/30"
                              : "bg-blue-600 text-white ring-2 ring-blue-400/50"
                          }`}
                        >
                          {isStep1Done ? <Check className="w-4 h-4 stroke-[3]" /> : "1"}
                        </div>
                        <span className="text-[10px] font-bold text-slate-200 mt-1.5 group-hover:text-emerald-300 transition-colors">
                          Write
                        </span>
                        <span className={`text-[9px] font-medium ${isStep1Done ? "text-emerald-400" : "text-blue-300"}`}>
                          {isStep1Done ? "Done" : "Editing"}
                        </span>
                      </button>

                      {/* Node 2: Banner */}
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById("banner-upload-section")?.scrollIntoView({ behavior: "smooth" });
                          document.getElementById("banner-file-input")?.click();
                        }}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-md ${
                            isStep2Done
                              ? "bg-emerald-500 text-white shadow-emerald-500/30"
                              : isStep1Done
                              ? "bg-amber-500 text-white ring-2 ring-amber-400/60 animate-pulse"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {isStep2Done ? <Check className="w-4 h-4 stroke-[3]" /> : "2"}
                        </div>
                        <span className="text-[10px] font-bold text-slate-200 mt-1.5 group-hover:text-emerald-300 transition-colors">
                          Banner
                        </span>
                        <span className={`text-[9px] font-medium ${isStep2Done ? "text-emerald-400" : isStep1Done ? "text-amber-300 font-bold" : "text-slate-400"}`}>
                          {isStep2Done ? "Uploaded" : "Required"}
                        </span>
                      </button>

                      {/* Node 3: Publish */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isStep2Done) {
                            setShowImageRequiredAlert(true);
                            document.getElementById("banner-upload-section")?.scrollIntoView({ behavior: "smooth" });
                            return;
                          }
                          handleSubmitPost();
                        }}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-md ${
                            isStep3Done
                              ? "bg-emerald-500 text-white shadow-emerald-500/30"
                              : isStep2Done
                              ? "bg-[#0da687] text-white ring-2 ring-emerald-400/60 hover:scale-105"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                          }`}
                        >
                          {isStep3Done ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : isStep2Done ? (
                            <Send className="w-4 h-4 text-white" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-200 mt-1.5 group-hover:text-emerald-300 transition-colors">
                          Publish
                        </span>
                        <span className={`text-[9px] font-medium ${isStep2Done ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
                          {isStep2Done ? "Unlocked" : "Locked 🔒"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Action Helper Box */}
                  <div className="pt-2 border-t border-slate-700/50">
                    {!isStep1Done ? (
                      <div className="text-[11px] text-slate-300 leading-tight">
                        ✍️ <strong>Step 1:</strong> Write your title and blog content in the editor canvas.
                      </div>
                    ) : !isStep2Done ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-amber-200 font-medium">
                          🖼️ <strong>Step 2:</strong> Upload 1000×400 banner to unlock publishing.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            document.getElementById("banner-upload-section")?.scrollIntoView({ behavior: "smooth" });
                            document.getElementById("banner-file-input")?.click();
                          }}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg shrink-0 cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                          Upload Banner
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-emerald-300 font-medium">
                          🎉 <strong>Step 3:</strong> Banner attached! Ready to publish.
                        </span>
                        <button
                          type="button"
                          onClick={handleSubmitPost}
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-[#0da687] hover:bg-[#0ba082] text-white font-bold text-[10px] rounded-lg shrink-0 cursor-pointer shadow-xs flex items-center gap-1 transition-all active:scale-95"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish Now</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🖼️ FEATURED BANNER IMAGE (1000 × 400 PX) */}
                <div
                  id="banner-upload-section"
                  className={`space-y-2 p-3.5 rounded-2xl transition-all ${
                    showImageRequiredAlert && !thumbnail
                      ? "bg-amber-50/70 border-2 border-amber-400 ring-4 ring-amber-200/50"
                      : "bg-slate-50/60 border border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-[#0da687]" />
                      <span>Featured Banner Image</span>
                    </label>
                    {thumbnail ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Uploaded
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Required to Publish
                      </span>
                    )}
                  </div>

                  {thumbnail ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 group shadow-xs">
                      <img src={thumbnail} alt="Banner Preview" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnail("");
                            triggerAutoSave(undefined, "");
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#0da687] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-emerald-50/30 transition-all group">
                      <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-[#0da687] mb-1.5 transition-colors" />
                      <span className="text-xs font-bold text-slate-700">Click to upload 1000 × 400 banner</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB (1000 × 400 px optimal)</span>
                      <input
                        id="banner-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleThumbnailUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="pt-1">
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={thumbnail || ""}
                      onChange={(e) => {
                        setThumbnail(e.target.value);
                        if (e.target.value) setShowImageRequiredAlert(false);
                        triggerAutoSave(undefined, e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-[#0da687]"
                    />
                  </div>

                  {!thumbnail && (
                    <p className="text-[10px] text-amber-700 font-medium">
                      🔒 Publishing is locked until a banner image is uploaded.
                    </p>
                  )}
                </div>

                {/* Tags (Guaranteed #finsocap) */}
                <div id="blog-tags-container" className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#0da687]" />
                      <span>Tags (Comma-separated)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-saved</span>
                  </div>
                  <input
                    id="blog-tags-input"
                    type="text"
                    value={tags}
                    onChange={(e) => {
                      setTags(e.target.value);
                      triggerAutoSave();
                    }}
                    onFocus={(e) => {
                      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    placeholder="#finsocap, Home Loan, Tax 80C, Mutual Funds"
                    className="w-full px-3.5 py-3 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:border-[#0da687] focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    First tag must always be <strong>#finsocap</strong> for brand SEO consistency.
                  </p>

                  {/* Quick-add Tag Suggestions */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {["#finsocap", "Home Loan", "Tax Saving", "Mutual Funds", "Insurance", "Investment"].map((tagSug) => {
                      const isIncluded = tags.toLowerCase().includes(tagSug.toLowerCase());
                      if (isIncluded) return null;
                      return (
                        <button
                          key={tagSug}
                          type="button"
                          onClick={() => {
                            const newTags = tags ? `${tags}, ${tagSug}` : tagSug;
                            setTags(newTags);
                            triggerAutoSave();
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-bold border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
                        >
                          + {tagSug}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SEO ANALYZER & LIVE GOOGLE SERP PREVIEW */}
            {activeInspectorTab === "seo" && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#0da687]" /> SEO Analyzer
                  </h3>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    seoAudit.score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {seoAudit.score}% Score
                  </span>
                </div>

                {/* Live Google Search Preview (Desktop / Mobile Toggle) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Google Search Preview</span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setSerpViewMode("desktop")}
                        className={`p-1 rounded ${serpViewMode === "desktop" ? "bg-slate-200 text-slate-900" : "text-slate-400"}`}
                        title="Desktop view"
                      >
                        <Monitor className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSerpViewMode("mobile")}
                        className={`p-1 rounded ${serpViewMode === "mobile" ? "bg-slate-200 text-slate-900" : "text-slate-400"}`}
                        title="Mobile view"
                      >
                        <Smartphone className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Google Snippet Card */}
                  <div className={`p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 ${
                    serpViewMode === "mobile" ? "max-w-[280px] mx-auto" : "w-full"
                  }`}>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-[#1a2b5b] text-white flex items-center justify-center text-[8px] font-bold">
                        F
                      </div>
                      <span className="font-medium text-slate-700">finsocap.com</span>
                      <span className="text-slate-300">›</span>
                      <span className="text-slate-400 truncate">blog › {slug || "slug"}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                      {seoTitle || title || "Blog Post Title | Finsocap"}
                    </h4>

                    <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-relaxed">
                      {seoDesc || "Discover in-depth financial advisory, loan comparison, and tax saving strategies with Finsocap certified advisors."}
                    </p>
                  </div>
                </div>

                {/* SEO Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">SEO Meta Title</label>
                    <span className={`text-[10px] font-mono ${seoTitle.length > 60 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                      {seoTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      triggerAutoSave();
                    }}
                    placeholder={title.slice(0, 60) || "SEO Title under 60 chars..."}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:border-[#0da687]"
                  />
                </div>

                {/* SEO Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">SEO Meta Description</label>
                    <span className={`text-[10px] font-mono ${seoDesc.length > 160 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                      {seoDesc.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDesc}
                    onChange={(e) => {
                      setSeoDesc(e.target.value);
                      triggerAutoSave();
                    }}
                    placeholder="Compelling 120-160 char summary with CTA for high Google click-through rate..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:border-[#0da687] resize-none"
                  />
                </div>

                {/* SEO Audit Checklist */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    SEO Ranking Checklist
                  </span>
                  {seoAudit.checks.map((check) => (
                    <div key={check.id} className="flex items-center gap-2 text-xs">
                      {check.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={check.passed ? "text-slate-700 font-medium" : "text-slate-400"}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PUBLISHING & SCHEDULE */}
            {activeInspectorTab === "schedule" && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 animate-in fade-in duration-150">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#0da687]" /> Publishing Schedule
                </h3>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setScheduleMode("publish")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      scheduleMode === "publish" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ⚡ Publish Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode("schedule")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      scheduleMode === "schedule" ? "bg-white text-violet-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ⏰ Schedule Later
                  </button>
                </div>

                {scheduleMode === "schedule" ? (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Pick Date &amp; Time (Indian Standard Time - IST, GMT+5:30)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />

                    {scheduledAt && (
                      <div className="p-3 bg-violet-50 border border-violet-200 rounded-2xl text-[11px] text-violet-800 font-bold">
                        📅 Scheduled for:{" "}
                        {new Date(scheduledAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                        (IST - Indian Time)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 font-medium">
                    ✅ This article will be published immediately and made live across the Finsocap website.
                  </div>
                )}

                {!thumbnail && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Featured banner image is required before going live. Please upload an image in the Details tab.</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SOCIAL AUTO-BROADCAST */}
            {activeInspectorTab === "social" && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#0da687]" /> Social Broadcast
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSocialPost}
                      onChange={(e) => setAutoSocialPost(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0da687]" />
                  </label>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Automatically broadcast a summary and link to LinkedIn and Meta (Facebook Page) as soon as this blog goes live.
                </p>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* LinkedIn Status */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs">
                        in
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">LinkedIn Profile</p>
                        <p className="text-[10px] text-slate-400">
                          {socialIntegrations?.linkedin?.connected
                            ? `Connected as ${socialIntegrations.linkedin.userName || "Admin"}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    {socialIntegrations?.linkedin?.connected ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Ready ✅
                      </span>
                    ) : (
                      <Link
                        href="/api/social/connect/linkedin"
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        Connect
                      </Link>
                    )}
                  </div>

                  {/* Meta (Facebook Page) Status */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                        f
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Meta / Facebook</p>
                        <p className="text-[10px] text-slate-400">
                          {socialIntegrations?.meta?.connected
                            ? `${socialIntegrations.meta.pageName || "Finsocap Facebook Page"}`
                            : "Configure Page ID/Token"}
                        </p>
                      </div>
                    </div>
                    {socialIntegrations?.meta?.connected ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Ready ✅
                      </span>
                    ) : (
                      <Link href="/dashboard/blogs" className="text-[10px] font-bold text-blue-600 hover:underline">
                        Configure
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* 3. AI CO-PILOT LONG-FORM 1500+ WORDS MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Finsocap AI Content Co-Pilot</h3>
                  <p className="text-xs text-slate-500">Generate full-length, 1500+ word, SEO-ranked articles</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {aiError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-medium">
                {aiError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Topic / Main Keyword
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Home Loan vs Mutual Fund SIP: What Saves More Money in 15 Years?"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-hidden focus:border-[#0da687]"
                />
              </div>

              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Home Loan Prepayment vs SIP",
                  "Old vs New Tax Regime 2026",
                  "Best Health Insurance for Parents",
                  "Direct Mutual Funds vs Regular",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAiTopic(chip)}
                    className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Editorial Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-hidden"
                >
                  <option value="Professional & Comprehensive">Professional, Detailed &amp; Authoritative (Recommended)</option>
                  <option value="Practical & Calculation Heavy">Practical with Real Indian Numbers &amp; Tables</option>
                  <option value="Beginner Friendly & Simple">Beginner Friendly &amp; Easy to Understand</option>
                </select>
              </div>

              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  What AI will produce:
                </span>
                <p className="text-[10px] text-purple-800 leading-relaxed">
                  Full 1500+ word article with H2/H3 subheadings, formatted comparison tables, bullet points, FAQ schema, SEO Meta Title, Meta Description, and #finsocap tags.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAiGenerating}
                  onClick={handleAiGenerate}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isAiGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Writing 1500+ Words Article...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate Full Article</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. POST-PUBLISH SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0da687] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {scheduleMode === "schedule" ? "Blog Scheduled Successfully! ⏰" : "Blog Published Live! 🎉"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {scheduleMode === "schedule"
                  ? "Your article has been scheduled and will go live automatically."
                  : "Your article is live on the Finsocap website."}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 break-all">
              https://finsocap.com/blog/{publishedSlug}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/blog/${publishedSlug}`}
                target="_blank"
                className="w-full py-3 rounded-xl bg-[#1a2b5b] hover:bg-[#0da687] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>View Live Article</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => router.push("/dashboard/blogs")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Blog Management
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
