"use client";

import { PostForm } from "@/components/admin/PostForm";
import { NoPermission } from "@/components/admin/NoPermission";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";

export default function NewPostPage() {
  const canCreate = usePermission(PERMISSIONS.POSTS_CREATE);

  if (!canCreate) return <NoPermission section="creating posts" />;

  return <PostForm />;
}
