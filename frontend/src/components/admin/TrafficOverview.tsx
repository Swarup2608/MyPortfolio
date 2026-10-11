"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  AnalyticsRange,
  AnalyticsSummary,
  AnalyticsSummaryResponse,
} from "@/types/analytics";

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "365", label: "12 months" },
];

const SECTION_LABELS: Record<string, string> = {
  "": "Home",
  about: "About",
  blog: "Journal",
  projects: "Projects",
  "coming-soon": "Coming soon",
};

const BAR_GRADIENT = "linear-gradient(180deg,#B600A8,#7621B0)";
const METER_GRADIENT = "linear-gradient(90deg,#B600A8,#BE4C00)";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function sectionLabel(section: string) {
  return SECTION_LABELS[section] ?? `/${section}`;
}

function bucketLabel(key: string, bucket: AnalyticsSummary["bucket"], long = false) {
  const date = new Date(bucket === "month" ? `${key}-01T00:00:00` : `${key}T00:00:00`);
  if (bucket === "month") {
    return date.toLocaleDateString("en-US", long ? { month: "long", year: "numeric" } : { month: "short" });
  }
  return date.toLocaleDateString(
    "en-US",
    long ? { weekday: "short", month: "short", day: "numeric" } : { month: "short", day: "numeric" }
  );
}

// Rounds the axis top up to a clean 1 / 2 / 5 × 10ⁿ.
function niceMax(value: number) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

// Evenly spaced x-axis label positions, so 90 daily bars don't get 90 labels.
function labelIndexes(count: number) {
  if (count <= 7) return new Set(Array.from({ length: count }, (_, i) => i));
  const labels = 6;
  return new Set(
    Array.from({ length: labels }, (_, k) => Math.round((k * (count - 1)) / (labels - 1)))
  );
}

