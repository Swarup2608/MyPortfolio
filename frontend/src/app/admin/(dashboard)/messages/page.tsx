"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/adminApi";
import { cn } from "@/lib/utils";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MessagesResponse {
  success: true;
  messages: ContactMessage[];
}

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
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeKey>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [now, setNow] = useState<number | null>(null);

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
    adminFetch<MessagesResponse>("/admin/contact?limit=50").then((data) =>
      setMessages(data.messages)
    );
  }

  useEffect(load, []);

  async function markRead(id: string) {
    await adminFetch(`/admin/contact/${id}/read`, { method: "PATCH" });
    load();
  }

  const filtered = useMemo(() => {
    if (!messages) return [];

    let list = messages;

    if (unreadOnly) list = list.filter((m) => !m.read);

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
  }, [messages, unreadOnly, dateRange, sortOrder, now, appliedFrom, appliedTo]);

  const unreadCount = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Messages</h1>
      <p className="mt-1.5 text-sm font-light text-foreground/45">
        Submissions from the contact form.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
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

        <button
          onClick={() => setUnreadOnly((v) => !v)}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-light transition-colors",
            unreadOnly
              ? "border-accent bg-accent-soft text-accent"
              : "border-foreground/15 text-foreground/55 hover:bg-foreground/5"
          )}
        >
          Unread only{unreadCount > 0 ? ` (${unreadCount})` : ""}
        </button>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="rounded-full border border-foreground/15 bg-transparent px-4 py-2 text-xs font-light text-foreground/70 outline-none transition-colors hover:bg-foreground/5"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {!messages && <p className="mt-6 text-foreground/40">Loading…</p>}
      {messages && filtered.length === 0 && (
        <p className="mt-6 text-foreground/40">
          {messages.length === 0 ? "No messages yet." : "No messages match these filters."}
        </p>
      )}

      <div className="mt-7 space-y-3.5">
        {filtered.map((m) => (
          <div
            key={m._id}
            className={cn(
              "rounded-2xl border border-foreground/10 p-6",
              m.read ? "bg-surface" : "bg-accent-soft"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{m.name}</p>
                <a href={`mailto:${m.email}`} className="text-sm text-accent">
                  {m.email}
                </a>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-light text-foreground/40">
                  {formatDate(m.createdAt)}
                </span>
                {!m.read && (
                  <button
                    onClick={() => markRead(m._id)}
                    className="text-xs font-medium uppercase tracking-widest text-accent"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3.5 whitespace-pre-wrap text-sm font-light leading-relaxed text-foreground/55">
              {m.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
