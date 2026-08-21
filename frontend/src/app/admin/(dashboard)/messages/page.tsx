"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AdminContact, ContactStatus } from "@/types/admin";

interface MessagesResponse {
  success: true;
  data: AdminContact[];
}

const DATE_RANGES = [
  { key: "all", label: "All time" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
] as const;

const STATUS_FILTERS: { key: "ALL" | ContactStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "READ", label: "Read" },
  { key: "ARCHIVED", label: "Archived" },
];

type DateRangeKey = (typeof DATE_RANGES)[number]["key"] | "custom";
type SortOrder = "newest" | "oldest";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<AdminContact[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ContactStatus>("ALL");
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
    adminFetch<MessagesResponse>("/admin/contact").then((data) =>
      setMessages(data.data)
    );
  }

  useEffect(load, []);

  // Opening/viewing a message isn't the same as acknowledging it, so status
  // only ever changes via an explicit action, never automatically.
  async function changeStatus(id: string, status: ContactStatus) {
    await adminFetch(`/admin/contact/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = useMemo(() => {
    if (!messages) return [];

    let list = messages;

    if (statusFilter !== "ALL") list = list.filter((m) => m.status === statusFilter);

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
  }, [messages, statusFilter, dateRange, sortOrder, now, appliedFrom, appliedTo]);

  const newCount = messages?.filter((m) => m.status === "NEW").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Messages</h1>
      <p className="mt-1.5 text-sm font-light text-foreground/45">
        {newCount} new message{newCount === 1 ? "" : "s"} — submissions from the contact form.
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

        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-light transition-colors",
                statusFilter === f.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-foreground/15 text-foreground/55 hover:bg-foreground/5"
              )}
            >
              {f.label}
            </button>
          ))}
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
              m.status === "NEW" ? "bg-accent-soft" : "bg-surface"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                {m.subject && <p className="text-sm font-medium text-foreground">{m.subject}</p>}
                <p className="font-medium text-foreground">{m.name}</p>
                <a href={`mailto:${m.email}`} className="text-sm text-accent">
                  {m.email}
                </a>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-light text-foreground/40">
                  {formatDate(m.createdAt)}
                </span>
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message"}`)}`}
                  className="text-xs font-medium uppercase tracking-widest text-foreground/55 hover:text-foreground"
                >
                  Reply
                </a>
                {canUpdate && (
                  <div className="flex items-center gap-3">
                    {m.status !== "READ" && (
                      <button
                        onClick={() => changeStatus(m._id, "READ")}
                        className="text-xs font-medium uppercase tracking-widest text-accent"
                      >
                        Mark read
                      </button>
                    )}
                    {m.status !== "ARCHIVED" && (
                      <button
                        onClick={() => changeStatus(m._id, "ARCHIVED")}
                        className="text-xs font-medium uppercase tracking-widest text-foreground/55 hover:text-foreground"
                      >
                        Archive
                      </button>
                    )}
                    {m.status !== "NEW" && (
                      <button
                        onClick={() => changeStatus(m._id, "NEW")}
                        className="text-xs font-medium uppercase tracking-widest text-foreground/55 hover:text-foreground"
                      >
                        Mark new
                      </button>
                    )}
                  </div>
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
