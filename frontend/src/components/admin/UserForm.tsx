"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import type { AdminUser, UserRole } from "@/types/admin";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent";
const labelClass = "text-xs font-light uppercase tracking-widest text-foreground/40";
const cardClass = "rounded-3xl border border-foreground/10 bg-surface p-6";

export function UserForm({ user }: { user?: AdminUser }) {
  const router = useRouter();
  const isEdit = Boolean(user);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "VIEWER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEdit && user) {
        await adminFetch(`/admin/users/${user._id}`, {
          method: "PATCH",
          body: JSON.stringify({ name, email, role }),
        });
      } else {
        await adminFetch("/admin/users", {
          method: "POST",
          body: JSON.stringify({ name, email, password, role }),
        });
      }
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {isEdit ? "Edit user" : "New user"}
          </h1>
          <p className="mt-1.5 text-sm font-light text-foreground/40">
            {isEdit ? "Update this user's details." : "Invite a new admin, editor, or viewer."}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-5 text-sm text-red-400">{error}</p>}

      <div className={`${cardClass} mt-7 flex max-w-lg flex-col gap-5`}>
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>

        {!isEdit && (
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="role" className={labelClass}>
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={fieldClass}
          >
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
      </div>
    </form>
  );
}
