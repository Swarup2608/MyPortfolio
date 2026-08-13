"use client";

import { useEffect, useRef, useState } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Picking a file only stages it locally (object URL preview) — it is not
// uploaded to storage until the parent form calls uploadPendingFile() on submit.
export function ImageUploader({
  existingUrl,
  file,
  onFileSelected,
  onRemove,
}: {
  existingUrl: string;
  file: File | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Syncing to the browser's Blob URL registry, which requires cleanup on
    // change/unmount — not state derivable from render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(selected: File) {
    setError("");
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Only JPEG, PNG, WEBP or GIF images are allowed");
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError("Image must be 5MB or smaller");
      return;
    }
    onFileSelected(selected);
  }

  const displayUrl = file ? previewUrl : existingUrl;

  return (
    <div>
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt=""
          className="aspect-16/10 w-full rounded-2xl border border-foreground/10 bg-background object-cover"
        />
      ) : (
        <div className="flex aspect-16/10 w-full items-center justify-center rounded-2xl border border-dashed border-foreground/20 text-xs font-light text-foreground/40">
          No image
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) handleFile(selected);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex gap-2.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-xl border border-foreground/15 py-2.5 text-center text-xs font-light text-foreground transition-colors hover:bg-foreground/5"
        >
          {displayUrl ? "Replace" : "Choose image"}
        </button>
        {displayUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-foreground/15 px-4 py-2.5 text-xs font-light text-foreground/60 transition-colors hover:bg-foreground/5"
          >
            Remove
          </button>
        )}
      </div>

      {file && !error && (
        <p className="mt-2.5 text-xs font-light text-foreground/40">
          Selected — will upload when you save the post.
        </p>
      )}
      {error && <p className="mt-2.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}
