"use client";

import { API_URL, ApiError } from "./api";

const CSRF_COOKIE = "csrf_token";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfTokenRequest: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${API_URL}/csrf/token`, { credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.csrfToken) {
    throw new ApiError(res.status, data?.message || "Could not get a CSRF token");
  }
  return data.csrfToken as string;
}

// The server sets the CSRF token as a cookie and also returns it from GET /csrf/token.
// When the API is on another domain its cookie can't be read here, so the token from
// the response is kept in memory instead (one shared request, so parallel calls agree).
function getCsrfToken(): Promise<string> {
  const fromCookie = getCookie(CSRF_COOKIE);
  if (fromCookie) return Promise.resolve(fromCookie);
  csrfTokenRequest ??= fetchCsrfToken().catch((err) => {
    csrfTokenRequest = null;
    throw err;
  });
  return csrfTokenRequest;
}

export function clearCsrfToken() {
  csrfTokenRequest = null;
}

// Client-only fetch wrapper for the admin API: always sends the auth cookie
// and, for mutating requests, echoes the CSRF token in a header (double-submit).
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (MUTATING_METHODS.has(method)) {
    headers.set("X-CSRF-Token", await getCsrfToken());
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || "Request failed");
  }

  return data as T;
}
