"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import type { Post, PostStatus } from "@/types/post";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent";
const labelClass = "text-xs font-light uppercase tracking-widest text-foreground/40";
const cardClass = "rounded-3xl border border-foreground/10 bg-surface p-6";

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // The image is only uploaded to storage now, at submit time — not when it was picked.
      let finalCoverImage = coverImage;
      if (coverImageFile) {
        const formData = new FormData();
        formData.append("image", coverImageFile);
        const uploaded = await adminFetch<{ success: true; url: string }>("/media", {
          method: "POST",
          body: formData,
        });
        finalCoverImage = uploaded.url;
      }

      const body = {
        title,
        excerpt,
        content,
        coverImage: finalCoverImage,
        status,
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      };

      if (isEdit && post) {
        await adminFetch(`/admin/posts/${post._id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await adminFetch("/admin/posts", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {isEdit ? "Edit post" : "New post"}
          </h1>
          <p className="mt-1.5 text-sm font-light text-foreground/40">
            {isEdit ? "Update this post and save your changes." : "Write and publish a new post."}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? coverImageFile
                ? "Uploading image…"
                : "Saving…"
              : isEdit
                ? "Save changes"
                : status === "published"
                  ? "Publish"
                  : "Save draft"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-5 text-sm text-red-400">{error}</p>}

      <div className="mt-7 grid gap-4.5 lg:grid-cols-3">
        <div className={`${cardClass} flex flex-col gap-5 lg:col-span-2`}>
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How I built my SaaS in a weekend"
              className={`${fieldClass} text-base font-medium`}
            />
          </div>

          <div>
            <label htmlFor="excerpt" className={labelClass}>
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={2}
              maxLength={400}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A one or two sentence summary shown on the blog list page"
              className={fieldClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="content" className={labelClass}>
                Content (Markdown)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs font-medium uppercase tracking-widest text-accent"
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>
            {showPreview ? (
              <div className="mt-2 min-h-75 rounded-2xl border border-foreground/15 bg-foreground/5 p-5">
                <MarkdownContent content={content} />
              </div>
            ) : (
              <textarea
                id="content"
                required
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  "# Heading\n\nWrite your post in Markdown. **Bold**, _italic_, `code`, lists, and [links](https://example.com) all work."
                }
                className={`${fieldClass} font-mono leading-relaxed`}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4.5">
          <div className={cardClass}>
            <div className="mb-4 text-sm font-semibold text-foreground">Cover image</div>
            <ImageUploader
              existingUrl={coverImage}
              file={coverImageFile}
              onFileSelected={setCoverImageFile}
              onRemove={() => {
                setCoverImageFile(null);
                setCoverImage("");
              }}
            />
          </div>

          <div className={cardClass}>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              className={fieldClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <label htmlFor="tags" className={`${labelClass} mt-5 block`}>
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. nextjs, mongodb, node"
              className={fieldClass}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