function ViewsChart({ summary }: { summary: AnalyticsSummary }) {
  const { series, bucket } = summary;
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...series.map((p) => p.views)));
  const labels = labelIndexes(series.length);
  const point = active !== null ? series[active] : undefined;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((i) => Math.min(series.length - 1, (i ?? -1) + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => Math.max(0, (i ?? series.length) - 1));
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  return (
    <div className="flex gap-2.5">
      <div
        className="relative h-44 w-7 flex-none text-right text-[.62rem] font-light tabular-nums text-foreground/35"
        aria-hidden="true"
      >
        {[1, 0.5, 0].map((f) => (
          <span
            key={f}
            className="absolute right-0 -translate-y-1/2"
            style={{ top: `${(1 - f) * 100}%` }}
          >
            {compact.format(max * f)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div
          role="group"
          tabIndex={0}
          aria-label="Page views over time. Use the left and right arrow keys to read each value."
          onKeyDown={handleKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
          className="relative h-44 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {[0, 0.5, 1].map((f) => (
            <div
              key={f}
              className={cn(
                "pointer-events-none absolute inset-x-0 border-t",
                f === 1 ? "border-foreground/15" : "border-foreground/6"
              )}
              style={{ top: `${f * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex gap-0.5">
            {series.map((p, i) => (
              <div
                key={p.key}
                onPointerEnter={() => setActive(i)}
                className="flex min-w-0 flex-1 items-end justify-center"
              >
                <div
                  className={cn(
                    "w-full max-w-6 rounded-t-[4px] transition-opacity",
                    active !== null && active !== i && "opacity-40"
                  )}
                  style={{ height: `${(p.views / max) * 100}%`, background: BAR_GRADIENT }}
                />
              </div>
            ))}
          </div>

          {point && active !== null && (
            <div
              className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-foreground/10 bg-background/95 px-3 py-2 shadow-xl"
              style={{
                left: `clamp(70px, ${((active + 0.5) / series.length) * 100}%, calc(100% - 70px))`,
              }}
            >
              <div className="text-sm font-semibold text-foreground">
                {point.views.toLocaleString()} {point.views === 1 ? "view" : "views"}
              </div>
              <div className="text-[.68rem] font-light text-foreground/45">
                {point.visitors.toLocaleString()} visitors · {bucketLabel(point.key, bucket, true)}
              </div>
            </div>
          )}
        </div>

        <div className="relative mt-2 h-4 text-[.6rem] font-light text-foreground/35" aria-hidden="true">
          {series.map(
            (p, i) =>
              labels.has(i) && (
                <span
                  key={p.key}
                  className="absolute -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${((i + 0.5) / series.length) * 100}%` }}
                >
                  {bucketLabel(p.key, bucket)}
                </span>
              )
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {point
            ? `${bucketLabel(point.key, bucket, true)}: ${point.views} views, ${point.visitors} visitors`
            : ""}
        </p>
      </div>
    </div>
  );
}

type MeterRow = { key: string; label: React.ReactNode; value: number; detail?: string };

function MeterList({ rows, empty }: { rows: MeterRow[]; empty: string }) {
  if (rows.length === 0) {
    return <p className="text-sm font-light text-foreground/35">{empty}</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <>
      {rows.map((r) => (
        <div key={r.key} className="border-b border-foreground/5 py-2.5 last:border-b-0">
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-light text-foreground/85">{r.label}</span>
            <span className="flex-none font-light tabular-nums text-foreground/40">
              {r.value.toLocaleString()}
              {r.detail && <span className="ml-1.5 text-foreground/30">{r.detail}</span>}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/8">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, background: METER_GRADIENT }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-foreground/10 bg-surface p-6">
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <div className="text-base font-semibold text-foreground">{title}</div>
        {aside && <div className="text-xs font-light text-foreground/35">{aside}</div>}
      </div>
      {children}
    </div>
  );
}

export function TrafficOverview() {
  const [range, setRange] = useState<AnalyticsRange>("30");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      range,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });

    adminFetch<AnalyticsSummaryResponse>(`/admin/analytics?${params}`)
      .then((data) => {
        if (cancelled) return;
        setSummary(data.data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load traffic");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  function selectRange(key: AnalyticsRange) {
    if (key === range) return;
    setRange(key);
    setLoading(true);
  }

  const totalViews = summary?.totals.pageViews ?? 0;

  return (
    <section className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Site traffic</h2>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => selectRange(r.key)}
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

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {!summary && !error && <p className="mt-4 text-foreground/40">Loading…</p>}

      {summary && (
        <div className={cn("transition-opacity", loading && "opacity-60")} aria-busy={loading}>
          <div className="mt-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {[
              { label: "Page views", value: summary.totals.pageViews },
              { label: "Visitors", value: summary.totals.visitors, hint: "unique per day" },
              { label: "Live clicks", value: summary.totals.liveClicks },
              { label: "GitHub clicks", value: summary.totals.githubClicks },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-foreground/10 bg-surface p-5">
                <div className="text-[.68rem] font-light uppercase tracking-widest text-foreground/40">
                  {c.label}
                </div>
                <div className="mt-2.5 text-2xl font-bold text-foreground">
                  {compact.format(c.value)}
                </div>
                {c.hint && (
                  <div className="mt-1 text-[.68rem] font-light text-foreground/30">{c.hint}</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4.5 rounded-3xl border border-foreground/10 bg-surface p-6">
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <div className="text-base font-semibold text-foreground">Page views</div>
              <div className="text-xs font-light text-foreground/35">
                {summary.bucket === "month" ? "Per month" : "Per day"}
              </div>
            </div>
            <ViewsChart key={summary.range} summary={summary} />
          </div>

          <div className="mt-4.5 grid gap-4.5 lg:grid-cols-3">
            <Panel title="Views by section">
              <MeterList
                empty="No page views yet."
                rows={summary.sections.map((s) => ({
                  key: s.section,
                  label: sectionLabel(s.section),
                  value: s.views,
                  detail: `${Math.round((s.views / Math.max(1, totalViews)) * 100)}%`,
                }))}
              />
            </Panel>

            <Panel title="Top pages" aside="views · visitors">
              <div className="max-h-96 overflow-y-auto pr-1">
                <MeterList
                  empty="No page views yet."
                  rows={summary.pages.map((p) => ({
                    key: p.path,
                    label: (
                      <a
                        href={p.path}
                        target="_blank"
                        rel="noreferrer"
                        title={p.path}
                        className="hover:text-foreground"
                      >
                        {p.path}
                      </a>
                    ),
                    value: p.views,
                    detail: `· ${p.visitors.toLocaleString()}`,
                  }))}
                />
              </div>
            </Panel>

            <Panel title="Project link clicks">
              {summary.projects.length === 0 ? (
                <p className="text-sm font-light text-foreground/35">No Live or GitHub clicks yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[.66rem] uppercase tracking-widest text-foreground/35">
                      <th className="pb-2 font-light">Project</th>
                      <th className="pb-2 text-right font-light">Live</th>
                      <th className="pb-2 pl-4 text-right font-light">GitHub</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.projects.map((p) => (
                      <tr key={p.projectId} className="border-t border-foreground/5">
                        <td className="max-w-0 truncate py-2.5 pr-3 font-light text-foreground/85">
                          {p.title}
                        </td>
                        <td className="py-2.5 text-right font-light tabular-nums text-foreground/60">
                          {p.liveClicks.toLocaleString()}
                        </td>
                        <td className="py-2.5 pl-4 text-right font-light tabular-nums text-foreground/60">
                          {p.githubClicks.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>
        </div>
      )}
    </section>
  );
}
