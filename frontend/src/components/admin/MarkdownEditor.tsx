"use client";

import { useMemo, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import dynamic from "next/dynamic";
import type { ICommand, TextAreaTextApi } from "@uiw/react-md-editor";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { adminFetch } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  // Called with the storage key of every image uploaded from the editor.
  onImageUploaded?: (key: string) => void;
}

interface UploadResponse {
  data: { url: string; key: string };
}

export function MarkdownEditor({ value, onChange, disabled = false, onImageUploaded }: MarkdownEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Set by the toolbar button so the upload can insert at the cursor it was clicked from.
  const toolbarApiRef = useRef<TextAreaTextApi | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Uploads right away (unlike the cover image) and returns the Markdown to insert.
  async function uploadImage(file: File): Promise<string | null> {
    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WEBP or GIF images are allowed");
      return null;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be 5MB or smaller");
      return null;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploaded = await adminFetch<UploadResponse>("/admin/media", {
        method: "POST",
        body: formData,
      });
      onImageUploaded?.(uploaded.data.key);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
      return `![${alt}](${uploaded.data.url})`;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }

  // Paste / drop: insert at the textarea's current selection.
  async function insertIntoTextarea(textarea: HTMLTextAreaElement, file: File) {
    const { selectionStart, selectionEnd } = textarea;
    const markdown = await uploadImage(file);
    if (!markdown) return;
    const current = textarea.value;
    onChange(`${current.slice(0, selectionStart)}${markdown}${current.slice(selectionEnd)}`);
  }

  function firstImage(files: FileList | null | undefined): File | null {
    return Array.from(files ?? []).find((f) => f.type.startsWith("image/")) ?? null;
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const file = firstImage(e.clipboardData.files);
    if (!file) return; // plain text paste behaves as normal
    e.preventDefault();
    void insertIntoTextarea(e.currentTarget, file);
  }

  function handleDrop(e: DragEvent<HTMLTextAreaElement>) {
    const file = firstImage(e.dataTransfer.files);
    if (!file) return;
    e.preventDefault();
    void insertIntoTextarea(e.currentTarget, file);
  }

  const imageCommand = useMemo<ICommand>(
    () => ({
      name: "upload-image",
      keyCommand: "upload-image",
      buttonProps: { "aria-label": "Upload image", title: "Upload image" },
      icon: (
        <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"
          />
        </svg>
      ),
      execute: (_state, api) => {
        toolbarApiRef.current = api;
        inputRef.current?.click();
      },
    }),
    []
  );

  async function handleFilePicked(file: File) {
    const api = toolbarApiRef.current;
    const markdown = await uploadImage(file);
    if (markdown && api) api.replaceSelection(markdown);
  }

  return (
    <div data-color-mode="dark">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) void handleFilePicked(selected);
          e.target.value = "";
        }}
      />
      <MDEditor
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        height={480}
        preview="live"
        extraCommands={[imageCommand]}
        previewOptions={{ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }}
        textareaProps={{
          disabled: disabled || uploading,
          onPaste: handlePaste,
          onDrop: handleDrop,
          placeholder:
            "# Heading\n\nWrite your post in Markdown. **Bold**, _italic_, `code`, lists, and [links](https://example.com) all work.\n\nMath: inline $E \\in \\mathbb{R}^{V \\times d}$ or a block with $$ ... $$.\n\nUpload an image with the toolbar button, or paste / drag one in.",
        }}
      />
      {uploading && <p className="mt-2 text-xs font-light text-foreground/50">Uploading image…</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
