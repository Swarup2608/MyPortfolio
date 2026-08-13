"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { adminFetch } from "@/lib/adminApi";
import type { Post, PostResponse } from "@/types/post";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<PostResponse>(`/admin/posts/${params.id}`)
      .then((data) => setPost(data.post))
      .catch(() => setError("Post not found"));
  }, [params.id]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!post) return <p className="text-foreground/40">Loading…</p>;

  return <PostForm post={post} />;
}
