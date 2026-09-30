/**
 * ============================================================================
 * 🌐 GLOBAL BRAND, THEME & WHITE-LABEL CONFIGURATION (DEVELOPER ONLY)
 * ============================================================================
 * 
 * Future software sales / re-branding / white-labeling ke liye sirf is EK file
 * me changes karein. Yahan badlaav karne se poore dashboard ke colors, font,
 * logo, brand name, aur themes automatically update ho jayenge.
 * 
 * 🔒 Note: Iska direct access sirf Development Team ke paas code level par hai.
 * Dashboard UI me koi direct customization expose nahi ki gayi hai.
 * ============================================================================
 */

import type {
  AvailableFont,
  ThemeMode,
  ThemeColors,
  PresetTheme,
  BrandConfig,
} from "@/types";

export type {
  AvailableFont,
  ThemeMode,
  ThemeColors,
  PresetTheme,
  BrandConfig,
};

export function getAssetUrl(path: string): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (basePath && cleanPath.startsWith(basePath)) {
    return cleanPath;
  }
  return `${basePath}${cleanPath}`;
}

export const defaultBrandConfig: BrandConfig = {
  // -------------------------------------------------------------
  // 🏢 1. COMPANY IDENTITY
  // -------------------------------------------------------------
  companyName: "Finsocap Financial",
  shortName: "Finsocap",
  tagline: "Content & Operations Management Dashboard",
  logoUrl: "/Finsocap_logo.png",
  faviconUrl: "/favicon.ico",

  // -------------------------------------------------------------
  // ✍️ 2. GLOBAL TYPOGRAPHY
  // Options: "Inter" | "Outfit" | "Plus Jakarta Sans" | "Poppins" | "Roboto" | "Geist"
  // -------------------------------------------------------------
  fontFamily: "Inter",

  // -------------------------------------------------------------
  // 🌓 3. DEFAULT THEME MODE
  // Options: "light" | "dark" | "system"
  // -------------------------------------------------------------
  defaultMode: "light",

  // -------------------------------------------------------------
  // 🎨 4. CORE BRAND COLORS
  // -------------------------------------------------------------
  colors: {
    primary: "#0e1c44",
    primaryHover: "#1a2b5b",
    accent: "#2563eb",
    accentHover: "#1d4ed8",
    accentSubtle: "rgba(37, 99, 235, 0.12)",
  },

  // -------------------------------------------------------------
  // 🚀 5. READY-TO-USE PRESETS FOR CLIENTS / BUYERS
  // -------------------------------------------------------------
  presets: {
    finsocap: {
      id: "finsocap",
      name: "Finsocap Emerald (Default)",
      description: "Signature Navy Blue with Vibrant Emerald Green accents",
      fontFamily: "Inter",
      colors: {
        primary: "#1b2b5a",
        primaryHover: "#243b78",
        accent: "#0da687",
        accentHover: "#0ba082",
        accentSubtle: "rgba(13, 166, 135, 0.12)",
      },
    },
    corporate_indigo: {
      id: "corporate_indigo",
      name: "Corporate Indigo",
      description: "Executive Deep Indigo paired with Royal Sapphire Blue",
      fontFamily: "Plus Jakarta Sans",
      colors: {
        primary: "#1e1b4b",
        primaryHover: "#312e81",
        accent: "#4f46e5",
        accentHover: "#4338ca",
        accentSubtle: "rgba(79, 70, 229, 0.12)",
      },
    },
    fintech_violet: {
      id: "fintech_violet",
      name: "Fintech Violet",
      description: "Modern obsidian luxury theme with electric purple highlights",
      fontFamily: "Outfit",
      colors: {
        primary: "#180828",
        primaryHover: "#2d124d",
        accent: "#8b5cf6",
        accentHover: "#7c3aed",
        accentSubtle: "rgba(139, 92, 246, 0.12)",
      },
    },
    cyber_rose: {
      id: "cyber_rose",
      name: "Cyber Rose & Crimson",
      description: "Bold dark slate with striking high-conversion rose crimson",
      fontFamily: "Poppins",
      colors: {
        primary: "#18181b",
        primaryHover: "#27272a",
        accent: "#e11d48",
        accentHover: "#be123c",
        accentSubtle: "rgba(225, 29, 72, 0.12)",
      },
    },
    sunset_amber: {
      id: "sunset_amber",
      name: "Sunset Amber & Gold",
      description: "Warm charcoal base with premium gold & amber accents",
      fontFamily: "Inter",
      colors: {
        primary: "#1e293b",
        primaryHover: "#334155",
        accent: "#d97706",
        accentHover: "#b45309",
        accentSubtle: "rgba(217, 119, 6, 0.12)",
      },
    },
    nordic_cyan: {
      id: "nordic_cyan",
      name: "Nordic Cyan Ocean",
      description: "Deep oceanic navy with crisp high-tech cyan highlights",
      fontFamily: "Roboto",
      colors: {
        primary: "#0f172a",
        primaryHover: "#1e293b",
        accent: "#06b6d4",
        accentHover: "#0891b2",
        accentSubtle: "rgba(6, 182, 212, 0.12)",
      },
    },
  },
};
