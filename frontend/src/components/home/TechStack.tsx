import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { skills } from "@/lib/siteConfig";

const accentColors = ["#B600A8", "#7621B0", "#BE4C00", "#B600A8"];

export function TechStack() {
  return (
    <section className="border-t border-foreground/10 py-20 sm:py-28">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14">
          <Reveal>
            <h2 className="gradient-text text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">
              Tech stack
            </h2>
          </Reveal>
          <p className="max-w-sm text-sm font-light leading-relaxed text-foreground/55 sm:text-base">
            The tools I reach for daily — building, shipping, and keeping things running.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal key={group.category} delay={i * 0.08}>
              <div className="rounded-3xl border border-foreground/10 bg-surface p-7">
                <div
                  className="mb-4 text-sm font-bold uppercase tracking-wide"
                  style={{ color: accentColors[i % accentColors.length] }}
                >
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-foreground/15 px-3.5 py-1.5 text-sm font-light text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
