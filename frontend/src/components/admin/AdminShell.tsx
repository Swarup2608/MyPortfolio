"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { useAdminAuth } from "@/lib/adminAuthContext";

const crumbs: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/posts": "All posts",
  "/admin/posts/new": "New post",
  "/admin/projects": "All projects",
  "/admin/projects/new": "New project",
  "/admin/projects": "All projects",
  "/admin/projects/new": "New project",
  "/admin/messages": "Messages",
  "/admin/users": "Users",
  "/admin/users/new": "New user",
  "/admin/audit-logs": "Audit logs",
};

function crumbFor(pathname: string) {
  if (crumbs[pathname]) return crumbs[pathname];
  if (pathname.endsWith("/edit")) {
    return pathname.startsWith("/admin/projects/") ? "Edit project" : "Edit post";
  }
  return "Admin";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setNavOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [navOpen]);

  if (loading) {
    return <div className="py-24 text-center text-foreground/40">Checking session…</div>;
  }

  if (!user) return null; // redirect to /admin/login already triggered

  return (
    <div className="flex min-h-screen">
      <AdminNav open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="min-w-0 flex-1 bg-background">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-foreground/10 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={navOpen}
              aria-controls="admin-nav"
              className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-foreground/20 text-foreground/75 lg:hidden"
            >
              <Menu className="size-4.5" aria-hidden="true" />
            </button>
            <span className="truncate text-sm font-light text-foreground/40">
              {crumbFor(pathname)}
            </span>
          </div>
          <div className="flex flex-none items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border border-foreground/12 px-3.5 py-1.5 text-xs font-light text-foreground/45 sm:inline-block">
              ⌘K
            </span>
            <Link
              href="/admin/posts/new"
              className="gradient-cta rounded-full px-3.5 py-2 text-xs font-medium uppercase tracking-widest text-white sm:px-4.5"
            >
              <span className="sm:hidden">+ Post</span>
              <span className="hidden sm:inline">New post</span>
            </Link>
            <Link
              href="/admin/projects/new"
              className="gradient-cta rounded-full px-3.5 py-2 text-xs font-medium uppercase tracking-widest text-white sm:px-4.5"
            >
              <span className="sm:hidden">+ Project</span>
              <span className="hidden sm:inline">New project</span>
            </Link>
          </div>
        </div>
        <main className="px-4 py-6 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
