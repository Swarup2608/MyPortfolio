"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

let lastTracked = { path: "", at: 0 };

// Records one page view per navigation. Admin pages aren't counted.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;
    // Strict Mode runs effects twice in development; don't count that as two views.
    const now = Date.now();
    if (lastTracked.path === pathname && now - lastTracked.at < 1000) return;
    lastTracked = { path: pathname, at: now };
    track({ type: "PAGE_VIEW", path: pathname });
  }, [pathname]);

  return null;
}
