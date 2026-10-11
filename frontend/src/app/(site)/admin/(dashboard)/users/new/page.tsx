"use client";

import { UserForm } from "@/components/admin/UserForm";
import { NoPermission } from "@/components/admin/NoPermission";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";

export default function NewUserPage() {
  const canCreate = usePermission(PERMISSIONS.USERS_CREATE);

  if (!canCreate) return <NoPermission section="creating users" />;

  return <UserForm />;
}
