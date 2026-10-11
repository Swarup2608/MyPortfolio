"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserForm } from "@/components/admin/UserForm";
import { adminFetch } from "@/lib/adminApi";
import type { AdminUser } from "@/types/admin";

interface AdminUserResponse {
  success: true;
  data: AdminUser;
}

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<AdminUserResponse>(`/admin/users/${params.id}`)
      .then((data) => setUser(data.data))
      .catch(() => setError("User not found"));
  }, [params.id]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!user) return <p className="text-foreground/40">Loading…</p>;

  return <UserForm user={user} />;
}
