"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CoverImage } from "@/types/post";
import type { Project, ProjectStatus } from "@/types/project";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-accent";
const labelClass = "text-xs font-light uppercase tracking-widest text-foreground/40";
const cardClass = "rounded-3xl border border-foreground/10 bg-surface p-6";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEdit = Boolean(project);

  const [title, setTitle] = useState(project?.title ?? "");
  const [shortDescription, setShortDescription] = useState(project?.shortDescription ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [image, setImage] = useState<CoverImage | null>(project?.image ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [technologies, setTechnologies] = useState((project?.technologies ?? []).join(", "));
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState(String(project?.displayOrder ?? 0));
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "DRAFT");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // The image is only uploaded to storage now, at submit time — not when it was picked.
      let finalImage = image;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploaded = await adminFetch<ApiResponse<{ url: string; key: string }>>(
          "/admin/media",
          { method: "POST", body: formData }
        );
        finalImage = { ...uploaded.data, alt: "" };
      }

      const body = {
        title,
        shortDescription,
        description,
        technologies: technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        displayOrder: Number(displayOrder) || 0,
      };

      if (isEdit && project) {
        // null tells the server to remove the existing image or link.
        await adminFetch(`/admin/projects/${project._id}`, {
          method: "PATCH",
          body: JSON.stringify({
            ...body,
            image: finalImage,
            liveUrl: liveUrl.trim() || null,
            githubUrl: githubUrl.trim() || null,
          }),
        });
        // Publishing is a separate permission on the server, so status has its own endpoint.
        if (status !== project.status) {
          await adminFetch(`/admin/projects/${project._id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
        }
      } else {
        await adminFetch("/admin/projects", {
          method: "POST",
          body: JSON.stringify({
            ...body,
            status,
            image: finalImage ?? undefined,
            liveUrl: liveUrl.trim() || undefined,
            githubUrl: githubUrl.trim() || undefined,
          }),
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
            {isEdit
              ? "Update this project and save your changes."
              : "Add a project to the Projects section of your site."}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/projects")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? imageFile
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
              minLength={2}
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Feature Pulse"
              className={`${fieldClass} text-base font-medium`}
            />
          </div>

          <div>
            <label htmlFor="shortDescription" className={labelClass}>
              Short description
            </label>
            <textarea
              id="shortDescription"
              required
              rows={3}
              maxLength={300}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One or two sentences shown on the project card on the home page"
              className={fieldClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="description" className={labelClass}>
                Full description (Markdown)
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
                <MarkdownContent content={description} />
              </div>
            ) : (
              <textarea
                id="description"
                required
                rows={16}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  "## The problem\n\nWhat the project solves, what you built, the tech stack and what you learned."
                }
                className={`${fieldClass} font-mono leading-relaxed`}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4.5">
          <div className={cardClass}>
            <div className="mb-4 text-sm font-semibold text-foreground">Project image</div>
            <ImageUploader
              existingUrl={image?.url ?? ""}
              file={imageFile}
              onFileSelected={setImageFile}
              onRemove={() => {
                setImageFile(null);
                setImage(null);
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
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={fieldClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <label htmlFor="technologies" className={`${labelClass} mt-5 block`}>
              Technologies (comma-separated)
            </label>
            <input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="e.g. MERN Stack, Python, AI"
              className={fieldClass}
            />

            <label htmlFor="displayOrder" className={`${labelClass} mt-5 block`}>
              Display order (lowest first)
            </label>
            <input
              id="displayOrder"
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className={cardClass}>
            <label htmlFor="liveUrl" className={labelClass}>
              Live URL
            </label>
            <input
              id="liveUrl"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://"
              className={fieldClass}
            />

            <label htmlFor="githubUrl" className={`${labelClass} mt-5 block`}>
              GitHub URL
            </label>
            <input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/"
              className={fieldClass}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
