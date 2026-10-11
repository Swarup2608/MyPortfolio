"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useDialog } from "@/components/ui/Dialog";
import type { PostListItem, PostListResponse } from "@/types/post";

const statusColor = (status?: string) =>
  status === "PUBLISHED" ? "#4ade80" : "rgba(215,226,234,.5)";

export default function AllPostsPage() {
  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  const [error, setError] = useState("");
  const dialog = useDialog();

  function load() {
    adminFetch<PostListResponse>("/admin/posts?limit=100")
      .then((data) => setPosts(data.data))
      .catch(() => setError("Failed to load posts"));
  }

  useEffect(load, []);

  async function handleDelete(post: PostListItem) {
    const deleted = await dialog.confirm({
      tone: "danger",
      title: "Delete this post?",
      message: (
        <>
          <span className="font-normal text-foreground/80">“{post.title}”</span> will be
          permanently removed. This cannot be undone.
        </>
      ),
      confirmText: "Delete",
      onConfirm: () => adminFetch(`/admin/posts/${post._id}`, { method: "DELETE" }),
    });
    if (!deleted) return;
    toast.success("Post deleted");
    load();
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

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {!error && !posts && <p className="mt-6 text-foreground/40">Loading…</p>}
      {posts && posts.length === 0 && (
        <p className="mt-6 text-foreground/40">No posts yet. Create your first one.</p>
      )}

      {posts && posts.length > 0 && (
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
                {posts.map((post) => (
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
                        {post.status?.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground/40">{post.viewCount ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-3.5 text-xs">
                        {post.status === "PUBLISHED" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground/55 hover:text-foreground"
                          >
                            View
                          </a>
                        )}
                        <Link href={`/admin/posts/${post._id}/edit`} className="text-accent">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
