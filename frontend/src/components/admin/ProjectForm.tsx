"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { AdminProject, AdminProjectStatus } from "@/types/admin";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent";
const labelClass = "text-xs font-light uppercase tracking-widest text-foreground/40";
const cardClass = "rounded-3xl border border-foreground/10 bg-surface p-6";

interface UploadResponse {
  success: true;
  data: { key: string; url: string };
}

export function ProjectForm({ project }: { project?: AdminProject }) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const canPublish = usePermission(PERMISSIONS.PROJECTS_PUBLISH);

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [shortDescription, setShortDescription] = useState(project?.shortDescription ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [image, setImage] = useState(project?.image?.url ?? "");
  const [imageKey, setImageKey] = useState(project?.image?.key ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [technologies, setTechnologies] = useState((project?.technologies ?? []).join(", "));
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [displayOrder, setDisplayOrder] = useState(project?.displayOrder ?? 0);
  const [status, setStatus] = useState<AdminProjectStatus>(project?.status ?? "DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let finalImage = image ? { url: image, key: imageKey, alt: title } : undefined;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploaded = await adminFetch<UploadResponse>("/admin/uploads", {
          method: "POST",
          body: formData,
        });
        finalImage = { url: uploaded.data.url, key: uploaded.data.key, alt: title };
      }

      const contentBody = {
        title,
        slug,
        shortDescription,
        description,
        image: finalImage,
        technologies: technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        githubUrl: githubUrl || undefined,
        liveUrl: liveUrl || undefined,
        category: category || undefined,
        featured,
        displayOrder,
      };

      let id = project?._id;
      if (isEdit && project) {
        await adminFetch(`/admin/projects/${project._id}`, {
          method: "PATCH",
          body: JSON.stringify(contentBody),
        });
      } else {
        const created = await adminFetch<{ success: true; data: AdminProject }>("/admin/projects", {
          method: "POST",
          body: JSON.stringify(contentBody),
        });
        id = created.data._id;
      }

      // Projects always start as DRAFT server-side — publish/archive is a
      // separate call so the status can't be slipped through a normal save.
      if (id && status !== (project?.status ?? "DRAFT")) {
        await adminFetch(`/admin/projects/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {isEdit ? "Edit project" : "New project"}
          </h1>
          <p className="mt-1.5 text-sm font-light text-foreground/40">
            {isEdit ? "Update this project and save your changes." : "Add a new portfolio project."}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/projects")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (imageFile ? "Uploading image…" : "Saving…") : isEdit ? "Save changes" : "Create project"}
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
              placeholder="e.g. Portfolio CMS"
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
              placeholder="portfolio-cms"
              className={`${fieldClass} font-mono`}
            />
          </div>

          <div>
            <label htmlFor="shortDescription" className={labelClass}>
              Short description
            </label>
            <textarea
              id="shortDescription"
              required
              rows={2}
              maxLength={300}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A one or two sentence summary shown on project cards"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              required
              rows={12}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full project write-up"
              className={`${fieldClass} leading-relaxed`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="githubUrl" className={labelClass}>
                GitHub URL
              </label>
              <input
                id="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/…"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="liveUrl" className={labelClass}>
                Live URL
              </label>
              <input
                id="liveUrl"
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://…"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4.5">
          <div className={cardClass}>
            <div className="mb-4 text-sm font-semibold text-foreground">Image</div>
            <ImageUploader
              existingUrl={image}
              file={imageFile}
              onFileSelected={setImageFile}
              onRemove={() => {
                setImageFile(null);
                setImage("");
                setImageKey("");
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
              onChange={(e) => setStatus(e.target.value as AdminProjectStatus)}
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

            <label htmlFor="technologies" className={`${labelClass} mt-5 block`}>
              Technologies (comma-separated)
            </label>
            <input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="e.g. Next.js, MongoDB, Node"
              className={fieldClass}
            />

            <label htmlFor="category" className={`${labelClass} mt-5 block`}>
              Category
            </label>
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Web app"
              className={fieldClass}
            />

            <label htmlFor="displayOrder" className={`${labelClass} mt-5 block`}>
              Display order
            </label>
            <input
              id="displayOrder"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className={fieldClass}
            />

            <label className="mt-5 flex items-center gap-2.5 text-sm font-light text-foreground/85">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-foreground/25"
              />
              Featured
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
