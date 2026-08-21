"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/adminApi";
import type { AdminPost, AdminContact } from "@/types/admin";

const statusColor = (status?: string) =>
  status === "PUBLISHED" ? "#4ade80" : "rgba(215,226,234,.5)";

// No visitor-tracking backend exists yet, so instead of fabricating traffic
// numbers we chart something real: how many posts were published each month.
function publishedByMonth(posts: AdminPost[]) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-US", { month: "short" }) });
  }
  const counts = new Map(months.map((m) => [m.key, 0]));
  posts.forEach((p) => {
    if (!p.publishedAt) return;
    const d = new Date(p.publishedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const max = Math.max(1, ...counts.values());
  return months.map((m) => ({
    day: m.label,
    h: Math.max(6, Math.round(((counts.get(m.key) ?? 0) / max) * 100)),
  }));
}

interface AdminPostsResponse {
  success: true;
  data: AdminPost[];
}

interface AdminContactsResponse {
  success: true;
  data: AdminContact[];
}

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<AdminPost[] | null>(null);
  const [messages, setMessages] = useState<AdminContact[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<AdminPostsResponse>("/admin/posts")
      .then((data) => setPosts(data.data))
      .catch(() => setError("Failed to load posts"));
    adminFetch<AdminContactsResponse>("/admin/contact")
      .then((data) => setMessages(data.data.slice(0, 5)))
      .catch(() => setMessages([]));
  }, []);

  const stats = useMemo(() => {
    if (!posts) return null;
    return {
      total: posts.length,
      published: posts.filter((p) => p.status === "PUBLISHED").length,
      draft: posts.filter((p) => p.status === "DRAFT").length,
      views: posts.reduce((sum, p) => sum + (p.viewCount ?? 0), 0),
      tags: new Set(posts.flatMap((p) => p.tags)).size,
    };
  }, [posts]);

  const topPosts = useMemo(
    () => (posts ? [...posts].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 5) : []),
    [posts]
  );
  const recentPosts = useMemo(
    () =>
      posts
        ? [...posts]
            .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
            .slice(0, 4)
        : [],
    [posts]
  );
  const chart = useMemo(() => publishedByMonth(posts ?? []), [posts]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
      <p className="mt-1.5 text-sm font-light text-foreground/45">
        Everything happening across the site.
      </p>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !stats && <p className="mt-6 text-foreground/40">Loading…</p>}

      {stats && (
        <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total posts", value: stats.total },
            { label: "Published", value: stats.published },
            { label: "Drafts", value: stats.draft },
            { label: "Total views", value: stats.views },
            { label: "Tags used", value: stats.tags },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-foreground/10 bg-surface p-5">
              <div className="text-[.68rem] font-light uppercase tracking-widest text-foreground/40">
                {c.label}
              </div>
              <div className="mt-2.5 text-2xl font-bold text-foreground">{c.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-3xl border border-foreground/10 bg-surface p-6">
        <div className="mb-5 flex items-baseline justify-between">
          <div className="text-base font-semibold text-foreground">Posts published</div>
          <div className="text-xs font-light text-foreground/35">Last 12 months</div>
        </div>
        <div className="flex h-42 items-end gap-1.5 sm:gap-2.5">
          {chart.map((t, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className="w-full rounded-t-md"
                style={{ height: `${t.h}%`, background: "linear-gradient(180deg,#B600A8,#7621B0)" }}
              />
              <div className="text-[.62rem] font-light text-foreground/30">{t.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4.5 lg:grid-cols-3">
        <div className="rounded-3xl border border-foreground/10 bg-surface p-6">
          <div className="mb-3.5 text-base font-semibold text-foreground">Recent messages</div>
          {messages && messages.length === 0 && (
            <p className="text-sm font-light text-foreground/35">No messages yet.</p>
          )}
          {messages?.map((m) => (
            <div
              key={m._id}
              className="flex justify-between gap-3 border-b border-foreground/5 py-2.5 last:border-b-0"
            >
              <span className="truncate text-sm font-light text-foreground/85">{m.name}</span>
              <span className="flex-none text-xs font-light text-foreground/35">
                {formatDate(m.createdAt)}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-surface p-6">
          <div className="mb-3.5 text-base font-semibold text-foreground">Top posts by views</div>
          {topPosts.length === 0 && (
            <p className="text-sm font-light text-foreground/35">No posts yet.</p>
          )}
          {topPosts.map((p) => (
            <div
              key={p._id}
              className="flex justify-between gap-3 border-b border-foreground/5 py-2.5 last:border-b-0"
            >
              <span className="truncate text-sm font-light text-foreground/85">{p.title}</span>
              <span className="flex-none text-xs font-light text-foreground/35">{p.viewCount ?? 0}</span>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-surface p-6">
          <div className="mb-3.5 text-base font-semibold text-foreground">Recent posts</div>
          {recentPosts.map((p) => (
            <Link
              key={p._id}
              href={`/admin/posts/${p._id}/edit`}
              className="flex justify-between gap-3 border-b border-foreground/5 py-2.5 last:border-b-0"
            >
              <span className="truncate text-sm font-light text-foreground/85">{p.title}</span>
              <span className="flex-none text-xs" style={{ color: statusColor(p.status) }}>
                {p.status}
              </span>
            </Link>
          ))}
          <div className="mt-4 flex gap-2.5">
            <Link
              href="/admin/posts/new"
              className="rounded-full border border-accent/40 bg-accent-soft px-4 py-2.5 text-xs font-light text-foreground"
            >
              + New post
            </Link>
            <Link
              href="/admin/analytics"
              className="rounded-full border border-foreground/15 px-4 py-2.5 text-xs font-light text-foreground"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
