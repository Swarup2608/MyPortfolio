"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeId = "dark" | "light";

export const themes: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "dark", label: "Dark", swatch: "#b600a8" },
  { id: "light", label: "Light", swatch: "#f6f6f7" },
];

const STORAGE_KEY = "theme";
const DEFAULT_THEME: ThemeId = "dark";

function isThemeId(value: string | null): value is ThemeId {
  return themes.some((t) => t.id === value);
}

function storedTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // localStorage unavailable (private browsing, disabled storage) — use the default
  }
  return DEFAULT_THEME;
}

const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const fromScript = document.documentElement.getAttribute("data-theme");
    // No attribute means the init script didn't run: the page was rendered in the browser
    // rather than hydrated (e.g. Next's not-found fallback), so apply the stored choice here.
    const current = isThemeId(fromScript) ? fromScript : storedTheme();
    if (current !== fromScript) document.documentElement.setAttribute("data-theme", current);
    // Syncing from the inline anti-flash script, which sets the DOM attribute
    // before hydration — not state derivable from render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(current);
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

const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var valid=${JSON.stringify(
  themes.map((t) => t.id),
)};if(!t||valid.indexOf(t)===-1)t='${DEFAULT_THEME}';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

// Sets data-theme before first paint so there's no flash of the default theme. It only
// belongs in the server HTML: when React renders the root layout in the browser instead
// (Next's not-found fallback), a <script> it creates never runs and React warns about it,
// so the client renders nothing and ThemeProvider applies the theme. Hydration skips the
// server's extra tag in <head>.
export function ThemeInitScript() {
  if (typeof window !== "undefined") return null;
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
