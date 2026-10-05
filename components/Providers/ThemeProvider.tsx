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

  useEffect(() => {
    // Purge any dark mode settings from localStorage
    try {
      localStorage.removeItem("finsocap_desktop_theme_mode");
      localStorage.removeItem("finsocap_theme_mode");
    } catch (e) {}

    // Strictly enforce light mode on documentElement and body
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      if (document.body) {
        document.body.classList.remove("dark");
        document.body.style.colorScheme = "light";
      }

      // Observer to immediately remove .dark if anything ever tries to add it
      const observer = new MutationObserver(() => {
        if (root.classList.contains("dark")) {
          root.classList.remove("dark");
        }
      });
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });

      return () => observer.disconnect();
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    // Strictly stay light mode
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";

    // Apply Brand Colors & Typography Tokens to :root
    root.style.setProperty("--brand-primary", config.colors.primary);
    root.style.setProperty("--brand-primary-hover", config.colors.primaryHover);
    root.style.setProperty("--brand-accent", config.colors.accent);
    root.style.setProperty("--brand-accent-hover", config.colors.accentHover);
    root.style.setProperty("--brand-accent-subtle", config.colors.accentSubtle);
  }, [config]);

  return (
    <ThemeContext.Provider value={{ config, mode: "light", resolvedMode: "light", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
