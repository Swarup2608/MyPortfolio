"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { NoPermission } from "@/components/admin/NoPermission";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AdminProject } from "@/types/admin";

interface AdminProjectResponse {
  success: true;
  data: AdminProject;
}

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const canUpdate = usePermission(PERMISSIONS.PROJECTS_UPDATE);
  const [project, setProject] = useState<AdminProject | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!canUpdate) return;
    adminFetch<AdminProjectResponse>(`/admin/projects/${params.id}`)
      .then((data) => setProject(data.data))
      .catch((err) => setErrorStatus(err instanceof ApiError ? err.status : 0));
  }, [params.id, canUpdate]);

  if (!canUpdate || errorStatus === 403) return <NoPermission section="editing projects" />;
  // The API answers 404 for an unknown id and 400 for a malformed one.
  if (errorStatus === 404 || errorStatus === 400) notFound();
  if (errorStatus !== null) return <p className="text-sm text-red-400">Failed to load project</p>;
  if (!project) return <p className="text-foreground/40">Loading…</p>;

  return <ProjectForm project={project} />;
}
