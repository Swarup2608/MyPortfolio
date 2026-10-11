"use client";

import { TrafficOverview } from "@/components/admin/TrafficOverview";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";

export default function AnalyticsPage() {
  const canRead = usePermission(PERMISSIONS.ANALYTICS_READ);

  if (!canRead) {
    return <p className="text-foreground/40">You don&apos;t have access to this section.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
      <p className="mt-1.5 text-sm font-light text-foreground/45">
        Page views, visitors and project link clicks across the site.
      </p>
      <TrafficOverview />
    </div>
  );
}
