import type { ApiResponse } from "./api";

export type AnalyticsRange = "7" | "30" | "90" | "365";

export interface AnalyticsSummary {
  range: AnalyticsRange;
  bucket: "day" | "month";
  totals: {
    pageViews: number;
    visitors: number;
    liveClicks: number;
    githubClicks: number;
  };
  // One point per day (YYYY-MM-DD) or month (YYYY-MM), oldest first.
  series: { key: string; views: number; visitors: number }[];
  // First path segment: "" is the home page, "blog" covers /blog and /blog/:slug.
  sections: { section: string; views: number }[];
  pages: { path: string; views: number; visitors: number }[];
  projects: {
    projectId: string;
    title: string;
    slug: string | null;
    liveClicks: number;
    githubClicks: number;
  }[];
}

export type AnalyticsSummaryResponse = ApiResponse<AnalyticsSummary>;
