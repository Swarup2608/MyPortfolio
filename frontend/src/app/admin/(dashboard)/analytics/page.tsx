"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/adminApi";
import type { PostListItem, PostListResponse } from "@/types/post";

const RANGES = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "all", label: "All time" },
] as const;

function publishedByMonth(posts: PostListItem[]) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
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
    label: m.label,
    h: Math.max(6, Math.round(((counts.get(m.key) ?? 0) / max) * 100)),
  }));
}

function BarChart({ bars, gradient }: { bars: { label: string; h: number }[]; gradient: string }) {
  return (
    <div className="flex h-38 items-end gap-1.5">
      {bars.map((b, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <div className="w-full rounded-t-md" style={{ height: `${b.h}%`, background: gradient }} />
          <div className="hidden text-[.6rem] font-light text-foreground/30 sm:block">{b.label}</div>
        </div>
      ))}
    </div>
  );
}

function ProgressPanel({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: string; pct: number }[];
}) {
  return (
    <div className="rounded-3xl border border-foreground/10 bg-surface p-6">
      <div className="mb-3.5 text-base font-semibold text-foreground">{title}</div>
      {rows.length === 0 && <p className="text-sm font-light text-foreground/35">No data yet.</p>}
      {rows.map((r) => (
        <div key={r.name} className="border-b border-foreground/5 py-2.5 last:border-b-0">
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate font-light text-foreground/85">{r.name}</span>
            <span className="flex-none font-light text-foreground/40">{r.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/8">
            <div
              className="h-full rounded-full"
              style={{ width: `${r.pct}%`, background: "linear-gradient(90deg,#B600A8,#BE4C00)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("all");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    adminFetch<PostListResponse>("/admin/posts?limit=200").then((data) => setPosts(data.posts));
  }, []);

  const scoped = useMemo(() => {
    if (!posts) return [];
    if (range === "all") return posts;
    if (now === null) return posts;
    const days = Number(range);
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return posts.filter((p) => p.publishedAt && new Date(p.publishedAt).getTime() >= cutoff);
  }, [posts, range, now]);

  const cards = useMemo(() => {
    const published = scoped.filter((p) => p.status === "published");
    const views = scoped.reduce((s, p) => s + (p.views ?? 0), 0);
    const avgReading = scoped.length
      ? Math.round(scoped.reduce((s, p) => s + p.readingTimeMinutes, 0) / scoped.length)
      : 0;
    return [
      { label: "Posts in range", value: scoped.length },
      { label: "Published", value: published.length },
      { label: "Total views", value: views },
      { label: "Avg. read time", value: `${avgReading} min` },
    ];
  }, [scoped]);

  const topByViews = useMemo(
    () => [...scoped].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 8),
    [scoped]
  );
  const viewsChart = useMemo(() => {
    const max = Math.max(1, ...topByViews.map((p) => p.views ?? 0));
    return topByViews.map((p) => ({
      label: p.title.slice(0, 8),
      h: Math.max(6, Math.round(((p.views ?? 0) / max) * 100)),
    }));
  }, [topByViews]);
  const monthChart = useMemo(() => publishedByMonth(posts ?? []), [posts]);

  const byTag = useMemo(() => {
    const counts = new Map<string, number>();
    scoped.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, value: String(count), pct: Math.round((count / max) * 100) }));
  }, [scoped]);

  const byStatus = useMemo(() => {
    const published = scoped.filter((p) => p.status === "published").length;
    const draft = scoped.filter((p) => p.status === "draft").length;
    const max = Math.max(1, published, draft);
    return [
      { name: "Published", value: String(published), pct: Math.round((published / max) * 100) },
      { name: "Draft", value: String(draft), pct: Math.round((draft / max) * 100) },
    ];
  }, [scoped]);

  const topViewsPanel = useMemo(() => {
    const max = Math.max(1, ...topByViews.map((p) => p.views ?? 0));
    return topByViews
      .slice(0, 5)
      .map((p) => ({ name: p.title, value: String(p.views ?? 0), pct: Math.round(((p.views ?? 0) / max) * 100) }));
  }, [topByViews]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setRange(r.key);
                setNow(Date.now());
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-light transition-colors",
                range === r.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-foreground/15 text-foreground/55 hover:bg-foreground/5"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!posts && <p className="mt-6 text-foreground/40">Loading…</p>}

      {posts && (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-foreground/10 bg-surface p-5">
                <div className="text-[.66rem] font-light uppercase tracking-widest text-foreground/40">
                  {c.label}
                </div>
                <div className="mt-2.5 text-xl font-bold text-foreground">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4.5 grid gap-4.5 lg:grid-cols-2">
            <div className="rounded-3xl border border-foreground/10 bg-surface p-6">
              <div className="mb-4.5 text-base font-semibold text-foreground">
                Posts published (12mo)
              </div>
              <BarChart bars={monthChart} gradient="linear-gradient(180deg,#B600A8,#7621B0)" />
            </div>
            <div className="rounded-3xl border border-foreground/10 bg-surface p-6">
              <div className="mb-4.5 text-base font-semibold text-foreground">Views by post</div>
              <BarChart bars={viewsChart} gradient="linear-gradient(180deg,#BE4C00,#7621B0)" />
            </div>
          </div>

          <div className="mt-4.5 grid gap-4.5 lg:grid-cols-3">
            <ProgressPanel title="Posts by tag" rows={byTag} />
            <ProgressPanel title="Posts by status" rows={byStatus} />
            <ProgressPanel title="Top posts by views" rows={topViewsPanel} />
          </div>
        </>
      )}
    </div>
  );
}
