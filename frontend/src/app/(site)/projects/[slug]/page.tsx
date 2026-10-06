import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { publicFetch, ApiError } from "@/lib/api";
import type { ProjectResponse } from "@/types/project";

async function getProject(slug: string) {
  try {
    const data = await publicFetch<ProjectResponse>(`/projects/${slug}`, { revalidate: 30 });
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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link href="/projects" className="text-sm font-light text-foreground/50 hover:text-foreground">
        ← All projects
      </Link>

      {project.image?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image.url}
          alt={project.image.alt || ""}
          className="mt-6 aspect-21/9 w-full rounded-3xl bg-surface object-cover"
        />
      )}

      <h1 className="mt-8 text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-4 text-sm font-light leading-relaxed text-foreground/55 sm:text-base">
        {project.shortDescription}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-foreground/10 pb-6">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border-2 border-foreground/40 px-5 py-2 text-xs font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/10"
          >
            Source
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="gradient-cta rounded-full px-5 py-2 text-xs font-medium uppercase tracking-widest text-white"
          >
            Live
          </a>
        )}
      </div>

      {project.technologies.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      )}

      <div className="mt-10 whitespace-pre-wrap text-sm font-light leading-relaxed text-foreground/70">
        {project.description}
      </div>
    </Container>
  );
}
