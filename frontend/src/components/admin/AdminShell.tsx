"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { useAdminAuth } from "@/lib/adminAuthContext";

const crumbs: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/posts": "All posts",
  "/admin/posts/new": "New post",
  "/admin/projects": "All projects",
  "/admin/projects/new": "New project",
  "/admin/messages": "Messages",
  "/admin/users": "Users",
  "/admin/users/new": "New user",
  "/admin/audit-logs": "Audit logs",
};

function crumbFor(pathname: string) {
  if (crumbs[pathname]) return crumbs[pathname];
  if (pathname.startsWith("/admin/projects/") && pathname.endsWith("/edit")) return "Edit project";
  if (pathname.startsWith("/admin/users/") && pathname.endsWith("/edit")) return "Edit user";
  if (pathname.endsWith("/edit")) return "Edit post";
  return "Admin";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="py-24 text-center text-foreground/40">Checking session…</div>;
  }

  if (!user) return null; // redirect to /admin/login already triggered

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav />
      <div className="flex h-screen min-w-0 flex-1 flex-col bg-background">
        <div className="flex flex-none items-center justify-between gap-4 border-b border-foreground/10 bg-background/90 px-5 py-4 backdrop-blur-xl sm:px-8">
          <span className="text-sm font-light text-foreground/40">{crumbFor(pathname)}</span>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-foreground/12 px-3.5 py-1.5 text-xs font-light text-foreground/45">
              ⌘K
            </span>
            <Link
              href="/admin/posts/new"
              className="gradient-cta rounded-full px-4.5 py-2 text-xs font-medium uppercase tracking-widest text-white"
            >
              New post
            </Link>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
