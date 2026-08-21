"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";

interface SetPasswordDialogProps {
  open: boolean;
  userName?: string;
  onSubmit: (password: string) => Promise<void> | void;
  onCancel: () => void;
}

export function SetPasswordDialog({ open, userName, onSubmit, onCancel }: SetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="set-password-title"
            className="relative w-full max-w-sm rounded-2xl border border-foreground/10 bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-accent" />
              <h2 id="set-password-title" className="text-base font-semibold text-foreground">
                Set password{userName ? ` for ${userName}` : ""}
              </h2>
            </div>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-foreground/55">
              New password
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="mt-2 w-full rounded-xl border border-foreground/15 bg-transparent px-3.5 py-2.5 text-sm font-normal text-foreground outline-none transition-colors focus:border-accent"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium tracking-wide uppercase text-foreground/70 transition-colors hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="gradient-cta rounded-full px-4 py-2 text-xs font-medium tracking-wide uppercase text-white disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
