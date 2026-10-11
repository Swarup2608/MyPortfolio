"use client";

import { useAdminAuth } from "@/lib/adminAuthContext";
import { hasPermission, type Permission } from "@/lib/permissions";

export function usePermission(permission: Permission): boolean {
  const { user } = useAdminAuth();
  if (!user) return false;
  return hasPermission(user.role, permission);
}
