"use client";

import { API_URL, ApiError } from "./api";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Fetches a CSRF cookie (backend sets a non-httpOnly `csrf_token` cookie) if
// we don't already have one, so mutating requests can echo it back as a header.
// Concurrent callers share the same in-flight request instead of each firing
// their own GET /csrf/token.
let csrfRequest: Promise<string | null> | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  const existing = getCookie("csrf_token");
  if (existing) return existing;

  if (csrfRequest) return csrfRequest;

  csrfRequest = fetch(`${API_URL}/csrf/token`, {
    credentials: "include",
    cache: "no-store",
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return data?.csrfToken ?? getCookie("csrf_token");
    })
    .finally(() => {
      csrfRequest = null;
    });

  return csrfRequest;
}

function buildRequest(init: RequestInit, method: string, csrfToken: string | null): RequestInit {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  return { ...init, method, headers, credentials: "include" };
}

// Client-only fetch wrapper for the admin API: always sends the auth cookie
// and, for mutating requests, echoes the CSRF cookie in a header (double-submit).
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const isMutating = MUTATING_METHODS.has(method);

  const csrfToken = isMutating ? await ensureCsrfToken() : null;
  let res = await fetch(`${API_URL}${path}`, buildRequest(init, method, csrfToken));

  // The CSRF token may have expired or mismatched — clear it, fetch a fresh
  // one, and retry exactly once. Never retry more than once: a broken API
  // returning 403 forever must not turn into a retry loop.
  if (res.status === 403 && isMutating && csrfToken) {
    document.cookie = "csrf_token=; Max-Age=0; path=/";
    const freshToken = await ensureCsrfToken();
    if (freshToken && freshToken !== csrfToken) {
      res = await fetch(`${API_URL}${path}`, buildRequest(init, method, freshToken));
    }
  }

  // A 401 on an already-authenticated call means the session expired mid-use
  // (the JWT cookie is gone/invalid) — send the admin back to log in. Login
  // itself is excluded since a failed login attempt is an expected 401 that
  // the login page already shows inline, not a session expiry.
  if (res.status === 401 && !path.startsWith("/auth/login") && typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || "Request failed");
  }

  return data as T;
}
