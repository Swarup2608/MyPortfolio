"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { themes, useTheme } from "@/lib/themeContext";

export function ThemeSwitcher() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dragged = useRef(false);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -280, bottom: 280 }}
      dragElastic={0.12}
      dragMomentum={false}
      onDragStart={() => {
        dragged.current = false;
      }}
      onDrag={() => {
        dragged.current = true;
      }}
      className="fixed top-1/2 right-3 z-50 sm:right-5"
      style={{ touchAction: "none" }}
    >
      <div className="flex flex-col items-end gap-2">
        {open && (
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface/95 p-2 shadow-xl backdrop-blur-xl">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-medium tracking-wide uppercase transition-colors hover:bg-foreground/5 ${
                  theme === t.id ? "text-accent" : "text-foreground/70"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-foreground/20"
                  style={{ background: t.swatch }}
                  aria-hidden
                />
                <span className="flex-1">{t.label}</span>
                {theme === t.id && <Check size={13} aria-hidden />}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            setOpen((v) => !v);
          }}
          aria-label="Change theme"
          aria-expanded={open}
          className="flex h-11 w-11 cursor-grab items-center justify-center rounded-full border border-border bg-surface/95 shadow-lg backdrop-blur-xl active:cursor-grabbing"
        >
          <Palette size={18} className="text-foreground/80" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}
