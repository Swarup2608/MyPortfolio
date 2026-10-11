import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { publicFetch, ApiError } from "@/lib/api";
import type { PublicProjectResponse } from "@/types/project";

const linkClass =
  "rounded-full border-2 border-foreground/60 px-5 py-2 text-xs font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/10";

async function getProject(slug: string) {
  try {
    const data = await publicFetch<PublicProjectResponse>(`/projects/${slug}`, { revalidate: 30 });
    return data.data;
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
  const project = await getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: project.image?.url ? [project.image.url] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link href="/projects"className="text-sm font-light text-foreground/50 hover:text-foreground">
        ← All projects
      </Link>

      {project.image?.url && (
        <img
          src={project.image.url}
          alt={project.image.alt || project.title}
          className="mt-6 aspect-21/9 w-full rounded-3xl bg-surface object-cover"
        />
      )}

      <div className="mt-8 text-xs font-light uppercase tracking-widest text-foreground/55">
        Project
      </div>
      <h1 className="mt-2 text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-5 text-base font-light leading-relaxed text-foreground/70 sm:text-lg">
        {project.shortDescription}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-foreground/10 pb-6">
        {project.liveUrl && (
          <TrackedLink
            trackAs="LIVE_CLICK"
            projectId={project._id}
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Live ↗
          </TrackedLink>
        )}
        {project.githubUrl && (
          <TrackedLink
            trackAs="GITHUB_CLICK"
            projectId={project._id}
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            GitHub ↗
          </TrackedLink>
        )}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <MarkdownContent content={project.description} />
      </div>
    </Container>
  );
}
