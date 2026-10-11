"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/adminApi";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AuditLogEntry, AuditLogPagination } from "@/types/admin";

interface AuditLogsResponse {
  success: true;
  data: { logs: AuditLogEntry[]; pagination: AuditLogPagination };
}

const actionColor: Record<string, string> = {
  CREATE: "#4ade80",
  UPDATE: "#60a5fa",
  DELETE: "#f87171",
  PUBLISH: "#4ade80",
  LOGIN: "rgba(215,226,234,.5)",
  LOGOUT: "rgba(215,226,234,.5)",
  STATUS_CHANGE: "#facc15",
  PASSWORD_CHANGE: "#facc15",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);
  const [pagination, setPagination] = useState<AuditLogPagination | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const canRead = usePermission(PERMISSIONS.AUDIT_LOG_READ);

  useEffect(() => {
    if (!canRead) return;
    adminFetch<AuditLogsResponse>(`/admin/audit-logs?page=${page}&limit=20`)
      .then((data) => {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      })
      .catch(() => setError("Failed to load audit logs"));
  }, [canRead, page]);

  if (!canRead) {
    return <p className="text-foreground/40">You don&apos;t have access to this section.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Audit logs</h1>
      <p className="mt-1.5 text-sm font-light text-foreground/45">
        A record of every change made across the CMS.
      </p>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !logs && <p className="mt-6 text-foreground/40">Loading…</p>}
      {logs && logs.length === 0 && <p className="mt-6 text-foreground/40">No activity yet.</p>}

      {logs && logs.length > 0 && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-foreground/10 bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-165 text-sm">
              <thead>
                <tr className="border-b border-foreground/8 text-left text-[.66rem] uppercase tracking-widest text-foreground/35">
                  <th className="px-5 py-3.5 font-light">When</th>
                  <th className="px-5 py-3.5 font-light">User</th>
                  <th className="px-5 py-3.5 font-light">Action</th>
                  <th className="px-5 py-3.5 font-light">Resource</th>
                  <th className="px-5 py-3.5 font-light">Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-foreground/5 transition-colors last:border-b-0 hover:bg-foreground/2"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-foreground/40">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-foreground">{log.userName ?? log.userEmail ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-normal"
                        style={{ color: actionColor[log.action] ?? "rgba(215,226,234,.5)" }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground/40">{log.resource}</td>
                    <td className="px-5 py-3.5 text-foreground/70">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={
                p === pagination.page
                  ? "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white gradient-cta"
                  : "flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 text-sm font-medium text-foreground/60 hover:bg-foreground/5"
              }
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
