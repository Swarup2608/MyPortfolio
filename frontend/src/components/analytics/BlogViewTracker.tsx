"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

interface BlogViewTrackerProps {
  postId: string;
}

// Used instead of (not alongside) the generic PageViewTracker on the blog
// detail page, so the postId-tagged view isn't double-counted.
export function BlogViewTracker({ postId }: BlogViewTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !postId) return;

    void trackPageView({ path: pathname, postId }).catch(() => {
      // Analytics must never break the website.
    });
  }, [pathname, postId]);

  return null;
}
