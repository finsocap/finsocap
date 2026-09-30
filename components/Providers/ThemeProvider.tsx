"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { BrandConfig, defaultBrandConfig, ThemeMode } from "@/lib/brandConfig";

interface ThemeContextType {
  config: BrandConfig;
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  config: defaultBrandConfig,
  mode: defaultBrandConfig.defaultMode,
  resolvedMode: defaultBrandConfig.defaultMode === "dark" ? "dark" : "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const config = defaultBrandConfig;
  const [currentMode, setCurrentMode] = React.useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("finsocap_theme_mode");
      if (saved === "dark" || saved === "light") {
        setCurrentMode(saved);
        return;
      }
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setCurrentMode("dark");
      }
    } catch (e) {}
  }, []);

  const toggleTheme = React.useCallback(() => {
    setCurrentMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("finsocap_theme_mode", next);
      } catch (e) {}
      return next;
    });
  }, []);

  const resolvedMode = currentMode;

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (resolvedMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply Brand Colors & Typography Tokens to :root
    root.style.setProperty("--brand-primary", config.colors.primary);
    root.style.setProperty("--brand-primary-hover", config.colors.primaryHover);
    root.style.setProperty("--brand-accent", config.colors.accent);
    root.style.setProperty("--brand-accent-hover", config.colors.accentHover);
    root.style.setProperty("--brand-accent-subtle", config.colors.accentSubtle);
  }, [config, resolvedMode]);

  return (
    <ThemeContext.Provider value={{ config, mode: resolvedMode, resolvedMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
