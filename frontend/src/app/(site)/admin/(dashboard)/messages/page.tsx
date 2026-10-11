"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDialog } from "@/components/ui/Dialog";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { PaginatedResponse } from "@/types/api";

type ContactStatus = "NEW" | "READ" | "ARCHIVED";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

const isUnread = (m: ContactMessage) => m.status === "NEW";

const VIEWS = [
  { key: "inbox", label: "Inbox" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function inView(m: ContactMessage, view: ViewKey) {
  if (view === "archived") return m.status === "ARCHIVED";
  if (view === "unread") return m.status === "NEW";
  return m.status !== "ARCHIVED";
}

const actionClass =
  "text-xs font-medium uppercase tracking-widest transition-colors disabled:opacity-40";

const DATE_RANGES = [
  { key: "all", label: "All time" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
] as const;

type DateRangeKey = (typeof DATE_RANGES)[number]["key"] | "custom";
type SortOrder = "newest" | "oldest";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<ViewKey>("inbox");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const dialog = useDialog();
  const [dateRange, setDateRange] = useState<DateRangeKey>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [now, setNow] = useState<number | null>(null);
  const canUpdate = usePermission(PERMISSIONS.CONTACTS_UPDATE);

  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const customRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCustom) return;
    function handleClickOutside(e: MouseEvent) {
      if (customRef.current && !customRef.current.contains(e.target as Node)) {
        setShowCustom(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustom]);

  function load() {
    adminFetch<PaginatedResponse<ContactMessage>>("/admin/contact?limit=50")
      .then((data) => setMessages(data.data))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load messages")
      );
  }

  useEffect(load, []);

  async function changeStatus(m: ContactMessage, status: ContactStatus, successText?: string) {
    setPendingId(m._id);
    try {
      await adminFetch(`/admin/contact/${m._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessages((prev) => prev && prev.map((x) => (x._id === m._id ? { ...x, status } : x)));
      if (successText) toast.success(successText);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update the message");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(m: ContactMessage) {
    const deleted = await dialog.confirm({
      tone: "danger",
      title: "Delete this message?",
      message: (
        <>
          The message from <span className="font-normal text-foreground/80">{m.name}</span> will
          be permanently removed. This cannot be undone.
        </>
      ),
      confirmText: "Delete",
      onConfirm: () => adminFetch(`/admin/contact/${m._id}`, { method: "DELETE" }),
    });
    if (!deleted) return;
    setMessages((prev) => prev && prev.filter((x) => x._id !== m._id));
    toast.success("Message deleted");
  }

  const filtered = useMemo(() => {
    if (!messages) return [];

    let list = messages.filter((m) => inView(m, view));

    if (dateRange === "custom") {
      const fromTime = appliedFrom ? new Date(`${appliedFrom}T00:00:00`).getTime() : -Infinity;
      const toTime = appliedTo ? new Date(`${appliedTo}T23:59:59.999`).getTime() : Infinity;
      list = list.filter((m) => {
        const t = new Date(m.createdAt).getTime();
        return t >= fromTime && t <= toTime;
      });
    } else if (dateRange !== "all" && now !== null) {
      const cutoff = now - Number(dateRange) * 24 * 60 * 60 * 1000;
      list = list.filter((m) => new Date(m.createdAt).getTime() >= cutoff);
    }

    return [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [messages, view, dateRange, sortOrder, now, appliedFrom, appliedTo]);

  const counts = useMemo(
    () => ({
      inbox: messages?.filter((m) => inView(m, "inbox")).length ?? 0,
      unread: messages?.filter((m) => inView(m, "unread")).length ?? 0,
      archived: messages?.filter((m) => inView(m, "archived")).length ?? 0,
    }),
    [messages]
  );
  const newCount = counts.unread;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Messages</h1>
      <p className="mt-1.5 text-sm font-light text-foreground/45">
        {newCount} new message{newCount === 1 ? "" : "s"} — submissions from the contact form.
      </p>

      <div className="mt-6 inline-flex rounded-full border border-foreground/15 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-light transition-colors",
              view === v.key
                ? "bg-accent-soft text-accent"
                : "text-foreground/55 hover:text-foreground/80"
            )}
          >
            {v.label}
            {counts[v.key] > 0 && <span className="ml-1.5 opacity-70">{counts[v.key]}</span>}
          </button>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <div className="flex gap-1.5">
          {DATE_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setDateRange(r.key);
                setNow(Date.now());
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-light transition-colors",
                dateRange === r.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-foreground/15 text-foreground/55 hover:bg-foreground/5"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div ref={customRef} className="relative">
          <button
            onClick={() => setShowCustom((v) => !v)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-light transition-colors",
              dateRange === "custom"
                ? "border-accent bg-accent-soft text-accent"
                : "border-foreground/15 text-foreground/55 hover:bg-foreground/5"
            )}
          >
            {dateRange === "custom" && (appliedFrom || appliedTo)
              ? `${appliedFrom || "…"} → ${appliedTo || "…"}`
              : "Custom range"}
          </button>

          {showCustom && (
            <div className="absolute top-full left-0 z-10 mt-2 w-64 rounded-2xl border border-foreground/10 bg-surface p-4 shadow-xl">
              <div className="space-y-3">
                <div>
                  <label className="text-[.66rem] font-light uppercase tracking-widest text-foreground/40">
                    From
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    max={customTo || undefined}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[.66rem] font-light uppercase tracking-widest text-foreground/40">
                    To
                  </label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom || undefined}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-between gap-2">
                <button
                  onClick={() => {
                    setCustomFrom("");
                    setCustomTo("");
                    setAppliedFrom("");
                    setAppliedTo("");
                    setDateRange("all");
                    setShowCustom(false);
                  }}
                  className="text-xs font-light text-foreground/45 hover:text-foreground/70"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setAppliedFrom(customFrom);
                    setAppliedTo(customTo);
                    setDateRange("custom");
                    setShowCustom(false);
                  }}
                  disabled={!customFrom && !customTo}
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground transition-opacity disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="rounded-full border border-foreground/15 bg-transparent px-4 py-2 text-xs font-light text-foreground/70 outline-none transition-colors hover:bg-foreground/5"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !messages && <p className="mt-6 text-foreground/40">Loading…</p>}
      {messages && filtered.length === 0 && (
        <p className="mt-6 text-foreground/40">
          {messages.length === 0
            ? "No messages yet."
            : view === "archived" && counts.archived === 0
              ? "No archived messages."
              : "No messages match these filters."}
        </p>
      )}

      <div className="mt-7 space-y-3.5">
        {filtered.map((m) => {
          const busy = pendingId === m._id;
          return (
            <div
              key={m._id}
              className={cn(
                "rounded-2xl border border-foreground/10 p-5 sm:p-6",
                isUnread(m) ? "bg-accent-soft" : "bg-surface"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    {isUnread(m) && (
                      <span className="size-2 flex-none rounded-full bg-accent" aria-label="Unread" />
                    )}
                    {m.name}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                    <a href={`mailto:${m.email}`} className="break-all text-accent">
                      {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="text-accent">
                        {m.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-xs font-light text-foreground/40">
                  {formatDate(m.createdAt)}
                </span>
              </div>

              <p className="mt-3.5 whitespace-pre-wrap wrap-break-word text-sm font-light leading-relaxed text-foreground/55">
                {m.message}
              </p>

              {canUpdate && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-foreground/8 pt-3.5">
                {m.status === "NEW" && (
                  <button
                    onClick={() => changeStatus(m, "READ")}
                    disabled={busy}
                    className={cn(actionClass, "text-accent")}
                  >
                    Mark as read
                  </button>
                )}
                {m.status === "READ" && (
                  <button
                    onClick={() => changeStatus(m, "NEW")}
                    disabled={busy}
                    className={cn(actionClass, "text-foreground/55 hover:text-foreground")}
                  >
                    Mark as unread
                  </button>
                )}
                {m.status === "ARCHIVED" ? (
                  <button
                    onClick={() => changeStatus(m, "READ", "Moved back to inbox")}
                    disabled={busy}
                    className={cn(actionClass, "text-foreground/55 hover:text-foreground")}
                  >
                    Unarchive
                  </button>
                ) : (
                  <button
                    onClick={() => changeStatus(m, "ARCHIVED", "Message archived")}
                    disabled={busy}
                    className={cn(actionClass, "text-foreground/55 hover:text-foreground")}
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => handleDelete(m)}
                  disabled={busy}
                  className={cn(actionClass, "text-red-400 hover:text-red-300")}
                >
                  Delete
                </button>
              </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
