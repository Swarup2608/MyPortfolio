"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { adminFetch } from "@/lib/adminApi";
import { PERMISSIONS, hasPermission, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { AdminContact } from "@/types/admin";

const links: { href: string; label: string; icon: string; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: "▤", permission: PERMISSIONS.DASHBOARD_READ },
  { href: "/admin/analytics", label: "Analytics", icon: "◔", permission: PERMISSIONS.ANALYTICS_READ },
  { href: "/admin/posts", label: "All posts", icon: "☰", permission: PERMISSIONS.POSTS_READ },
  { href: "/admin/projects", label: "Projects", icon: "◱", permission: PERMISSIONS.PROJECTS_READ },
  { href: "/admin/messages", label: "Messages", icon: "✉", permission: PERMISSIONS.CONTACTS_READ },
  { href: "/admin/users", label: "Users", icon: "☺", permission: PERMISSIONS.USERS_READ },
  { href: "/admin/audit-logs", label: "Audit logs", icon: "≡", permission: PERMISSIONS.AUDIT_LOG_READ },
];

export function AdminNav() {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const visibleLinks = user ? links.filter((link) => hasPermission(user.role, link.permission)) : [];
  const canReadContacts = user ? hasPermission(user.role, PERMISSIONS.CONTACTS_READ) : false;

  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    if (!canReadContacts) return;
    adminFetch<{ success: true; data: AdminContact[] }>("/admin/contact")
      .then((data) => setNewMessageCount(data.data.filter((m) => m.status === "NEW").length))
      .catch(() => {});
  }, [canReadContacts]);

  return (
    <aside className="flex h-screen w-59 flex-none flex-col gap-1 overflow-y-auto border-r border-foreground/10 bg-[#0a0a0a] p-4">
      <div className="px-2.5 pb-5 pt-1.5 text-xl font-black uppercase tracking-wide text-foreground">
        {(user?.name || "Admin").split(" ")[0]}
        <span className="text-accent">.</span>
        <span className="ml-1.5 text-xs font-light normal-case tracking-normal text-foreground/35">
          admin
        </span>
      </div>

      {visibleLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
              active
                ? "bg-accent-soft text-accent"
                : "text-foreground/75 hover:bg-foreground/5"
            )}
          >
            <span className="w-4 flex-none text-center opacity-80">{link.icon}</span>
            {link.label}
            {link.href === "/admin/messages" && newMessageCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[.66rem] font-medium text-accent-foreground">
                {newMessageCount}
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-auto border-t border-foreground/10 pt-3.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="h-8 w-8 flex-none rounded-full"
            style={{ background: "linear-gradient(123deg, #B600A8, #BE4C00)" }}
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {user?.name || "Admin"}
            </div>
            <div className="text-xs font-light text-foreground/35">Owner</div>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-light text-foreground/55 transition-colors hover:bg-foreground/5"
        >
          ↩ Logout
        </button>
        <Link
          href="/"
          className="block rounded-xl px-3.5 py-2.5 text-sm font-light text-foreground/55 transition-colors hover:bg-foreground/5"
        >
          ↗ View site
        </Link>
      </div>
    </aside>
  );
}
