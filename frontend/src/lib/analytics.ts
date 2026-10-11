import { API_URL } from "./api";

export type TrackedEvent =
  | { type: "PAGE_VIEW"; path: string }
  | { type: "LIVE_CLICK" | "GITHUB_CLICK"; path: string; projectId: string };

// Fire-and-forget: analytics must never break or slow down the page.
export function track(event: TrackedEvent) {
  fetch(`${API_URL}/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => {});
}
