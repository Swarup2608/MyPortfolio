import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { BlogViewTracker } from "@/components/analytics/BlogViewTracker";
import { formatDate } from "@/lib/utils";
import { publicFetch, ApiError } from "@/lib/api";
import type { PostResponse } from "@/types/post";

async function getPost(slug: string) {
  try {
    const data = await publicFetch<PostResponse>(`/posts/${slug}`, { revalidate: 30 });
    return data.post;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;

  return {
    title,
    description,
    keywords: post.seoKeywords?.length ? post.seoKeywords : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <BlogViewTracker postId={post._id} />
      <Link href="/blog" className="text-sm font-light text-foreground/50 hover:text-foreground">
        ← All posts
      </Link>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="mt-6 aspect-21/9 w-full rounded-3xl bg-surface object-cover"
        />
      )}

      <h1 className="mt-8 text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
        {post.title}
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-foreground/10 pb-6 text-sm font-light text-foreground/45">
        <span>{formatDate(post.publishedAt)}</span>
        <span>&middot;</span>
        <span>{post.readingTimeMinutes} min read</span>
      </div>
      {post.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      )}

      <div className="mt-10">
        <MarkdownContent content={post.content} />
      </div>
    </Container>
  );
}
