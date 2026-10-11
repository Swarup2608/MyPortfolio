import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { publicFetch, ApiError } from "@/lib/api";
import type { PublicProject, PublicProjectListResponse } from "@/types/project";

const tileGradients = [
  "linear-gradient(135deg, #B600A8 0%, #18011F 100%)",
  "linear-gradient(135deg, #7621B0 0%, #18011F 100%)",
  "linear-gradient(135deg, #BE4C00 0%, #18011F 100%)",
];

function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  return (
    <Reveal delay={(index % 2) * 0.1} y={40} className="h-full">
      <div className="relative flex h-full flex-col rounded-4xl border-2 border-foreground/20 bg-background p-5 transition-colors hover:border-foreground/40 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black leading-none tracking-tighter text-foreground sm:text-5xl">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div>
              <div className="text-xs font-light uppercase tracking-widest text-foreground/55">
                Project
              </div>
              {/* The ::after overlay makes the whole card open the project page;
                  the Live/GitHub links sit above it with relative z-10. */}
              <Link
                href={`/projects/${project.slug}`}
                className="mt-1 block text-lg font-medium uppercase leading-tight text-foreground after:absolute after:inset-0 after:rounded-4xl sm:text-xl"
              >
                {project.title}
              </Link>
            </div>
          </div>
          {(project.liveUrl || project.githubUrl) && (
            <div className="relative z-10 flex gap-2">
              {project.liveUrl && (
                <TrackedLink
                  trackAs="LIVE_CLICK"
                  projectId={project._id}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-foreground/60 px-5 py-2 text-xs font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/10"
                >
                  Live
                </TrackedLink>
              )}
              {project.githubUrl && (
                <TrackedLink
                  trackAs="GITHUB_CLICK"
                  projectId={project._id}
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-foreground/60 px-5 py-2 text-xs font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/10"
                >
                  GitHub
                </TrackedLink>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        <p className="mt-4 text-sm font-light leading-relaxed text-foreground/70">
          {project.shortDescription}
        </p>

        {project.image?.url ? (
          <img
            src={project.image.url}
            alt={project.image.alt || ""}
            loading="lazy"
            className="mt-6 aspect-16/10 w-full rounded-[26px] object-cover"
          />
        ) : (
          <div
            className="mt-6 aspect-16/10 w-full rounded-[26px]"
            style={{ background: tileGradients[index % tileGradients.length] }}
          />
        )}
      </div>
    </Reveal>
  );
}

export async function Projects() {
  let projects: PublicProject[] = [];

  try {
    const data = await publicFetch<PublicProjectListResponse>("/projects", { revalidate: 30 });
    projects = data.data;
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
  }

  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      className="relative z-10 scroll-mt-16 bg-background pb-[clamp(40px,6vw,90px)] pt-[clamp(60px,8vw,120px)]"
      style={{
        borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
        marginTop: "clamp(-56px,-4vw,-40px)",
      }}
    >
      <Container className="max-w-6xl px-[clamp(16px,2.5vw,40px)]">
        <Reveal>
          <h2 className="gradient-text mb-[clamp(40px,6vw,80px)] text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-[0.9] tracking-[-.03em]">
            Project
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project._id} project={project} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
