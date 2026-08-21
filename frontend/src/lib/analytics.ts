import { publicFetch } from "@/lib/api";

const VISITOR_ID_KEY = "portfolio_visitor_id";
const SESSION_ID_KEY = "portfolio_session_id";

function generateId(): string {
  return crypto.randomUUID();
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export interface TrackPageViewInput {
  path: string;
  postId?: string;
}

// Fire-and-forget: analytics must never break the site, so callers should
// swallow rejections (both trackers below already do via .catch(() => {})).
export async function trackPageView({ path, postId }: TrackPageViewInput) {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const referrer = document.referrer || undefined;

  return publicFetch("/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, visitorId, sessionId, referrer, postId }),
  });
}
