import Link from "next/link";
import { cn } from "@/lib/utils";

export function TagFilter({ tags, activeTag }: { tags: string[]; activeTag?: string }) {
  if (tags.length === 0) return null;

  const base = "cursor-pointer rounded-full border px-4.5 py-2.5 text-xs font-medium uppercase tracking-widest";

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={cn(
          base,
          !activeTag
            ? "border-accent bg-accent-soft text-accent"
            : "border-foreground/15 text-foreground/60 hover:bg-foreground/5"
        )}
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/blog?tag=${encodeURIComponent(tag)}`}
          className={cn(
            base,
            activeTag === tag
              ? "border-accent bg-accent-soft text-accent"
              : "border-foreground/15 text-foreground/60 hover:bg-foreground/5"
          )}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
