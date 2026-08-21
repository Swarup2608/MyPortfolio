"use client";

import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MarkdownEditor({ value, onChange, disabled = false }: MarkdownEditorProps) {
  return (
    <div data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        height={480}
        preview="live"
        textareaProps={{
          disabled,
          placeholder:
            "# Heading\n\nWrite your post in Markdown. **Bold**, _italic_, `code`, lists, and [links](https://example.com) all work.",
        }}
      />
    </div>
  );
}
