import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types/project";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      {project.image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image.url}
          alt={project.image.alt || ""}
          loading="lazy"
          className="mb-4 aspect-16/10 w-full rounded-3xl bg-surface object-cover"
        />
      ) : (
        <div className="mb-4 aspect-16/10 w-full rounded-3xl bg-linear-to-br from-accent-soft to-surface" />
      )}
      {project.featured && (
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">Featured</div>
      )}
      <div className="text-lg font-medium leading-snug text-foreground transition-opacity group-hover:opacity-75 sm:text-xl">
        {project.title}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-foreground/50">
        {project.shortDescription}
      </p>
      {project.technologies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
