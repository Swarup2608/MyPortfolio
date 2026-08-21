"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeId = "dark" | "light" | "monolithic" | "high-contrast" | "retro" | "solarized";

export const themes: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "dark", label: "Dark", swatch: "#b600a8" },
  { id: "light", label: "Light", swatch: "#f6f6f7" },
  { id: "monolithic", label: "Monolithic", swatch: "#ffffff" },
  { id: "high-contrast", label: "High Contrast", swatch: "#ffff00" },
  { id: "retro", label: "Retro", swatch: "#33ff33" },
  { id: "solarized", label: "Solarized", swatch: "#268bd2" },
];

const STORAGE_KEY = "theme";
const DEFAULT_THEME: ThemeId = "dark";

const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as ThemeId | null;
    if (current && themes.some((t) => t.id === current)) {
      // Syncing from the inline anti-flash script, which sets the DOM attribute
      // before hydration — not state derivable from render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(current);
    }
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private browsing, disabled storage) — theme still applies for this session
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var valid=${JSON.stringify(
  themes.map((t) => t.id),
)};if(!t||valid.indexOf(t)===-1)t='${DEFAULT_THEME}';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
