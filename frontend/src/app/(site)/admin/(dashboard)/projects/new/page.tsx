"use client";

import { ProjectForm } from "@/components/admin/ProjectForm";
import { NoPermission } from "@/components/admin/NoPermission";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";

export default function NewProjectPage() {
  const canCreate = usePermission(PERMISSIONS.PROJECTS_CREATE);

  if (!canCreate) return <NoPermission section="creating projects" />;

  return <ProjectForm />;
}
