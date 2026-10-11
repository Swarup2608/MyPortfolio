import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { publicFetch } from "@/lib/api";
import type { ProjectListResponse } from "@/types/project";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { data: projects } = await publicFetch<ProjectListResponse>("/projects", { revalidate: 30 });

  return (
    <Container className="max-w-6xl py-16 sm:py-20">
      <div className="text-xs font-medium uppercase tracking-widest text-accent">Portfolio</div>
      <h1 className="gradient-text mt-4 text-6xl font-black uppercase leading-[0.9] tracking-tighter sm:text-8xl">
        Projects
      </h1>
      <p className="mt-5 max-w-lg text-sm font-light text-foreground/55 sm:text-base">
        Things I&apos;ve built, from side projects to production systems.
      </p>

      {projects.length === 0 ? (
        <p className="mt-16 text-center text-foreground/40">No projects published yet — check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </Container>
  );
}
