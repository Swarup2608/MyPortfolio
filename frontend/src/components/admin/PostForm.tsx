"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AdminPost, AdminPostStatus } from "@/types/admin";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent";
const labelClass = "text-xs font-light uppercase tracking-widest text-foreground/40";
const cardClass = "rounded-3xl border border-foreground/10 bg-surface p-6";

interface UploadResponse {
  success: true;
  data: { key: string; url: string };
}

export function PostForm({ post }: { post?: AdminPost }) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const canPublish = usePermission(PERMISSIONS.POSTS_PUBLISH);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage?.url ?? "");
  const [coverImageKey, setCoverImageKey] = useState(post?.coverImage?.key ?? "");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState(post?.category ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo?.description ?? "");
  const [status, setStatus] = useState<AdminPostStatus>(post?.status ?? "DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag)) {
      setTagInput("");
      return;
    }
    setTags([...tags, tag]);
    setTagInput("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // The image is only uploaded to storage now, at submit time — not when it was picked.
      let finalCoverImage = coverImage ? { url: coverImage, key: coverImageKey, alt: title } : undefined;
      if (coverImageFile) {
        const formData = new FormData();
        formData.append("image", coverImageFile);
        const uploaded = await adminFetch<UploadResponse>("/admin/uploads", {
          method: "POST",
          body: formData,
        });
        finalCoverImage = { url: uploaded.data.url, key: uploaded.data.key, alt: title };
      }

      const contentBody = {
        title,
        slug,
        excerpt,
        content,
        coverImage: finalCoverImage,
        tags,
        category: category.trim() || undefined,
        seo: {
          title: seoTitle.trim() || undefined,
          description: seoDescription.trim() || undefined,
          keywords: post?.seo?.keywords ?? [],
        },
      };

      if (isEdit && post) {
        // The update endpoint doesn't accept status changes — that's a
        // separate call so an editor can't slip a publish through a normal save.
        await adminFetch(`/admin/posts/${post._id}`, {
          method: "PATCH",
          body: JSON.stringify(contentBody),
        });
        if (status !== post.status) {
          await adminFetch(`/admin/posts/${post._id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
        }
      } else {
        await adminFetch("/admin/posts", {
          method: "POST",
          body: JSON.stringify({ ...contentBody, status }),
        });
      }
      router.push("/admin/posts");
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
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/posts")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? coverImageFile
                ? "Uploading image…"
                : "Saving…"
              : isEdit
                ? "Save changes"
                : status === "PUBLISHED"
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. How I built my SaaS in a weekend"
              className={`${fieldClass} text-base font-medium`}
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              required
              maxLength={200}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="how-i-built-my-saas-in-a-weekend"
              className={`${fieldClass} font-mono`}
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
            <label className={`${labelClass} mb-2 block`}>Content (Markdown)</label>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>

          <div className="rounded-2xl border border-foreground/10 p-5">
            <div className="mb-3.5 text-sm font-semibold text-foreground">SEO</div>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="seoTitle" className={labelClass}>
                  SEO title
                </label>
                <input
                  id="seoTitle"
                  maxLength={200}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to the post title if left blank"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="seoDescription" className={labelClass}>
                  SEO description
                </label>
                <textarea
                  id="seoDescription"
                  rows={2}
                  maxLength={320}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to the excerpt if left blank"
                  className={fieldClass}
                />
              </div>
            </div>
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
                setCoverImageKey("");
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
              disabled={!canPublish}
              onChange={(e) => setStatus(e.target.value as AdminPostStatus)}
              className={`${fieldClass} disabled:opacity-50`}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {!canPublish && (
              <p className="mt-1.5 text-xs font-light text-foreground/35">
                You don&apos;t have permission to change publish status.
              </p>
            )}

            <label htmlFor="category" className={`${labelClass} mt-5 block`}>
              Category
            </label>
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Engineering"
              className={fieldClass}
            />

            <label htmlFor="tagInput" className={`${labelClass} mt-5 block`}>
              Tags
            </label>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} className="gap-1.5 pr-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="text-foreground/40 hover:text-foreground"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag, press Enter"
                className={`${fieldClass} mt-0 flex-1`}
              />
              <button
                type="button"
                onClick={addTag}
                className="mt-2 rounded-2xl border border-foreground/15 px-4 text-xs font-light text-foreground transition-colors hover:bg-foreground/5"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
