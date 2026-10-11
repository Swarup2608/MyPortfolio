"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { UserForm } from "@/components/admin/UserForm";
import { NoPermission } from "@/components/admin/NoPermission";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AdminUser } from "@/types/admin";

interface AdminUserResponse {
  success: true;
  data: AdminUser;
}

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const canUpdate = usePermission(PERMISSIONS.USERS_UPDATE);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!canUpdate) return;
    adminFetch<AdminUserResponse>(`/admin/users/${params.id}`)
      .then((data) => setUser(data.data))
      .catch((err) => setErrorStatus(err instanceof ApiError ? err.status : 0));
  }, [params.id, canUpdate]);

  if (!canUpdate || errorStatus === 403) return <NoPermission section="editing users" />;
  // The API answers 404 for an unknown id and 400 for a malformed one.
  if (errorStatus === 404 || errorStatus === 400) notFound();
  if (errorStatus !== null) return <p className="text-sm text-red-400">Failed to load user</p>;
  if (!user) return <p className="text-foreground/40">Loading…</p>;

  return <UserForm user={user} />;
}
