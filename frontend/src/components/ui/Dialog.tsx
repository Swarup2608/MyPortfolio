"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CircleCheck, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "danger" | "success";

type BaseOptions = {
  title: string;
  message?: React.ReactNode;
  tone?: Tone;
};

export type ConfirmOptions = BaseOptions & {
  confirmText?: string;
  cancelText?: string;
  // Runs with the dialog still open and a spinner on the confirm button. If it throws,
  // the error is shown inside the dialog so the user can retry or cancel.
  onConfirm?: () => unknown;
};

export type AlertOptions = BaseOptions & {
  okText?: string;
};

type OpenDialog = {
  id: number;
  kind: "confirm" | "alert";
  options: ConfirmOptions & AlertOptions;
  resolve: (confirmed: boolean) => void;
};

type DialogApi = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
};

const DialogContext = createContext<DialogApi | null>(null);

// Replacement for window.confirm / window.alert:
//   const dialog = useDialog();
//   if (await dialog.confirm({ title: "Delete?", tone: "danger" })) { ... }
//   await dialog.alert({ title: "Saved", tone: "success" });
export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const current = useRef<OpenDialog | null>(null);
  const nextId = useRef(0);
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((kind: OpenDialog["kind"], options: OpenDialog["options"]) => {
    if (current.current) {
      current.current.resolve(false); // a newer dialog replaces the open one
    } else {
      returnFocus.current = document.activeElement as HTMLElement | null;
    }
    return new Promise<boolean>((resolve) => {
      const next = { id: ++nextId.current, kind, options, resolve };
      current.current = next;
      setDialog(next);
    });
  }, []);

  const close = useCallback((id: number, confirmed: boolean) => {
    if (current.current?.id !== id) return; // already closed (e.g. clicked during exit animation)
    current.current.resolve(confirmed);
    current.current = null;
    setDialog(null);
    returnFocus.current?.focus();
  }, []);

  const api = useMemo<DialogApi>(
    () => ({
      confirm: (options) => open("confirm", options),
      alert: (options) => open("alert", options).then(() => undefined),
    }),
    [open]
  );

  const isOpen = dialog !== null;

  useEffect(() => {
    if (!isOpen) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [isOpen]);

  return (
    <DialogContext.Provider value={api}>
      {children}
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {dialog && <DialogModal key={dialog.id} dialog={dialog} onClose={close} />}
        </AnimatePresence>
      </MotionConfig>
    </DialogContext.Provider>
  );
}

const toneStyles = {
  default: { icon: Info, badge: "bg-accent-soft text-accent", confirm: "gradient-cta text-white" },
  danger: {
    icon: TriangleAlert,
    badge: "bg-red-400/10 text-red-400",
    confirm: "bg-red-500 text-white hover:bg-red-400",
  },
  success: {
    icon: CircleCheck,
    badge: "bg-green-400/10 text-green-400",
    confirm: "gradient-cta text-white",
  },
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5.5 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function DialogModal({
  dialog,
  onClose,
}: {
  dialog: OpenDialog;
  onClose: (id: number, confirmed: boolean) => void;
}) {
  const { id, kind, options } = dialog;
  const tone = options.tone ?? "default";
  const { icon: Icon, badge, confirm: confirmStyle } = toneStyles[tone];

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const messageId = useId();

  function cancel() {
    if (!busy) onClose(id, false);
  }

  async function handleConfirm() {
    if (busy) return;
    if (!options.onConfirm) return onClose(id, true);
    setBusy(true);
    setError("");
    try {
      await options.onConfirm();
      onClose(id, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  useEffect(() => {
    if (busy) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose(id, false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [busy, id, onClose]);

  // Keep Tab / Shift+Tab cycling inside the dialog.
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Destructive dialogs start on Cancel so a stray Enter doesn't delete anything.
  const focusCancel = kind === "confirm" && tone === "danger";

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={cancel}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={options.message ? messageId : undefined}
        aria-busy={busy}
        onKeyDown={trapFocus}
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl border border-foreground/10 bg-surface p-6 shadow-2xl shadow-black/60 sm:p-7"
      >
        <div className="flex gap-4">
          <span
            className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", badge)}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 pt-1.5">
            <h2 id={titleId} className="text-lg font-semibold leading-snug text-foreground">
              {options.title}
            </h2>
            {options.message && (
              <div
                id={messageId}
                className="mt-2 text-sm font-light leading-relaxed text-foreground/55"
              >
                {options.message}
              </div>
            )}
            {error && (
              <p
                role="alert"
                className="mt-3.5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-400"
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          {kind === "confirm" && (
            <button
              type="button"
              onClick={cancel}
              aria-disabled={busy}
              autoFocus={focusCancel}
              className={cn(
                buttonBase,
                "border border-foreground/15 text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              {options.cancelText ?? "Cancel"}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            aria-disabled={busy}
            autoFocus={!focusCancel}
            className={cn(buttonBase, confirmStyle)}
          >
            {busy && <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />}
            {kind === "alert" ? (options.okText ?? "OK") : (options.confirmText ?? "Confirm")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
