"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

// Routes this generic tracker must stay out of:
//  - /admin/*     — the root layout also wraps the CMS, and admin usage is
//                    the site owner operating the tool, not visitor traffic.
//  - /blog/[slug] — has its own BlogViewTracker that attaches postId; firing
//                    both here would double-count the view (see BlogViewTracker).
function isExcludedPath(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (/^\/blog\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || isExcludedPath(pathname)) return;

    void trackPageView({ path: pathname }).catch(() => {
      // Analytics must never break the website.
    });
  }, [pathname]);

  return null;
}
