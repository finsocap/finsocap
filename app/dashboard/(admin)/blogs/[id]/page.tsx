"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import BlogEditorStudio from "@/components/Dashboard/BlogEditorStudio";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (!res.ok) {
          throw new Error("Blog post not found or failed to load.");
        }
        const data = await res.json();
        setBlog(data);
      } catch (err: any) {
        setError(err.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a2b5b] to-[#0da687] flex items-center justify-center shadow-lg shadow-blue-900/10 animate-pulse">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Loading blog in Finsocap Studio...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Blog Not Found</h2>
        <p className="text-sm text-slate-600">{error || "The requested blog post could not be loaded."}</p>
        <Link
          href="/dashboard/blogs"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a2b5b] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm font-semibold text-slate-500">
          Loading Blog Studio...
        </div>
      }
    >
      <BlogEditorStudio
        isEditMode={true}
        initialData={{
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          categoryId: blog.categoryId,
          thumbnail: blog.thumbnail,
          seoTitle: blog.seoTitle,
          seoDesc: blog.seoDesc,
          tags: blog.tags,
          status: blog.status,
          scheduledAt: blog.scheduledAt,
        }}
      />
    </Suspense>
  );
}
