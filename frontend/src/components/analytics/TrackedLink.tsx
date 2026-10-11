"use client";

import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

type TrackedLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  trackAs: "LIVE_CLICK" | "GITHUB_CLICK";
  projectId: string;
};

// An outbound project link that records the click (left or middle button) as it opens.
export function TrackedLink({ trackAs, projectId, onClick, onAuxClick, ...props }: TrackedLinkProps) {
  const pathname = usePathname();

  function record() {
    track({ type: trackAs, path: pathname, projectId });
  }

  return (
    <a
      {...props}
      onClick={(e) => {
        record();
        onClick?.(e);
      }}
      onAuxClick={(e) => {
        if (e.button === 1) record();
        onAuxClick?.(e);
      }}
    />
  );
}
