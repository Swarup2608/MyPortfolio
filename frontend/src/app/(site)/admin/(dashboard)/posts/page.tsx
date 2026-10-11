"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminPost, AdminPostStatus } from "@/types/admin";

interface AdminPostsResponse {
  success: true;
  data: AdminPost[];
}

const statusColor = (status: AdminPostStatus) =>
  status === "PUBLISHED" ? "#4ade80" : status === "ARCHIVED" ? "rgba(215,226,234,.3)" : "rgba(215,226,234,.5)";

const STATUS_FILTERS: { key: "ALL" | AdminPostStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "PUBLISHED", label: "Published" },
  { key: "ARCHIVED", label: "Archived" },
];

export default function AllPostsPage() {
  const [posts, setPosts] = useState<AdminPost[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminPostStatus>("ALL");
  const [pendingDelete, setPendingDelete] = useState<AdminPost | null>(null);
  const canDelete = usePermission(PERMISSIONS.POSTS_DELETE);

  function load() {
    adminFetch<AdminPostsResponse>("/admin/posts")
      .then((data) => setPosts(data.data))
      .catch(() => setError("Failed to load posts"));
  }

  useEffect(load, []);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    const query = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "ALL" || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await adminFetch(`/admin/posts/${pendingDelete._id}`, { method: "DELETE" });
      setPendingDelete(null);
      load();
      toast.success("Post deleted.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete post");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">All posts</h1>
        <Link
          href="/admin/posts/new"
          className="gradient-cta rounded-full px-5.5 py-2.5 text-xs font-medium uppercase tracking-widest text-white"
        >
          + New post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="rounded-full border border-foreground/15 bg-transparent px-4 py-2 text-xs font-light text-foreground outline-none transition-colors focus:border-accent"
        />
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-light transition-colors",
                statusFilter === f.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-foreground/15 text-foreground/55 hover:bg-foreground/5"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !posts && <p className="mt-6 text-foreground/40">Loading…</p>}
      {posts && posts.length > 0 && filteredPosts.length === 0 && (
        <p className="mt-6 text-foreground/40">No posts match these filters.</p>
      )}
      {posts && posts.length === 0 && (
        <p className="mt-6 text-foreground/40">No posts yet. Create your first one.</p>
      )}

      {filteredPosts.length > 0 && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-foreground/10 bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-165 text-sm">
              <thead>
                <tr className="border-b border-foreground/8 text-left text-[.66rem] uppercase tracking-widest text-foreground/35">
                  <th className="px-5 py-3.5 font-light">Title</th>
                  <th className="px-5 py-3.5 font-light">Tags</th>
                  <th className="px-5 py-3.5 font-light">Status</th>
                  <th className="px-5 py-3.5 font-light">Views</th>
                  <th className="px-5 py-3.5 font-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post._id}
                    className="border-b border-foreground/5 transition-colors last:border-b-0 hover:bg-foreground/2"
                  >
                    <td className="px-5 py-3.5 font-normal text-foreground">{post.title}</td>
                    <td className="px-5 py-3.5 text-foreground/40">
                      {post.tags.slice(0, 2).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-normal"
                        style={{ color: statusColor(post.status) }}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground/40">{post.viewCount ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5 text-xs">
                        {post.status === "PUBLISHED" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-foreground/55 hover:text-foreground"
                          >
                            <Eye size={14} /> View
                          </a>
                        )}
                        <Link
                          href={`/admin/posts/${post._id}/edit`}
                          className="flex items-center gap-1 text-accent"
                        >
                          <Pencil size={14} /> Edit
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => setPendingDelete(post)}
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
        title="Delete this post?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.` : undefined}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
