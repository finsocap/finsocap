# 🚀 Finsocap - Content & Operations Management Platform

A high-performance, white-labelable, pure-frontend dashboard built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**.

---

## 📁 Project Directory Structure

```text
finsocap-dashboard/
├── app/                                 # Next.js App Router Pages & Layouts
│   ├── dashboard/
│   │   ├── (admin)/                     # Authenticated Admin Modules
│   │   │   ├── blogs/                   # Blog Studio & CMS (/dashboard/blogs)
│   │   │   │   ├── [id]/                # Edit Existing Article
│   │   │   │   ├── new/                 # Create New Article
│   │   │   │   └── page.tsx             # Articles Table & Management
│   │   │   ├── chat/                    # Real-time Team & Channel Chat
│   │   │   ├── settings/                # Profile & Security Settings
│   │   │   ├── layout.tsx               # Admin Layout (Sidebar + Topbar)
│   │   │   ├── loading.tsx              # Skeleton & Route Transition Loading
│   │   │   └── page.tsx                 # Executive Home Dashboard
│   │   └── (auth)/                      # Authentication Pages
│   │       ├── forgot-password/         # Password Reset & OTP Flow
│   │       ├── login/                   # User Sign In
│   │       └── register/                # User Sign Up
│   ├── globals.css                      # Global Styles, CSS Variables & Typography
│   ├── layout.tsx                       # Root Layout (Fonts, Theme & Auth Providers)
│   └── page.tsx                         # Root Redirect -> /dashboard
│
├── components/                          # Modular UI Components
│   ├── Dashboard/                       # Dashboard Specific Components
│   │   ├── AccessDenied.tsx             # Permission Fallback
│   │   ├── BlogEditorStudio.tsx         # TipTap Rich Text Article Editor
│   │   ├── DashboardMain.tsx            # Main View Container
│   │   ├── Sidebar.tsx                  # Collapsible Left Navigation
│   │   ├── Topbar.tsx                   # Top Search, Notifications & User Menu
│   │   └── index.ts                     # Dashboard Barrel Export
│   ├── Global/                          # Universal Shared Modals & Utilities
│   │   ├── DeveloperProfileModal.tsx    # Developer Profile Modal
│   │   ├── TopProgressBar.tsx           # Route Transition Progress Bar
│   │   └── index.ts                     # Global Barrel Export
│   ├── Providers/                       # React Context & State Providers
│   │   ├── AuthProvider.tsx             # Mock Session & Auth Provider
│   │   ├── ThemeProvider.tsx            # White-label Brand & Theme Provider
│   │   └── index.ts                     # Providers Barrel Export
│   └── index.ts                         # Top-level Components Export
│
├── lib/                                 # Application Logic & Data Layer
│   ├── brandConfig.ts                   # 🎨 Global Theme & White-label Config (Dev Team Only)
│   ├── clientCache.ts                   # Fast In-Memory & LocalStorage Cache
│   ├── mockApi.ts                       # Intercepted Mock REST API Router
│   ├── mockData.ts                      # Initial Articles, Categories & User Profile
│   ├── soundEffects.ts                  # Audio Feedback Effects
│   └── index.ts                         # Lib Barrel Export
│
├── types/                               # TypeScript Definitions
│   └── index.ts                         # Centralized Interfaces (Blog, User, Brand, etc.)
│
└── public/                              # Static Public Assets
    ├── images/                          # Brand illustrations & icons
    ├── uploads/                         # User uploaded images & media
    └── favicon.ico                      # Site Favicon
```

---

## 🎨 White-label & Rebranding (Dev Team Only)

To rebrand or sell this dashboard to a new client, change the configuration in **`lib/brandConfig.ts`**:

```typescript
// lib/brandConfig.ts
export const defaultBrandConfig: BrandConfig = {
  companyName: "Acme Finance Corp",
  shortName: "Acme",
  tagline: "Intelligent Wealth Management",
  logoUrl: "/logo.png",
  defaultMode: "light",          // "light" | "dark" | "system"
  fontFamily: "Outfit",          // "Inter" | "Outfit" | "Plus Jakarta Sans" | "Poppins" | "Roboto"
  colors: {
    primary: "#0f172a",          // Main Brand Color
    primaryHover: "#1e293b",
    accent: "#3b82f6",           // Highlight / Action Accent
    accentHover: "#2563eb",
    accentSubtle: "rgba(59, 130, 246, 0.12)",
  },
};
```

All fonts, colors, titles, and layout themes will automatically update across the entire application without needing any other file edits.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Production build test
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
