import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/blog/PostCard";
import { publicFetch, ApiError } from "@/lib/api";
import type { PostListResponse } from "@/types/post";

export async function LatestPosts() {
  let posts: PostListResponse["posts"] = [];

  try {
    const data = await publicFetch<PostListResponse>("/posts?limit=3", { revalidate: 30 });
    posts = data.posts;
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
  }

  if (posts.length === 0) return null;

  return (
    <section className="border-t border-foreground/10 py-20 sm:py-28">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14">
          <h2 className="gradient-text text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">
            Journal
          </h2>
          <Link
            href="/blog"
            className="border-b border-foreground/40 pb-1 text-sm font-medium uppercase tracking-widest text-foreground"
          >
            All posts →
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </Container>
    </section>
  );
}
