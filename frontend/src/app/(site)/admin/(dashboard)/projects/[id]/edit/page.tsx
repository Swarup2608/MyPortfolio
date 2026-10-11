"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { adminFetch } from "@/lib/adminApi";
import type { AdminProject } from "@/types/admin";

interface AdminProjectResponse {
  success: true;
  data: AdminProject;
}

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<AdminProjectResponse>(`/admin/projects/${params.id}`)
      .then((data) => setProject(data.data))
      .catch(() => setError("Project not found"));
  }, [params.id]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!project) return <p className="text-foreground/40">Loading…</p>;

  return <ProjectForm project={project} />;
}
