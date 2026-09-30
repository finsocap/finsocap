"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

export default function DeveloperProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key & disable background body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const servicesList = [
    {
      icon: "🎨",
      title: "UI / UX & System Design",
      desc: "Figma prototypes, design tokens & high-converting UX",
      tag: "Figma Pro",
    },
    {
      icon: "💻",
      title: "Full Stack Web Apps",
      desc: "Next.js 15, React, TypeScript & Tailwind CSS",
      tag: "Production Ready",
    },
    {
      icon: "⚙️",
      title: "CRM, Portals & Dashboards",
      desc: "Lead radars, team presence, invoice generators & analytics",
      tag: "Enterprise",
    },
    {
      icon: "⚡",
      title: "API & Backend Architecture",
      desc: "Node.js, Prisma ORM, MySQL & REST Integrations",
      tag: "High Scale",
    },
    {
      icon: "🚀",
      title: "Speed, SEO & Lighthouse 99+",
      desc: "Zero-bloat performance, mobile-first responsiveness",
      tag: "99+ Score",
    },
  ];

  const software = [
    { name: "Figma", category: "UI/UX" },
    { name: "Photoshop", category: "Design" },
    { name: "Illustrator", category: "Vector" },
    { name: "Premiere Pro", category: "Video" },
    { name: "After Effects", category: "Motion" },
    { name: "VS Code", category: "Dev" },
  ];

  const techStack = [
    "Next.js",
    "React.js",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Prisma ORM",
    "MySQL",
    "REST APIs",
    "Git",
  ];

  const modalContent = (
    <div
      className="dark fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      style={{
        background: "rgba(4, 6, 12, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Aarav Jha - Developer Profile & Bento Showcase"
    >
      {/* Scoped CSS to eliminate ANY visible scrollbar tracks across all engines */}
      <style jsx global>{`
        .bento-modal-root::-webkit-scrollbar,
        .bento-modal-root *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        .bento-modal-root::-webkit-scrollbar-track,
        .bento-modal-root *::-webkit-scrollbar-track,
        .bento-modal-root::-webkit-scrollbar-thumb,
        .bento-modal-root *::-webkit-scrollbar-thumb {
          display: none !important;
          background: transparent !important;
        }
        .bento-modal-root,
        .bento-modal-root * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Main Bento Container Card */}
      <div
        className="bento-modal-root relative w-full max-w-4xl max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar rounded-[28px] sm:rounded-[34px] text-white p-3.5 sm:p-5 md:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: "#08090f",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:
            "0 30px 100px -20px rgba(0, 0, 0, 0.95), 0 0 60px rgba(112, 56, 238, 0.18)",
        }}
      >
        {/* ========================================================================= */}
        {/* 1. TOP HERO BENTO CARD (Electric Purple Inspiration like McDonald's Star) */}
        {/* ========================================================================= */}
        <div
          className="relative rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 md:p-7 mb-3 sm:mb-4 overflow-hidden text-white"
          style={{
            background:
              "linear-gradient(135deg, #7038ee 0%, #6d28d9 45%, #4f46e5 100%)",
            boxShadow:
              "inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 12px 35px -8px rgba(112, 56, 238, 0.5)",
          }}
        >
          {/* Subtle ambient lighting orb */}
          <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          {/* Top Bar inside Hero */}
          <div className="flex items-center justify-between gap-2 mb-5 sm:mb-7">
            {/* Left badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-amber-300 font-black text-xs border border-white/20 shadow-inner">
                ⚡
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white/90 bg-black/25 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                Lead Creator
              </span>
            </div>

            {/* Center Pills (Inspired by Search Bar & Category Links in reference) */}
            <div className="hidden md:flex items-center gap-2">
              <div className="bg-black/30 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[11px] font-medium text-white/90 flex items-center gap-1.5 shadow-sm">
                <span className="text-white/60">🔍</span>
                <span>Full Stack · UI/UX · FinTech</span>
              </div>
              <span className="bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-white border border-white/15 transition-all">
                Works ↗
              </span>
              <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                Available for Projects
              </span>
            </div>

            {/* Right Status & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">Online</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white/90 hover:text-white flex items-center justify-center transition-all text-xs font-bold border border-white/20 active:scale-95 cursor-pointer shadow-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Hero Headline & Creator Block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              {/* "Hello Star" style big display typography */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
                Hello, I&apos;m Aarav
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-violet-100/90 mt-0.5">
                Full Stack Developer &amp; UI / UX Designer
              </p>

              {/* Creator details with Avatar */}
              <div className="flex items-center gap-3.5 sm:gap-4 mt-3 sm:mt-4">
                {/* Avatar with R2D2-style Star Badge */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/40 p-0.5 border-2 border-white/35"
                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
                  >
                    <Image
                      src="/Aaravdp.png"
                      alt="Aarav Jha"
                      width={80}
                      height={80}
                      className="object-cover object-top w-full h-full rounded-[14px]"
                      priority
                    />
                  </div>
                  {/* Floating Gold Star Badge */}
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                    ★
                  </div>
                  {/* Active dot */}
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#6d28d9] shadow" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Aarav Jha
                    </span>
                    <span
                      className="w-4 h-4 rounded-full bg-white text-violet-700 flex items-center justify-center text-[9px] font-black shadow"
                      title="Verified Creator"
                    >
                      ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 font-medium">
                    Finsocap Platform Architect &amp; Core Engineer
                  </p>
                  <p className="text-[10px] text-white/60 font-normal leading-relaxed mt-0.5 max-w-sm">
                    Specialized in enterprise web platforms, custom CRMs &amp; high-conversion UI/UX.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Emblem / Monogram (Inspired by Golden M in inspiration) */}
            <div className="hidden sm:flex flex-col items-end justify-center self-stretch pr-2">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-200/70 block">
                  Signature
                </span>
                <div className="text-3xl md:text-4xl font-black tracking-tight text-amber-300 drop-shadow-lg font-mono">
                  &#123; AJ &#125;
                </div>
                <span className="text-[10px] font-semibold text-white/70 block">
                  Design &amp; Code
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BENTO MIDDLE SECTION (Grid matching the inspiration screenshot)         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5 mb-3 sm:mb-3.5">
          {/* LEFT BENTO BOX (7 cols): Today's Plan / Services */}
          <div
            className="md:col-span-7 rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 flex flex-col justify-between"
            style={{
              background: "#10121a",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-amber-400">⚡</span> Core Capabilities
                  </h3>
                  <p className="text-[11px] text-white/45">
                    What I deliver across development &amp; design
                  </p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Full Stack Suite
                </span>
              </div>

              {/* Capability Rows */}
              <div className="space-y-2">
                {servicesList.map((srv, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/[0.03] hover:border-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base flex-shrink-0 w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
                        {srv.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                          {srv.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {srv.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-violet-300/80 bg-white/5 px-2 py-0.5 rounded-md flex-shrink-0 ml-2 border border-white/5">
                      {srv.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom tags */}
            <div className="mt-3.5 pt-3 border-t border-white/[0.05] flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-white/40 uppercase font-black mr-1">
                Values:
              </span>
              {[
                "Pixel Precision",
                "High Speed",
                "Clean Architecture",
                "Conversion Focused",
              ].map((val) => (
                <span
                  key={val}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.04]"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT BENTO STACK (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3 sm:gap-3.5">
            {/* Top Mini Dual Bento Cards: Points + Performance Balance */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Card A: Projects Delivered (+97 style) */}
              <div
                className="rounded-[20px] p-3.5 text-white flex flex-col justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, #831843 0%, #701a75 50%, #4c0519 100%)",
                  boxShadow: "0 6px 20px -5px rgba(131, 24, 67, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-pink-200/80">
                    Projects
                  </p>
                  <p className="text-[10px] text-white/60">Delivered</p>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    +98%
                  </span>
                  <p className="text-[9px] font-semibold text-pink-200/80">
                    On-Time Ship
                  </p>
                </div>
              </div>

              {/* Card B: Performance Score (Lighthouse 99+ with Sparkline) */}
              <div
                className="rounded-[20px] p-3.5 flex flex-col justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  boxShadow: "0 6px 20px -5px rgba(49, 46, 129, 0.4)",
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/80">
                    Speed
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Score
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    99.8
                  </span>
                  {/* Mini SVG Curve Graph matching inspiration */}
                  <svg
                    className="w-full h-5 mt-1 overflow-visible"
                    viewBox="0 0 100 24"
                    fill="none"
                  >
                    <path
                      d="M0 20 Q 25 18, 50 10 T 100 4"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="4" r="3" fill="#c7d2fe" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Golden Amber Card (EXACT MATCH to Customers Reviews 5S in inspiration!) */}
            <div
              className="rounded-[22px] p-4 text-slate-950 flex flex-col justify-between"
              style={{
                background:
                  "linear-gradient(135deg, #fef08a 0%, #fde047 30%, #f59e0b 100%)",
                boxShadow: "0 8px 25px -6px rgba(245, 158, 11, 0.45)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-950/70">
                    Customer Reviews
                  </p>
                  <h4 className="text-xs font-black text-slate-900 mt-0.5">
                    100% Client Satisfaction
                  </h4>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center text-xs font-black shadow">
                  ★
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-950 tracking-tight leading-none">
                    5.0
                  </span>
                  <span className="text-xs font-bold text-amber-950 ml-1">
                    ★ Rating
                  </span>
                  <p className="text-[10px] font-bold text-slate-800/80 mt-0.5">
                    Verified Quality &amp; Precision
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-black text-amber-300 shadow">
                  Top Rated
                </span>
              </div>
            </div>

            {/* Direct Connect Box (Email & Phone with 1-click Copy) */}
            <div
              className="rounded-[22px] p-4 flex flex-col justify-between flex-1"
              style={{
                background: "#10121a",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Direct Contact
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Quick Response
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Email */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-xs">📧</span>
                      <div className="min-w-0">
                        <span className="text-[9px] block text-white/40 font-bold uppercase leading-none">
                          Email
                        </span>
                        <a
                          href="mailto:httpsaaravjha@gmail.com"
                          className="text-xs font-semibold text-violet-300 hover:text-white truncate block transition-colors"
                        >
                          httpsaaravjha@gmail.com
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard("httpsaaravjha@gmail.com", "email")
                      }
                      className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-md transition-all active:scale-95 cursor-pointer"
                      style={{
                        background:
                          copied === "email"
                            ? "#10b981"
                            : "rgba(255,255,255,0.08)",
                        color:
                          copied === "email"
                            ? "#ffffff"
                            : "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {copied === "email" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-xs">📱</span>
                      <div className="min-w-0">
                        <span className="text-[9px] block text-white/40 font-bold uppercase leading-none">
                          Phone / WhatsApp
                        </span>
                        <a
                          href="tel:+919953065623"
                          className="text-xs font-semibold text-emerald-300 hover:text-white truncate block transition-colors"
                        >
                          +91 9953065623
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard("+919953065623", "phone")
                      }
                      className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-md transition-all active:scale-95 cursor-pointer"
                      style={{
                        background:
                          copied === "phone"
                            ? "#10b981"
                            : "rgba(255,255,255,0.08)",
                        color:
                          copied === "phone"
                            ? "#ffffff"
                            : "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {copied === "phone" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <a
                  href="mailto:httpsaaravjha@gmail.com"
                  className="py-2 px-3 rounded-xl text-center text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #7038ee 0%, #4f46e5 100%)",
                  }}
                >
                  <span>✉️</span> Send Email
                </a>
                <a
                  href="tel:+919953065623"
                  className="py-2 px-3 rounded-xl text-center text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>📞</span> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM BENTO STRIP: Design Suite & Engineering Frameworks               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
          {/* Creative Suite (5 cols) */}
          <div
            className="md:col-span-5 rounded-[20px] p-3.5 sm:p-4 flex flex-col justify-between"
            style={{
              background: "#10121a",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Design &amp; Creative Tools
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  Adobe &amp; Figma
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {software.map((sw) => (
                  <span
                    key={sw.name}
                    className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20 hover:bg-amber-400/20 transition-all"
                  >
                    {sw.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack (7 cols) */}
          <div
            className="md:col-span-7 rounded-[20px] p-3.5 sm:p-4 flex flex-col justify-between"
            style={{
              background: "#10121a",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  Engineering &amp; Frameworks
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  Modern Full Stack
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 hover:bg-cyan-400/20 transition-all"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. ATTRIBUTION FOOTER STRIP                                               */}
        {/* ========================================================================= */}
        <div className="mt-3.5 pt-2.5 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] text-white/40 font-medium px-1">
          <p className="flex items-center gap-1.5">
            <span>🔒</span> Official Developer Signature &amp; Attribution
          </p>
          <p className="text-white/30">
            Crafted with Next.js &amp; TypeScript for Finsocap
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger Button (Footer & Sidebar) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Developer Profile - Aarav Jha"
        title="Developer: Aarav Jha"
        className="group inline-flex items-center gap-1.5 text-slate-400 hover:text-violet-400 transition-all duration-300 text-[11px] font-medium cursor-pointer select-none"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-violet-400">
          ⚡
        </span>
        <span className="group-hover:text-violet-300 transition-colors duration-300">
          Developed by{" "}
          <span className="font-bold underline decoration-dotted underline-offset-2 group-hover:decoration-solid text-slate-300 group-hover:text-violet-300">
            Aarav Jha
          </span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
      </button>

      {/* Portal to body so no parent container overflow/scroll affects modal */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
