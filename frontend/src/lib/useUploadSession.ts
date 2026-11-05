"use client";

import { useCallback, useEffect, useRef } from "react";
import { adminFetch } from "./adminApi";

const MAX_KEYS_PER_REQUEST = 50;

// Remembers the images uploaded during one editing session, so the ones that never end up in a
// saved post can be deleted when the page is refreshed, closed or left. The server only deletes
// uploads that are still unsaved, so images a saved post uses are never affected. If this request
// is lost (crash, offline), the server's daily cleanup removes them anyway.
export function useUploadSession() {
  const keys = useRef(new Set<string>());

  const track = useCallback((key: string) => {
    keys.current.add(key);
  }, []);

  // Ask the server to drop everything tracked so far that is still unsaved. Safe to call any time,
  // e.g. right after a successful save to clear images that were removed from the content.
  const flush = useCallback(() => {
    const pending = [...keys.current];
    keys.current.clear();
    for (let i = 0; i < pending.length; i += MAX_KEYS_PER_REQUEST) {
      // keepalive lets the request outlive a page that is being closed or refreshed.
      adminFetch("/admin/media", {
        method: "DELETE",
        body: JSON.stringify({ keys: pending.slice(i, i + MAX_KEYS_PER_REQUEST) }),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    // persisted = the page is only entering the back/forward cache and may come back, so keep its uploads.
    const onPageHide = (event: PageTransitionEvent) => {
      if (!event.persisted) flush();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      flush(); // navigating away inside the app (back, cancel, another link)
    };
  }, [flush]);

  return { track, flush };
}
