"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  ImageIcon,
  Table,
  Undo2,
  Redo2,
  ChevronDown,
  Check,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FORMAT_OPTIONS = [
  { label: "Paragraph", tag: "<p>" },
  { label: "Heading 1", tag: "<h1>" },
  { label: "Heading 2", tag: "<h2>" },
  { label: "Heading 3", tag: "<h3>" },
  { label: "Preformatted", tag: "<pre>" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write detailed content about the service (process, eligibility, documents, benefits etc.)...",
  minHeight = "min-h-[170px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedFormat, setSelectedFormat] = useState("Paragraph");
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value || value === "<p><br></p>" || value === "<p></p>");

  // Initialize and keep in sync if external value changes drastically
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || "";
        checkEmpty();
      }
    }
  }, [value]);

  // Click outside to close format dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFormatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkEmpty = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.trim();
    const html = editorRef.current.innerHTML;
    const empty = text.length === 0 && !html.includes("<img") && !html.includes("<table");
    setIsEmpty(empty);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    checkEmpty();
  };

  const executeCommand = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleFormatChange = (option: { label: string; tag: string }) => {
    setSelectedFormat(option.label);
    setIsFormatDropdownOpen(false);
    executeCommand("formatBlock", option.tag);
  };

  const handleInsertLink = () => {
    const url = window.prompt("Enter link URL (e.g. https://example.com):", "https://");
    if (url && url !== "https://") {
      executeCommand("createLink", url);
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt("Enter image URL (or specimen link):", "https://");
    if (url && url !== "https://") {
      executeCommand("insertImage", url);
    }
  };

  const handleInsertTable = () => {
    const tableMarkup = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: rgba(148, 163, 184, 0.15);">
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; text-align: left;">Requirement</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; text-align: left;">Details</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; text-align: left;">Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Item 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Description</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Mandatory</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Item 2</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Description</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Standard</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    executeCommand("insertHTML", tableMarkup);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      {/* 1. Rich Text Toolbar (Exact match with user reference screenshot) */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-slate-50/90 dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 select-none">
        
        {/* Paragraph / Heading Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1e2a53] dark:text-sky-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Text Style"
          >
            <span>{selectedFormat}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isFormatDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-36 bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in duration-100">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleFormatChange(opt)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer ${
                    selectedFormat === opt.label
                      ? "text-blue-600 dark:text-sky-400 font-bold bg-blue-50/50 dark:bg-blue-950/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedFormat === opt.label && <Check className="w-3 h-3 text-blue-600 dark:text-sky-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Basic Styling: B, I, U */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Lists & Quote */}
        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<blockquote>")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Quote / Callout"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => executeCommand("justifyLeft")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("justifyCenter")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("justifyRight")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Media & Table */}
        <button
          type="button"
          onClick={handleInsertLink}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleInsertImage}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert Image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleInsertTable}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert Table"
        >
          <Table className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => executeCommand("undo")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("redo")}
          className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Editable Content Area with Placeholder */}
      <div className="relative p-4 sm:p-5">
        {isEmpty && (
          <div
            onClick={() => editorRef.current?.focus()}
            className="absolute top-4 left-4 sm:top-5 sm:left-5 text-slate-400 dark:text-slate-500 text-xs font-normal pointer-events-none select-none"
          >
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className={`focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed ${minHeight} [&_h1]:text-xl [&_h1]:font-black [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_a]:text-blue-600 [&_a]:underline`}
        />
      </div>
    </div>
  );
}
