"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminProject, AdminProjectStatus } from "@/types/admin";

interface AdminProjectsResponse {
  success: true;
  data: AdminProject[];
}

const statusColor = (status: AdminProjectStatus) =>
  status === "PUBLISHED" ? "#4ade80" : status === "ARCHIVED" ? "rgba(215,226,234,.3)" : "rgba(215,226,234,.5)";

const STATUS_FILTERS: { key: "ALL" | AdminProjectStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "PUBLISHED", label: "Published" },
  { key: "ARCHIVED", label: "Archived" },
];

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminProjectStatus>("ALL");
  const [pendingDelete, setPendingDelete] = useState<AdminProject | null>(null);
  const canRead = usePermission(PERMISSIONS.PROJECTS_READ);
  const canDelete = usePermission(PERMISSIONS.PROJECTS_DELETE);

  function load() {
    adminFetch<AdminProjectsResponse>("/admin/projects")
      .then((data) => setProjects(data.data))
      .catch(() => setError("Failed to load projects"));
  }

  useEffect(() => {
    if (canRead) load();
  }, [canRead]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const query = search.trim().toLowerCase();
    return projects
      .filter((project) => {
        const matchesSearch =
          !query ||
          project.title.toLowerCase().includes(query) ||
          project.shortDescription.toLowerCase().includes(query) ||
          project.technologies.some((t) => t.toLowerCase().includes(query));
        const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [projects, search, statusFilter]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await adminFetch(`/admin/projects/${pendingDelete._id}`, { method: "DELETE" });
      setPendingDelete(null);
      load();
      toast.success("Project deleted.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete project");
    }
  }

  if (!canRead) {
    return <p className="text-foreground/40">You don&apos;t have access to this section.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">All projects</h1>
        <Link
          href="/admin/projects/new"
          className="gradient-cta rounded-full px-5.5 py-2.5 text-xs font-medium uppercase tracking-widest text-white"
        >
          + New project
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="rounded-full border border-foreground/15 bg-transparent px-4 py-2 text-xs font-light text-foreground outline-none transition-colors focus:border-accent"
        />
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-light transition-colors",
                statusFilter === f.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-foreground/15 text-foreground/55 hover:bg-foreground/5"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !projects && <p className="mt-6 text-foreground/40">Loading…</p>}
      {projects && projects.length > 0 && filteredProjects.length === 0 && (
        <p className="mt-6 text-foreground/40">No projects match these filters.</p>
      )}
      {projects && projects.length === 0 && (
        <p className="mt-6 text-foreground/40">No projects yet. Create your first one.</p>
      )}

      {filteredProjects.length > 0 && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-foreground/10 bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-165 text-sm">
              <thead>
                <tr className="border-b border-foreground/8 text-left text-[.66rem] uppercase tracking-widest text-foreground/35">
                  <th className="px-5 py-3.5 font-light">Order</th>
                  <th className="px-5 py-3.5 font-light">Title</th>
                  <th className="px-5 py-3.5 font-light">Category</th>
                  <th className="px-5 py-3.5 font-light">Status</th>
                  <th className="px-5 py-3.5 font-light">Featured</th>
                  <th className="px-5 py-3.5 font-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project._id}
                    className="border-b border-foreground/5 transition-colors last:border-b-0 hover:bg-foreground/2"
                  >
                    <td className="px-5 py-3.5 text-foreground/40">{project.displayOrder}</td>
                    <td className="px-5 py-3.5 font-normal text-foreground">{project.title}</td>
                    <td className="px-5 py-3.5 text-foreground/40">{project.category || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-normal" style={{ color: statusColor(project.status) }}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground/40">{project.featured ? "Yes" : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5 text-xs">
                        <Link
                          href={`/admin/projects/${project._id}/edit`}
                          className="flex items-center gap-1 text-accent"
                        >
                          <Pencil size={14} /> Edit
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => setPendingDelete(project)}
                            className="flex items-center gap-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this project?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.` : undefined}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
