import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { PostListItem } from "@/types/post";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          loading="lazy"
          className="mb-4 aspect-16/10 w-full rounded-3xl bg-surface object-cover"
        />
      ) : (
        <div className="mb-4 aspect-16/10 w-full rounded-3xl bg-linear-to-br from-accent-soft to-surface" />
      )}
      <div className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">
        {post.tags[0] ?? "Journal"} · {formatDate(post.publishedAt)}
      </div>
      <div className="text-lg font-medium leading-snug text-foreground transition-opacity group-hover:opacity-75 sm:text-xl">
        {post.title}
      </div>
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-foreground/50">
          {post.excerpt}
        </p>
      )}
    </Link>
  );
}
