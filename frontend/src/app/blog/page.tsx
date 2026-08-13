import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/blog/PostCard";
import { TagFilter } from "@/components/blog/TagFilter";
import { Pagination } from "@/components/blog/Pagination";
import { publicFetch } from "@/lib/api";
import type { PostListResponse } from "@/types/post";

export const metadata: Metadata = { title: "Blog" };

interface TagsResponse {
  success: true;
  tags: string[];
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { page, tag } = await searchParams;
  const pageNum = Number(page) > 0 ? Number(page) : 1;

  const query = new URLSearchParams({ page: String(pageNum), limit: "9" });
  if (tag) query.set("tag", tag);

  const [postsData, tagsData] = await Promise.all([
    publicFetch<PostListResponse>(`/posts?${query.toString()}`, { revalidate: 30 }),
    publicFetch<TagsResponse>("/posts/tags", { revalidate: 60 }),
  ]);

  return (
    <Container className="max-w-6xl py-16 sm:py-20">
      <div className="text-xs font-medium uppercase tracking-widest text-accent">Journal</div>
      <h1 className="gradient-text mt-4 text-6xl font-black uppercase leading-[0.9] tracking-tighter sm:text-8xl">
        Writing
      </h1>
      <p className="mt-5 max-w-lg text-sm font-light text-foreground/55 sm:text-base">
        Notes on projects, engineering, and things I&apos;m learning.
      </p>

      <div className="mt-10 sm:mt-14">
        <TagFilter tags={tagsData.tags} activeTag={tag} />
      </div>

      {postsData.posts.length === 0 ? (
        <p className="mt-16 text-center text-foreground/40">No posts yet — check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {postsData.posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <Pagination pagination={postsData.pagination} basePath="/blog" searchParams={{ tag }} />
    </Container>
  );
}
