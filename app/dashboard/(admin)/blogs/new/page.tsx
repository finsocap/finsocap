"use client";

import { Suspense } from "react";
import BlogEditorStudio from "@/components/Dashboard/BlogEditorStudio";

export default function NewBlogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm font-semibold text-slate-500">
          Loading Blog Studio...
        </div>
      }
    >
      <BlogEditorStudio isEditMode={false} />
    </Suspense>
  );
}
