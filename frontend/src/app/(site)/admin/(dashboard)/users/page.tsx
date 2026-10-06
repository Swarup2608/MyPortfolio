"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { KeyRound, Pencil, Power, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { usePermission } from "@/hooks/usePermission";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { PERMISSIONS } from "@/lib/permissions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SetPasswordDialog } from "@/components/admin/SetPasswordDialog";
import type { AdminUser } from "@/types/admin";

interface AdminUsersResponse {
  success: true;
  data: AdminUser[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const canRead = usePermission(PERMISSIONS.USERS_READ);
  const canUpdate = usePermission(PERMISSIONS.USERS_UPDATE);
  const canCreate = usePermission(PERMISSIONS.USERS_CREATE);
  const canDelete = usePermission(PERMISSIONS.USERS_DELETE);
  const { user: currentUser } = useAdminAuth();
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);

  function load() {
    adminFetch<AdminUsersResponse>("/admin/users")
      .then((data) => setUsers(data.data))
      .catch(() => setError("Failed to load users"));
  }

  useEffect(() => {
    if (canRead) load();
  }, [canRead]);

  async function toggleStatus(u: AdminUser) {
    try {
      await adminFetch(`/admin/users/${u._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  async function submitPassword(password: string) {
    if (!passwordTarget) return;
    try {
      await adminFetch(`/admin/users/${passwordTarget._id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password }),
      });
      setPasswordTarget(null);
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update password");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await adminFetch(`/admin/users/${pendingDelete._id}`, { method: "DELETE" });
      setPendingDelete(null);
      load();
      toast.success("User deleted.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete user");
    }
  }

  if (!canRead) {
    return <p className="text-foreground/40">You don&apos;t have access to this section.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Users</h1>
        {canCreate && (
          <Link
            href="/admin/users/new"
            className="gradient-cta rounded-full px-5.5 py-2.5 text-xs font-medium uppercase tracking-widest text-white"
          >
            + New user
          </Link>
        )}
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !users && <p className="mt-6 text-foreground/40">Loading…</p>}

      {users && users.length > 0 && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-foreground/10 bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-165 text-sm">
              <thead>
                <tr className="border-b border-foreground/8 text-left text-[.66rem] uppercase tracking-widest text-foreground/35">
                  <th className="px-5 py-3.5 font-light">Name</th>
                  <th className="px-5 py-3.5 font-light">Email</th>
                  <th className="px-5 py-3.5 font-light">Role</th>
                  <th className="px-5 py-3.5 font-light">Status</th>
                  <th className="px-5 py-3.5 font-light">Last login</th>
                  <th className="px-5 py-3.5 font-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-foreground/5 transition-colors last:border-b-0 hover:bg-foreground/2"
                  >
                    <td className="px-5 py-3.5 font-normal text-foreground">{u.name}</td>
                    <td className="px-5 py-3.5 text-foreground/40">{u.email}</td>
                    <td className="px-5 py-3.5 text-foreground/40">{u.role}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-normal"
                        style={{ color: u.isActive ? "#4ade80" : "rgba(248,113,113,.8)" }}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground/40">
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5 text-xs">
                        {canUpdate && (
                          <Link
                            href={`/admin/users/${u._id}/edit`}
                            className="flex items-center gap-1 text-accent"
                          >
                            <Pencil size={14} /> Edit
                          </Link>
                        )}
                        {canUpdate && (
                          <button
                            onClick={() => setPasswordTarget(u)}
                            className="flex items-center gap-1 text-foreground/55 hover:text-foreground"
                          >
                            <KeyRound size={14} /> Set password
                          </button>
                        )}
                        {canUpdate && u._id !== currentUser?.id && (
                          <button
                            onClick={() => toggleStatus(u)}
                            className={cn(
                              "flex items-center gap-1",
                              u.isActive ? "text-red-400 hover:text-red-300" : "text-accent"
                            )}
                          >
                            <Power size={14} /> {u.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                        )}
                        {canDelete && u._id !== currentUser?.id && (
                          <button
                            onClick={() => setPendingDelete(u)}
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
        title="Delete this user?"
        description={pendingDelete ? `${pendingDelete.name} will be permanently removed. This cannot be undone.` : undefined}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <SetPasswordDialog
        open={!!passwordTarget}
        userName={passwordTarget?.name}
        onSubmit={submitPassword}
        onCancel={() => setPasswordTarget(null)}
      />
    </div>
  );
}
