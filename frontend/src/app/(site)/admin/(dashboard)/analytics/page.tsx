"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format-number";
import { adminFetch } from "@/lib/adminApi";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AnalyticsDashboard, AnalyticsRange } from "@/types/admin";

interface AnalyticsResponse {
  success: true;
  data: AnalyticsDashboard;
}

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "1y", label: "1 year" },
];

function formatGrowth(growth: number) {
  const rounded = Math.round(growth);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function TrafficChart({ daily }: { daily: AnalyticsDashboard["daily"] }) {
  const chartData = daily.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Views: d.views,
    Visitors: d.uniqueVisitors,
  }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(215,226,234,.08)" />
          <XAxis dataKey="label" stroke="rgba(215,226,234,.35)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(215,226,234,.35)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#161616",
              border: "1px solid rgba(215,226,234,.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "rgba(215,226,234,.6)" }}
          />
          <Line type="monotone" dataKey="Views" stroke="#B600A8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Visitors" stroke="#BE4C00" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
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

function PopularPosts({ posts }: { posts: AnalyticsDashboard["popularPosts"] }) {
  const max = Math.max(1, ...posts.map((p) => p.views));
  return (
    <div className="rounded-3xl border border-foreground/10 bg-surface p-6">
      <div className="mb-3.5 text-base font-semibold text-foreground">Popular posts</div>
      {posts.length === 0 && <p className="text-sm font-light text-foreground/35">No data yet.</p>}
      {posts.map((p) => (
        <Link
          key={p.postId}
          href={`/admin/posts/${p.postId}/edit`}
          className="block border-b border-foreground/5 py-2.5 last:border-b-0"
        >
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate font-light text-foreground/85 hover:text-accent">{p.title}</span>
            <span className="flex-none font-light text-foreground/40">{formatNumber(p.views)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/8">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.round((p.views / max) * 100)}%`, background: "linear-gradient(90deg,#B600A8,#BE4C00)" }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}

function toRows(items: { name: string; views: number }[]) {
  const max = Math.max(1, ...items.map((i) => i.views));
  return items.map((i) => ({ name: i.name, value: formatNumber(i.views), pct: Math.round((i.views / max) * 100) }));
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const canRead = usePermission(PERMISSIONS.ANALYTICS_READ);

  useEffect(() => {
    if (!canRead) return;
    setData(null);
    setError("");
    adminFetch<AnalyticsResponse>(`/admin/analytics/dashboard?range=${range}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load analytics"));
  }, [canRead, range, reloadToken]);

  if (!canRead) {
    return <p className="text-foreground/40">You don&apos;t have access to this section.</p>;
  }

  const cards = data
    ? [
        {
          label: "Total views",
          value: formatNumber(data.overview.totalViews.value),
          growth: data.overview.totalViews.growth,
        },
        {
          label: "Unique visitors",
          value: formatNumber(data.overview.uniqueVisitors.value),
          growth: data.overview.uniqueVisitors.growth,
        },
        {
          label: "Sessions",
          value: formatNumber(data.overview.uniqueSessions.value),
          growth: data.overview.uniqueSessions.growth,
        },
        { label: "Avg. pages / session", value: data.overview.averagePagesPerSession.toFixed(1) },
        { label: "Bounce rate", value: `${Math.round(data.overview.bounceRate)}%` },
      ]
    : [];

  const popularPages = data ? toRows(data.popularPages.map((p) => ({ name: p.path, views: p.views }))) : [];
  const devices = data ? toRows(data.devices.map((d) => ({ name: d.deviceType, views: d.views }))) : [];
  const referrers = data ? toRows(data.referrers.map((r) => ({ name: r.referrer, views: r.views }))) : [];

  const hasAnyData = data ? data.overview.totalViews.value > 0 || data.daily.length > 0 : false;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
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

      {error && (
        <div className="mt-6 flex items-center gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setReloadToken((t) => t + 1)}
            className="text-xs font-medium uppercase tracking-widest text-accent"
          >
            Retry
          </button>
        </div>
      )}
      {!error && !data && <p className="mt-6 text-foreground/40">Loading…</p>}

      {data && !hasAnyData && (
        <div className="mt-7 rounded-3xl border border-foreground/10 bg-surface p-8 text-center">
          <p className="text-sm font-light text-foreground/55">No analytics data yet.</p>
          <p className="mt-1.5 text-xs font-light text-foreground/35">
            Once visitors start interacting with your portfolio, traffic data will appear here.
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3.5 lg:grid-cols-5">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-foreground/10 bg-surface p-5">
                <div className="text-[.66rem] font-light uppercase tracking-widest text-foreground/40">
                  {c.label}
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground">{c.value}</span>
                  {"growth" in c && c.growth !== undefined && (
                    <span
                      className="text-xs font-light"
                      style={{ color: c.growth >= 0 ? "#4ade80" : "#f87171" }}
                    >
                      {formatGrowth(c.growth)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4.5 rounded-3xl border border-foreground/10 bg-surface p-6">
            <div className="mb-4.5 text-base font-semibold text-foreground">Views over time</div>
            <TrafficChart daily={data.daily} />
          </div>

          <div className="mt-4.5 grid gap-4.5 lg:grid-cols-2">
            <ProgressPanel title="Popular pages" rows={popularPages} />
            <PopularPosts posts={data.popularPosts} />
          </div>

          <div className="mt-4.5 grid gap-4.5 lg:grid-cols-2">
            <ProgressPanel title="Devices" rows={devices} />
            <ProgressPanel title="Top referrers" rows={referrers} />
          </div>
        </>
      )}
    </div>
  );
}
