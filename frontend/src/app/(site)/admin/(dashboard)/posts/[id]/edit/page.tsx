"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { NoPermission } from "@/components/admin/NoPermission";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AdminPost } from "@/types/admin";

interface AdminPostResponse {
  success: true;
  data: AdminPost;
}

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const canUpdate = usePermission(PERMISSIONS.POSTS_UPDATE);
  const [post, setPost] = useState<AdminPost | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!canUpdate) return;
    adminFetch<AdminPostResponse>(`/admin/posts/${params.id}`)
      .then((data) => setPost(data.data))
      .catch((err) => setErrorStatus(err instanceof ApiError ? err.status : 0));
  }, [params.id, canUpdate]);

  if (!canUpdate || errorStatus === 403) return <NoPermission section="editing posts" />;
  // The API answers 404 for an unknown id and 400 for a malformed one.
  if (errorStatus === 404 || errorStatus === 400) notFound();
  if (errorStatus !== null) return <p className="text-sm text-red-400">Failed to load post</p>;
  if (!post) return <p className="text-foreground/40">Loading…</p>;

  return <PostForm post={post} />;
}
