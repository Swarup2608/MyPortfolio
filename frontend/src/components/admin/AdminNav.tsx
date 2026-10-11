"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { adminFetch } from "@/lib/adminApi";
import { PERMISSIONS, hasPermission, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { AdminContact } from "@/types/admin";

const links: { href: string; label: string; icon: string; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: "▤", permission: PERMISSIONS.DASHBOARD_READ },
  { href: "/admin/analytics", label: "Analytics", icon: "◔", permission: PERMISSIONS.ANALYTICS_READ },
  { href: "/admin/posts", label: "All posts", icon: "☰", permission: PERMISSIONS.POSTS_READ },
  { href: "/admin/projects", label: "All projects", icon: "◫", permission: PERMISSIONS.PROJECTS_READ },
  { href: "/admin/messages", label: "Messages", icon: "✉", permission: PERMISSIONS.CONTACTS_READ },
  { href: "/admin/users", label: "Users", icon: "☺", permission: PERMISSIONS.USERS_READ },
  { href: "/admin/audit-logs", label: "Audit logs", icon: "≡", permission: PERMISSIONS.AUDIT_LOG_READ },
];

// Docked on large screens; below lg it's an off-canvas drawer opened from the top bar.
export function AdminNav({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        id="admin-nav"
        className={cn(
          "fixed top-0 left-0 z-50 flex h-dvh w-59 flex-none flex-col gap-1 overflow-y-auto overscroll-contain border-r border-foreground/10 bg-[#0a0a0a] p-4 transition-[translate,visibility] duration-300 ease-out",
          "lg:visible lg:sticky lg:z-auto lg:h-screen lg:translate-x-0",
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        )}
      >
        <div className="flex items-start justify-between gap-2 px-2.5 pb-5 pt-1.5">
          <div className="text-xl font-black uppercase tracking-wide text-foreground">
            {(user?.name || "Admin").split(" ")[0]}
            <span className="text-accent">.</span>
            <span className="ml-1.5 text-xs font-light normal-case tracking-normal text-foreground/35">
              admin
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="-mr-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg text-foreground/55 hover:bg-foreground/5 hover:text-foreground lg:hidden"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>

        {visibleLinks.map((link) => {
          const active = pathname === link.href;
          const badge = link.href === "/admin/messages" ? newMessageCount : 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-foreground/75 hover:bg-foreground/5"
              )}
            >
              <span className="w-4 flex-none text-center opacity-80">{link.icon}</span>
              {link.label}
              {badge > 0 && (
                <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[.7rem] font-medium text-white">
                  {badge}
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
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-light text-foreground/55 transition-colors hover:bg-foreground/5"
          >
            ↩ Logout
          </button>
          <Link
            href="/"
            onClick={onClose}
            className="block rounded-xl px-3.5 py-2.5 text-sm font-light text-foreground/55 transition-colors hover:bg-foreground/5"
          >
            ↗ View site
          </Link>
        </div>
      </aside>
    </>
  );
}
