"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useDialog } from "@/components/ui/Dialog";
import type { Project, ProjectListResponse } from "@/types/project";

const statusColor = (status?: string) =>
  status === "PUBLISHED" ? "#4ade80" : "rgba(215,226,234,.5)";

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const dialog = useDialog();

  function load() {
    adminFetch<ProjectListResponse>("/admin/projects")
      .then((data) => setProjects(data.data))
      .catch(() => setError("Failed to load projects"));
  }

  useEffect(load, []);

  async function handleDelete(project: Project) {
    const deleted = await dialog.confirm({
      tone: "danger",
      title: "Delete this project?",
      message: (
        <>
          <span className="font-normal text-foreground/80">“{project.title}”</span> will be
          permanently removed. This cannot be undone.
        </>
      ),
      confirmText: "Delete",
      onConfirm: () => adminFetch(`/admin/projects/${project._id}`, { method: "DELETE" }),
    });
    if (!deleted) return;
    toast.success("Project deleted");
    load();
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

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !projects && <p className="mt-6 text-foreground/40">Loading…</p>}
      {projects && projects.length === 0 && (
        <p className="mt-6 text-foreground/40">No projects yet. Add your first one.</p>
      )}

      {projects && projects.length > 0 && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-foreground/10 bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-165 text-sm">
              <thead>
                <tr className="border-b border-foreground/8 text-left text-[.66rem] uppercase tracking-widest text-foreground/35">
                  <th className="px-5 py-3.5 font-light">Order</th>
                  <th className="px-5 py-3.5 font-light">Title</th>
                  <th className="px-5 py-3.5 font-light">Technologies</th>
                  <th className="px-5 py-3.5 font-light">Status</th>
                  <th className="px-5 py-3.5 font-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project._id}
                    className="border-b border-foreground/5 transition-colors last:border-b-0 hover:bg-foreground/2"
                  >
                    <td className="px-5 py-3.5 text-foreground/40">{project.displayOrder}</td>
                    <td className="px-5 py-3.5 font-normal text-foreground">{project.title}</td>
                    <td className="px-5 py-3.5 text-foreground/40">
                      {project.technologies.slice(0, 3).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-normal"
                        style={{ color: statusColor(project.status) }}
                      >
                        {project.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-3.5 text-xs">
                        {(project.liveUrl || project.githubUrl) && (
                          <a
                            href={project.liveUrl || project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground/55 hover:text-foreground"
                          >
                            {project.liveUrl ? "Live" : "Source"}
                          </a>
                        )}
                        <Link href={`/admin/projects/${project._id}/edit`} className="text-accent">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(project)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
